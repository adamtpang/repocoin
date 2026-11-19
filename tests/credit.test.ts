import { describe, expect, it } from "vitest";
import { evaluateMerge, type MergedPullRequest } from "@/lib/credit";
import { review } from "@/lib/github/fake";

const project = { connected: true, defaultBranch: "main" };
const author = { id: 1, login: "author" };
const maint = { id: 2, login: "maint" };
const outsider = { id: 3, login: "outsider" };
const pr: MergedPullRequest = {
  number: 7,
  title: "t",
  merged: true,
  mergeCommitSha: "abc",
  mergedAt: "2026-01-10T00:00:00Z",
  baseRef: "main",
  authorId: author.id,
  authorLogin: author.login,
  authorType: "User",
};

describe("credit rules: only merged, reviewed, accepted work earns", () => {
  it("does not credit an unreviewed merge", () => {
    expect(evaluateMerge(project, pr, [], [])).toEqual({ credit: false, reason: "no_approval" });
  });

  it("does not credit a self-approval", () => {
    const reviews = [review(author, "APPROVED", "OWNER", "2026-01-09T00:00:00Z")];
    expect(evaluateMerge(project, pr, reviews, [])).toEqual({ credit: false, reason: "self_approval_only" });
  });

  it("credits a merge approved by a maintainer who is not the author", () => {
    const reviews = [
      review(author, "APPROVED", "OWNER", "2026-01-08T00:00:00Z"),
      review(maint, "APPROVED", "MEMBER", "2026-01-09T00:00:00Z"),
    ];
    expect(evaluateMerge(project, pr, reviews, [])).toEqual({ credit: true, reviewer: maint });
  });

  it("ignores comments but honors a later change request or dismissal", () => {
    const approve = review(maint, "APPROVED", "OWNER", "2026-01-08T00:00:00Z");
    const comment = review(maint, "COMMENTED", "OWNER", "2026-01-09T00:00:00Z");
    expect(evaluateMerge(project, pr, [approve, comment], []).credit).toBe(true);
    const changes = review(maint, "CHANGES_REQUESTED", "OWNER", "2026-01-09T00:00:00Z");
    expect(evaluateMerge(project, pr, [approve, changes], [])).toEqual({ credit: false, reason: "no_approval" });
    const dismissed = review(maint, "DISMISSED", "OWNER", "2026-01-09T00:00:00Z");
    expect(evaluateMerge(project, pr, [approve, dismissed], []).credit).toBe(false);
  });

  it("does not credit an approval from someone with no standing and no bond", () => {
    const reviews = [review(outsider, "APPROVED", "CONTRIBUTOR", "2026-01-09T00:00:00Z")];
    expect(evaluateMerge(project, pr, reviews, [])).toEqual({ credit: false, reason: "reviewer_not_qualified" });
  });

  it("credits an approval from an active bonded reviewer", () => {
    const reviews = [review(outsider, "APPROVED", "CONTRIBUTOR", "2026-01-09T00:00:00Z")];
    const bonds = [{ githubUserId: outsider.id, role: "reviewer" as const, status: "active" as const }];
    expect(evaluateMerge(project, pr, reviews, bonds)).toEqual({ credit: true, reviewer: outsider });
    const slashed = [{ ...bonds[0], status: "slashed" as const }];
    expect(evaluateMerge(project, pr, reviews, slashed).credit).toBe(false);
  });

  it("does not credit bot approvals, bot authors, other branches, or unconnected repos", () => {
    const botReview = [review({ id: 9, login: "ci[bot]", type: "Bot" }, "APPROVED", "OWNER", "2026-01-09T00:00:00Z")];
    expect(evaluateMerge(project, pr, botReview, []).credit).toBe(false);
    const ok = [review(maint, "APPROVED", "OWNER", "2026-01-09T00:00:00Z")];
    expect(evaluateMerge(project, { ...pr, authorType: "Bot" }, ok, [])).toEqual({ credit: false, reason: "bot_author" });
    expect(evaluateMerge(project, { ...pr, baseRef: "dev" }, ok, [])).toEqual({ credit: false, reason: "not_default_branch" });
    expect(evaluateMerge({ ...project, connected: false }, pr, ok, [])).toEqual({ credit: false, reason: "project_not_connected" });
    expect(evaluateMerge(null, pr, ok, [])).toEqual({ credit: false, reason: "project_not_connected" });
    expect(evaluateMerge(project, { ...pr, merged: false }, ok, [])).toEqual({ credit: false, reason: "not_merged" });
  });
});
