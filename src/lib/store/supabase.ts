import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toAudit,
  toBond,
  toCredit,
  toLedger,
  toProject,
  type AuditRow,
  type BondRow,
  type LedgerRow,
  type ProjectRow,
  type PullCreditRow,
} from "./rows";
import type { ConnectRepoInput, CreditResult, NewCredit, Store, VoidInput } from "./types";

const UNIQUE_VIOLATION = "23505";

/** Case-insensitive exact match: escape LIKE wildcards (GitHub names allow `_`). */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (m) => `\\${m}`);

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data;
}

/**
 * Supabase-backed store. Construct it with the service role client for the
 * webhook (writes) and with the anon client for public pages (reads only;
 * row level security blocks anon writes).
 */
export class SupabaseStore implements Store {
  constructor(private db: SupabaseClient) {}

  async claimDelivery(deliveryId: string, event: string) {
    const { error } = await this.db
      .from("webhook_deliveries")
      .insert({ delivery_id: deliveryId, event, status: "processing" });
    if (!error) return true;
    if (error.code === UNIQUE_VIOLATION) return false;
    throw new Error(`Supabase: ${error.message}`);
  }

  async finishDelivery(deliveryId: string, outcome: string) {
    check(
      await this.db
        .from("webhook_deliveries")
        .update({ status: "processed", outcome })
        .eq("delivery_id", deliveryId),
    );
  }

  async releaseDelivery(deliveryId: string) {
    check(await this.db.from("webhook_deliveries").delete().eq("delivery_id", deliveryId));
  }

  async getProjectByRepoId(githubRepoId: number) {
    const row = check(
      await this.db.from("projects").select("*").eq("github_repo_id", githubRepoId).maybeSingle(),
    ) as ProjectRow | null;
    return row ? toProject(row) : null;
  }

  async getProjectBySlug(owner: string, repo: string) {
    const row = check(
      await this.db.from("projects").select("*").ilike("owner", escapeLike(owner)).ilike("repo", escapeLike(repo)).maybeSingle(),
    ) as ProjectRow | null;
    return row ? toProject(row) : null;
  }

  async connectRepo(input: ConnectRepoInput) {
    const existing = await this.getProjectByRepoId(input.githubRepoId);
    const common = {
      owner: input.owner,
      repo: input.repo,
      default_branch: input.defaultBranch,
      installation_id: input.installationId,
      installer_github_user_id: input.installerGithubUserId,
      installer_login: input.installerLogin,
      connected: true,
    };
    if (existing) {
      const row = check(
        await this.db.from("projects").update(common).eq("id", existing.id).select("*").single(),
      ) as ProjectRow;
      return toProject(row);
    }
    const row = check(
      await this.db
        .from("projects")
        .insert({
          ...common,
          github_repo_id: input.githubRepoId,
          constitution_markdown: input.constitutionMarkdown,
          points_per_merge: input.params.pointsPerMerge,
          vest_months: input.params.vestMonths,
          cliff_months: input.params.cliffMonths,
          dispute_window_days: input.params.disputeWindowDays,
          min_reputation_to_bond: input.params.minReputationToBond,
        })
        .select("*")
        .single(),
    ) as ProjectRow;
    return toProject(row);
  }

  async setConnected(githubRepoIds: number[], connected: boolean) {
    if (githubRepoIds.length === 0) return;
    check(await this.db.from("projects").update({ connected }).in("github_repo_id", githubRepoIds));
  }

  async updateConstitution(projectId: string, markdown: string, at: string) {
    check(
      await this.db
        .from("projects")
        .update({ constitution_markdown: markdown, constitution_updated_at: at })
        .eq("id", projectId),
    );
  }

  async creditMerge(c: NewCredit): Promise<CreditResult> {
    const id = check(
      await this.db.rpc("credit_merge", {
        p_project_id: c.projectId,
        p_pr_number: c.prNumber,
        p_merge_commit_sha: c.mergeCommitSha,
        p_title: c.title,
        p_author_id: c.authorId,
        p_author_login: c.authorLogin,
        p_reviewer_id: c.reviewerId,
        p_reviewer_login: c.reviewerLogin,
        p_merged_at: c.mergedAt,
        p_points: c.points,
        p_dispute_ends_at: c.disputeEndsAt,
        p_vest_start_at: c.vestStartAt,
        p_cliff_at: c.cliffAt,
        p_vest_end_at: c.vestEndAt,
        p_delivery_id: c.deliveryId,
      }),
    ) as string | null;
    return id ? { status: "credited", creditId: id } : { status: "duplicate" };
  }

  async listCreditsForPr(projectId: string, prNumber: number) {
    const rows = check(
      await this.db.from("pull_credits").select("*").eq("project_id", projectId).eq("pr_number", prNumber),
    ) as PullCreditRow[];
    return rows.map(toCredit);
  }

  async voidCredit(input: VoidInput) {
    return check(
      await this.db.rpc("void_credit", {
        p_credit_id: input.creditId,
        p_reason: input.reason,
        p_by_login: input.byLogin,
        p_at: input.at,
        p_returned_points: input.returnedPoints,
      }),
    ) as boolean;
  }

  async listCredits(projectId: string) {
    const rows = check(
      await this.db
        .from("pull_credits")
        .select("*")
        .eq("project_id", projectId)
        .order("merged_at", { ascending: false }),
    ) as PullCreditRow[];
    return rows.map(toCredit);
  }

  async listLedger(projectId: string) {
    const rows = check(
      await this.db.from("ledger_entries").select("*").eq("project_id", projectId),
    ) as LedgerRow[];
    return rows.map(toLedger);
  }

  async listBonds(projectId: string) {
    const rows = check(
      await this.db.from("role_bonds").select("*").eq("project_id", projectId),
    ) as BondRow[];
    return rows.map(toBond);
  }

  async insertBond(input: Parameters<Store["insertBond"]>[0]) {
    const row = check(
      await this.db
        .from("role_bonds")
        .insert({
          project_id: input.projectId,
          github_user_id: input.githubUserId,
          github_login: input.githubLogin,
          role: input.role,
          bond_points: input.bondPoints,
        })
        .select("*")
        .single(),
    ) as BondRow;
    return toBond(row);
  }

  async audit(
    projectId: string | null,
    action: string,
    actorLogin: string | null,
    detail: Record<string, unknown>,
  ) {
    check(
      await this.db
        .from("audit_log")
        .insert({ project_id: projectId, action, actor_login: actorLogin, detail }),
    );
  }

  async listAudit(projectId: string, limit: number) {
    const rows = check(
      await this.db
        .from("audit_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(limit),
    ) as AuditRow[];
    return rows.map(toAudit);
  }
}
