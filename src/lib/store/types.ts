import type {
  AuditEntry,
  BondRole,
  LedgerEntry,
  Project,
  ProjectParams,
  PullCredit,
  RoleBond,
} from "../types";

export interface ConnectRepoInput {
  githubRepoId: number;
  owner: string;
  repo: string;
  defaultBranch: string;
  installationId: number;
  installerGithubUserId: number;
  installerLogin: string;
  constitutionMarkdown: string;
  params: ProjectParams;
}

export type NewCredit = Omit<
  PullCredit,
  "id" | "status" | "voidedAt" | "voidReason" | "voidedByLogin"
>;

export type CreditResult = { status: "credited"; creditId: string } | { status: "duplicate" };

export interface VoidInput {
  creditId: string;
  reason: string;
  byLogin: string;
  at: string;
  /** Unvested points at void time, returned to the treasury. */
  returnedPoints: number;
}

/**
 * Persistence for the prototype. Supabase in a deployed app, in-memory for
 * tests and the fixture demo. Both enforce the same idempotency rules.
 */
export interface Store {
  /** Returns false if this delivery id was already claimed. */
  claimDelivery(deliveryId: string, event: string): Promise<boolean>;
  finishDelivery(deliveryId: string, outcome: string): Promise<void>;
  /** Releases a claim after a processing error so GitHub's redelivery can retry. */
  releaseDelivery(deliveryId: string): Promise<void>;

  getProjectByRepoId(githubRepoId: number): Promise<Project | null>;
  getProjectBySlug(owner: string, repo: string): Promise<Project | null>;
  connectRepo(input: ConnectRepoInput): Promise<Project>;
  setConnected(githubRepoIds: number[], connected: boolean): Promise<void>;
  updateConstitution(projectId: string, markdown: string, at: string): Promise<void>;

  /** Atomic and idempotent on (projectId, prNumber, mergeCommitSha). */
  creditMerge(credit: NewCredit): Promise<CreditResult>;
  listCreditsForPr(projectId: string, prNumber: number): Promise<PullCredit[]>;
  /** Voids a vesting credit. Returns false if it was not vesting. */
  voidCredit(input: VoidInput): Promise<boolean>;

  listCredits(projectId: string): Promise<PullCredit[]>;
  listLedger(projectId: string): Promise<LedgerEntry[]>;
  listBonds(projectId: string): Promise<RoleBond[]>;
  insertBond(input: {
    projectId: string;
    githubUserId: number;
    githubLogin: string;
    role: BondRole;
    bondPoints: number;
  }): Promise<RoleBond>;

  audit(
    projectId: string | null,
    action: string,
    actorLogin: string | null,
    detail: Record<string, unknown>,
  ): Promise<void>;
  listAudit(projectId: string, limit: number): Promise<AuditEntry[]>;
}
