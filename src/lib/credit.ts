import type { Project, RoleBond } from "./types";

/** The parts of a `pull_request` webhook payload the credit rules need. */
export interface MergedPullRequest {
  number: number;
  title: string;
  merged: boolean;
  mergeCommitSha: string | null;
  mergedAt: string | null;
  baseRef: string;
  authorId: number;
  authorLogin: string;
  authorType: string;
}

export type ReviewState =
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "COMMENTED"
  | "DISMISSED"
  | "PENDING";

export interface PullReview {
  userId: number;
  userLogin: string;
  userType: string;
  state: ReviewState;
  /** GitHub's author_association on the review (OWNER, MEMBER, COLLABORATOR, ...). */
  authorAssociation: string;
  submittedAt: string;
}

export type RejectReason =
  | "project_not_connected"
  | "not_merged"
  | "not_default_branch"
  | "bot_author"
  | "no_approval"
  | "self_approval_only"
  | "reviewer_not_qualified";

export type CreditDecision =
  | { credit: true; reviewer: { id: number; login: string } }
  | { credit: false; reason: RejectReason };

export const REJECT_LABEL: Record<RejectReason, string> = {
  project_not_connected: "Repo is not connected",
  not_merged: "Closed without merging",
  not_default_branch: "Merged into a branch other than the default branch",
  bot_author: "Authored by a bot",
  no_approval: "Merged without an approving review",
  self_approval_only: "Only approval was the author's own",
  reviewer_not_qualified: "Approver is not a qualified reviewer",
};

/** Associations that mean the reviewer has a standing role on the repo. */
const MAINTAINER_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

/**
 * GitHub semantics: a reviewer's current verdict is their latest APPROVED,
 * CHANGES_REQUESTED, or DISMISSED review. Comments and pending reviews do not
 * change it.
 */
export function currentApprovers(reviews: PullReview[]): PullReview[] {
  const latest = new Map<number, PullReview>();
  const ordered = [...reviews].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  );
  for (const review of ordered) {
    if (review.state === "COMMENTED" || review.state === "PENDING") continue;
    latest.set(review.userId, review);
  }
  return [...latest.values()]
    .filter((r) => r.state === "APPROVED")
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
}

/**
 * A reviewer qualifies by standing on the repo (owner, org member,
 * collaborator) or by an active reviewer bond. Holding points does not
 * qualify anyone: there is no balance check here on purpose.
 */
export function isQualifiedReviewer(
  review: PullReview,
  activeBonds: Pick<RoleBond, "githubUserId" | "role" | "status">[],
): boolean {
  if (review.userType === "Bot") return false;
  if (MAINTAINER_ASSOCIATIONS.has(review.authorAssociation)) return true;
  return activeBonds.some(
    (b) => b.githubUserId === review.userId && b.role === "reviewer" && b.status === "active",
  );
}

/**
 * Only merged, reviewed, accepted work earns. A credit needs: a connected
 * project, a merge into the default branch, a human author, and a current
 * approval from a qualified reviewer who is not the author.
 */
export function evaluateMerge(
  project: Pick<Project, "connected" | "defaultBranch"> | null,
  pr: MergedPullRequest,
  reviews: PullReview[],
  activeBonds: Pick<RoleBond, "githubUserId" | "role" | "status">[],
): CreditDecision {
  if (!project || !project.connected) return { credit: false, reason: "project_not_connected" };
  if (!pr.merged || !pr.mergeCommitSha || !pr.mergedAt) return { credit: false, reason: "not_merged" };
  if (pr.baseRef !== project.defaultBranch) return { credit: false, reason: "not_default_branch" };
  if (pr.authorType === "Bot") return { credit: false, reason: "bot_author" };

  const approvers = currentApprovers(reviews);
  if (approvers.length === 0) return { credit: false, reason: "no_approval" };

  const others = approvers.filter((r) => r.userId !== pr.authorId);
  if (others.length === 0) return { credit: false, reason: "self_approval_only" };

  const qualified = others.find((r) => isQualifiedReviewer(r, activeBonds));
  if (!qualified) return { credit: false, reason: "reviewer_not_qualified" };

  return { credit: true, reviewer: { id: qualified.userId, login: qualified.userLogin } };
}
