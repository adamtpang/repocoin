import { randomUUID } from "node:crypto";
import { PaperMarket, type PlaceOrderInput } from "../market";
import type { AuditEntry, LedgerEntry, Project, PullCredit, RoleBond } from "../types";
import type { ConnectRepoInput, CreditResult, NewCredit, Store, VoidInput } from "./types";

/** In-memory store for tests and the fixture demo. Mirrors the SQL constraints. */
export class MemoryStore implements Store {
  deliveries = new Map<string, { event: string; status: string; outcome: string | null }>();
  projects: Project[] = [];
  credits: PullCredit[] = [];
  ledger: LedgerEntry[] = [];
  bonds: RoleBond[] = [];
  auditLog: AuditEntry[] = [];

  market = new PaperMarket();

  /** `now` lets the fixture demo stamp rows with its simulated clock. */
  constructor(private now: () => Date = () => new Date()) {}

  async placePaperOrder(input: PlaceOrderInput) {
    return this.market.place(input);
  }

  async cancelPaperOrder(orderId: string, githubUserId: number) {
    return this.market.cancel(orderId, githubUserId);
  }

  async listOpenPaperOrders(projectId: string) {
    return this.market.orders.filter((o) => o.projectId === projectId && o.status === "open");
  }

  async listPaperFills(projectId: string, limit: number) {
    // Newest first; fills from one order keep their match order.
    return this.market.fills
      .filter((f) => f.projectId === projectId)
      .reverse()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  async listPaperAccounts(projectId: string) {
    return this.market.accounts.filter((a) => a.projectId === projectId);
  }

  async claimDelivery(deliveryId: string, event: string) {
    if (this.deliveries.has(deliveryId)) return false;
    this.deliveries.set(deliveryId, { event, status: "processing", outcome: null });
    return true;
  }

  async finishDelivery(deliveryId: string, outcome: string) {
    const d = this.deliveries.get(deliveryId);
    if (d) Object.assign(d, { status: "processed", outcome });
  }

  async releaseDelivery(deliveryId: string) {
    this.deliveries.delete(deliveryId);
  }

  async getProjectByRepoId(githubRepoId: number) {
    return this.projects.find((p) => p.githubRepoId === githubRepoId) ?? null;
  }

  async getProjectBySlug(owner: string, repo: string) {
    const o = owner.toLowerCase();
    const r = repo.toLowerCase();
    return (
      this.projects.find((p) => p.owner.toLowerCase() === o && p.repo.toLowerCase() === r) ?? null
    );
  }

  async connectRepo(input: ConnectRepoInput) {
    const existing = await this.getProjectByRepoId(input.githubRepoId);
    if (existing) {
      Object.assign(existing, {
        owner: input.owner,
        repo: input.repo,
        defaultBranch: input.defaultBranch,
        installationId: input.installationId,
        installerLogin: input.installerLogin,
        connected: true,
      });
      return existing;
    }
    const project: Project = {
      id: randomUUID(),
      githubRepoId: input.githubRepoId,
      owner: input.owner,
      repo: input.repo,
      defaultBranch: input.defaultBranch,
      installationId: input.installationId,
      installerLogin: input.installerLogin,
      connected: true,
      constitutionMarkdown: input.constitutionMarkdown,
      constitutionUpdatedAt: this.now().toISOString(),
      params: { ...input.params },
    };
    this.projects.push(project);
    return project;
  }

  async setConnected(githubRepoIds: number[], connected: boolean) {
    for (const p of this.projects) if (githubRepoIds.includes(p.githubRepoId)) p.connected = connected;
  }

  async updateConstitution(projectId: string, markdown: string, at: string) {
    const p = this.projects.find((x) => x.id === projectId);
    if (p) Object.assign(p, { constitutionMarkdown: markdown, constitutionUpdatedAt: at });
  }

  async creditMerge(c: NewCredit): Promise<CreditResult> {
    if (c.authorId === c.reviewerId) throw new Error("self-approval cannot be credited");
    const dup = this.credits.some(
      (x) =>
        x.projectId === c.projectId &&
        x.prNumber === c.prNumber &&
        x.mergeCommitSha === c.mergeCommitSha,
    );
    if (dup) return { status: "duplicate" };
    const credit: PullCredit = {
      ...c,
      id: randomUUID(),
      status: "vesting",
      voidedAt: null,
      voidReason: null,
      voidedByLogin: null,
    };
    this.credits.push(credit);
    const now = this.now().toISOString();
    const entry = (ledger: LedgerEntry["ledger"], id: number, login: string, amount: number, reason: string) =>
      this.ledger.push({
        id: randomUUID(),
        projectId: c.projectId,
        ledger,
        githubUserId: id,
        githubLogin: login,
        amount,
        reason,
        pullCreditId: credit.id,
        createdAt: now,
      });
    entry("token_points", c.authorId, c.authorLogin, c.points, `Merged PR #${c.prNumber} (vesting grant)`);
    entry("reputation", c.authorId, c.authorLogin, 1, `Authored merged PR #${c.prNumber}`);
    entry("reputation", c.reviewerId, c.reviewerLogin, 1, `Approved merged PR #${c.prNumber}`);
    await this.audit(c.projectId, "credit_merge", c.authorLogin, {
      pr_number: c.prNumber,
      sha: c.mergeCommitSha,
      reviewer: c.reviewerLogin,
      delivery_id: c.deliveryId,
    });
    return { status: "credited", creditId: credit.id };
  }

  async listCreditsForPr(projectId: string, prNumber: number) {
    return this.credits.filter((c) => c.projectId === projectId && c.prNumber === prNumber);
  }

  async voidCredit(input: VoidInput) {
    const c = this.credits.find((x) => x.id === input.creditId);
    if (!c || c.status !== "vesting") return false;
    Object.assign(c, {
      status: "voided",
      voidedAt: input.at,
      voidReason: input.reason,
      voidedByLogin: input.byLogin,
    });
    const base = { projectId: c.projectId, pullCreditId: c.id, createdAt: input.at };
    if (input.returnedPoints > 0) {
      this.ledger.push({
        ...base,
        id: randomUUID(),
        ledger: "token_points",
        githubUserId: c.authorId,
        githubLogin: c.authorLogin,
        amount: -input.returnedPoints,
        reason: `PR #${c.prNumber} voided: unvested points returned to treasury`,
      });
    }
    this.ledger.push({
      ...base,
      id: randomUUID(),
      ledger: "reputation",
      githubUserId: c.authorId,
      githubLogin: c.authorLogin,
      amount: -1,
      reason: `PR #${c.prNumber} voided by maintainer`,
    });
    await this.audit(c.projectId, "void_credit", input.byLogin, {
      pr_number: c.prNumber,
      reason: input.reason,
      returned_points: input.returnedPoints,
    });
    return true;
  }

  async listCredits(projectId: string) {
    return this.credits
      .filter((c) => c.projectId === projectId)
      .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
  }

  async listLedger(projectId: string) {
    return this.ledger.filter((e) => e.projectId === projectId);
  }

  async listBonds(projectId: string) {
    return this.bonds.filter((b) => b.projectId === projectId);
  }

  async insertBond(input: Parameters<Store["insertBond"]>[0]) {
    const clash = this.bonds.some(
      (b) =>
        b.projectId === input.projectId &&
        b.githubUserId === input.githubUserId &&
        b.role === input.role &&
        b.status === "active",
    );
    if (clash) throw new Error("already holds an active bond for this role");
    const bond: RoleBond = {
      ...input,
      id: randomUUID(),
      status: "active",
      statusReason: null,
      createdAt: this.now().toISOString(),
    };
    this.bonds.push(bond);
    return bond;
  }

  async audit(
    projectId: string | null,
    action: string,
    actorLogin: string | null,
    detail: Record<string, unknown>,
  ) {
    this.auditLog.push({
      id: randomUUID(),
      projectId,
      action,
      actorLogin,
      detail,
      createdAt: this.now().toISOString(),
    });
  }

  async listAudit(projectId: string, limit: number) {
    return this.auditLog
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }
}
