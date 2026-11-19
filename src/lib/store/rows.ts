/**
 * Row shapes for supabase/migrations/20261119000000_init.sql, written by hand
 * to match the checked-in schema. Once a Supabase project exists, regenerate
 * with `npx supabase gen types typescript` and replace this file.
 */
import type { PaperAccount, PaperFill, PaperOrder } from "../market";
import type { AuditEntry, LedgerEntry, Project, PullCredit, RoleBond } from "../types";

export interface ProjectRow {
  id: string;
  github_repo_id: number;
  owner: string;
  repo: string;
  default_branch: string;
  installation_id: number | null;
  installer_github_user_id: number | null;
  installer_login: string | null;
  connected: boolean;
  constitution_markdown: string;
  constitution_updated_at: string;
  points_per_merge: number;
  vest_months: number;
  cliff_months: number;
  dispute_window_days: number;
  min_reputation_to_bond: number;
}

export interface PullCreditRow {
  id: string;
  project_id: string;
  pr_number: number;
  merge_commit_sha: string;
  title: string;
  author_github_user_id: number;
  author_login: string;
  reviewer_github_user_id: number;
  reviewer_login: string;
  merged_at: string;
  points: number;
  status: "vesting" | "voided";
  dispute_ends_at: string;
  vest_start_at: string;
  cliff_at: string;
  vest_end_at: string;
  voided_at: string | null;
  void_reason: string | null;
  voided_by_login: string | null;
  delivery_id: string;
}

export interface LedgerRow {
  id: string;
  project_id: string;
  ledger: "token_points" | "reputation";
  github_user_id: number;
  github_login: string;
  amount: number;
  reason: string;
  pull_credit_id: string | null;
  created_at: string;
}

export interface BondRow {
  id: string;
  project_id: string;
  github_user_id: number;
  github_login: string;
  role: "reviewer" | "steward";
  bond_points: number;
  status: "active" | "released" | "slashed";
  status_reason: string | null;
  created_at: string;
}

export interface AuditRow {
  id: string;
  project_id: string | null;
  action: string;
  actor_login: string | null;
  detail: Record<string, unknown>;
  created_at: string;
}

export interface PaperOrderRow {
  id: string;
  project_id: string;
  github_user_id: number;
  github_login: string;
  side: "buy" | "sell";
  price: number;
  qty: number;
  remaining: number;
  status: "open" | "filled" | "cancelled";
  seq: number;
  created_at: string;
}

export interface PaperFillRow {
  id: string;
  project_id: string;
  buy_order_id: string;
  sell_order_id: string;
  buyer_github_user_id: number;
  buyer_login: string;
  seller_github_user_id: number;
  seller_login: string;
  price: number;
  qty: number;
  created_at: string;
}

export interface PaperAccountRow {
  project_id: string;
  github_user_id: number;
  github_login: string;
  credits: number;
  units_delta: number;
}

export const toPaperOrder = (r: PaperOrderRow): PaperOrder => ({
  id: r.id,
  projectId: r.project_id,
  userId: Number(r.github_user_id),
  login: r.github_login,
  side: r.side,
  price: r.price,
  qty: r.qty,
  remaining: r.remaining,
  status: r.status,
  seq: Number(r.seq),
  createdAt: r.created_at,
});

export const toPaperFill = (r: PaperFillRow): PaperFill => ({
  id: r.id,
  projectId: r.project_id,
  buyOrderId: r.buy_order_id,
  sellOrderId: r.sell_order_id,
  buyerId: Number(r.buyer_github_user_id),
  buyerLogin: r.buyer_login,
  sellerId: Number(r.seller_github_user_id),
  sellerLogin: r.seller_login,
  price: r.price,
  qty: r.qty,
  createdAt: r.created_at,
});

export const toPaperAccount = (r: PaperAccountRow): PaperAccount => ({
  projectId: r.project_id,
  userId: Number(r.github_user_id),
  login: r.github_login,
  credits: Number(r.credits),
  unitsDelta: Number(r.units_delta),
});

export const toProject =(r: ProjectRow): Project => ({
  id: r.id,
  githubRepoId: Number(r.github_repo_id),
  owner: r.owner,
  repo: r.repo,
  defaultBranch: r.default_branch,
  installationId: r.installation_id === null ? null : Number(r.installation_id),
  installerLogin: r.installer_login,
  connected: r.connected,
  constitutionMarkdown: r.constitution_markdown,
  constitutionUpdatedAt: r.constitution_updated_at,
  params: {
    pointsPerMerge: r.points_per_merge,
    vestMonths: r.vest_months,
    cliffMonths: r.cliff_months,
    disputeWindowDays: r.dispute_window_days,
    minReputationToBond: r.min_reputation_to_bond,
  },
});

export const toCredit = (r: PullCreditRow): PullCredit => ({
  id: r.id,
  projectId: r.project_id,
  prNumber: r.pr_number,
  mergeCommitSha: r.merge_commit_sha,
  title: r.title,
  authorId: Number(r.author_github_user_id),
  authorLogin: r.author_login,
  reviewerId: Number(r.reviewer_github_user_id),
  reviewerLogin: r.reviewer_login,
  mergedAt: r.merged_at,
  points: r.points,
  status: r.status,
  disputeEndsAt: r.dispute_ends_at,
  vestStartAt: r.vest_start_at,
  cliffAt: r.cliff_at,
  vestEndAt: r.vest_end_at,
  voidedAt: r.voided_at,
  voidReason: r.void_reason,
  voidedByLogin: r.voided_by_login,
  deliveryId: r.delivery_id,
});

export const toLedger = (r: LedgerRow): LedgerEntry => ({
  id: r.id,
  projectId: r.project_id,
  ledger: r.ledger,
  githubUserId: Number(r.github_user_id),
  githubLogin: r.github_login,
  amount: r.amount,
  reason: r.reason,
  pullCreditId: r.pull_credit_id,
  createdAt: r.created_at,
});

export const toBond = (r: BondRow): RoleBond => ({
  id: r.id,
  projectId: r.project_id,
  githubUserId: Number(r.github_user_id),
  githubLogin: r.github_login,
  role: r.role,
  bondPoints: r.bond_points,
  status: r.status,
  statusReason: r.status_reason,
  createdAt: r.created_at,
});

export const toAudit = (r: AuditRow): AuditEntry => ({
  id: r.id,
  projectId: r.project_id,
  action: r.action,
  actorLogin: r.actor_login,
  detail: r.detail,
  createdAt: r.created_at,
});
