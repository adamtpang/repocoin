export interface ProjectParams {
  /** Prototype points minted per credited merge. Assumption. */
  pointsPerMerge: number;
  vestMonths: number;
  cliffMonths: number;
  disputeWindowDays: number;
  /** Reputation needed before someone may post a role bond. Assumption. */
  minReputationToBond: number;
}

export const DEFAULT_PARAMS: ProjectParams = {
  pointsPerMerge: 100,
  vestMonths: 12,
  cliffMonths: 1,
  disputeWindowDays: 7,
  minReputationToBond: 3,
};

export interface Project {
  id: string;
  githubRepoId: number;
  owner: string;
  repo: string;
  defaultBranch: string;
  installationId: number | null;
  installerLogin: string | null;
  connected: boolean;
  constitutionMarkdown: string;
  constitutionUpdatedAt: string;
  params: ProjectParams;
}

export type CreditStatus = "vesting" | "voided";

export interface PullCredit {
  id: string;
  projectId: string;
  prNumber: number;
  mergeCommitSha: string;
  title: string;
  authorId: number;
  authorLogin: string;
  reviewerId: number;
  reviewerLogin: string;
  mergedAt: string;
  points: number;
  status: CreditStatus;
  disputeEndsAt: string;
  vestStartAt: string;
  cliffAt: string;
  vestEndAt: string;
  voidedAt: string | null;
  voidReason: string | null;
  voidedByLogin: string | null;
  deliveryId: string;
}

export type Ledger = "token_points" | "reputation";

export interface LedgerEntry {
  id: string;
  projectId: string;
  ledger: Ledger;
  githubUserId: number;
  githubLogin: string;
  amount: number;
  reason: string;
  pullCreditId: string | null;
  createdAt: string;
}

export type BondRole = "reviewer" | "steward";
export type BondStatus = "active" | "released" | "slashed";

export interface RoleBond {
  id: string;
  projectId: string;
  githubUserId: number;
  githubLogin: string;
  role: BondRole;
  bondPoints: number;
  status: BondStatus;
  statusReason: string | null;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  projectId: string | null;
  action: string;
  actorLogin: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
}
