import type { PullReview } from "../credit";
import type { GitHubApi, RepoRole } from "./api";

/** In-memory GitHub for tests and the fixture demo. No network. */
export class FakeGitHub implements GitHubApi {
  reviews = new Map<number, PullReview[]>();
  roles = new Map<string, RepoRole>();
  files = new Map<string, string>();
  defaultBranch = "main";
  reviewCalls = 0;

  async listReviews(_i: number, _o: string, _r: string, prNumber: number) {
    this.reviewCalls += 1;
    return this.reviews.get(prNumber) ?? [];
  }
  async getRole(_i: number, _o: string, _r: string, login: string) {
    return this.roles.get(login) ?? "none";
  }
  async getDefaultBranch() {
    return this.defaultBranch;
  }
  async getFile(_i: number, _o: string, _r: string, path: string) {
    return this.files.get(path) ?? null;
  }
}

export const review = (
  user: { id: number; login: string; type?: string },
  state: PullReview["state"],
  authorAssociation: string,
  submittedAt: string,
): PullReview => ({
  userId: user.id,
  userLogin: user.login,
  userType: user.type ?? "User",
  state,
  authorAssociation,
  submittedAt,
});

/** Builds `pull_request` closed payloads in GitHub's shape. */
export function closedPrPayload(opts: {
  repoId: number;
  fullName: string;
  installationId: number;
  number: number;
  title: string;
  author: { id: number; login: string; type?: string };
  mergedAt: string | null;
  sha: string | null;
  baseRef?: string;
}) {
  const [, name] = opts.fullName.split("/");
  return {
    action: "closed",
    installation: { id: opts.installationId },
    repository: { id: opts.repoId, name, full_name: opts.fullName },
    sender: { id: opts.author.id, login: opts.author.login },
    pull_request: {
      number: opts.number,
      title: opts.title,
      merged: opts.mergedAt !== null,
      merge_commit_sha: opts.sha,
      merged_at: opts.mergedAt,
      base: { ref: opts.baseRef ?? "main" },
      user: { id: opts.author.id, login: opts.author.login, type: opts.author.type ?? "User" },
    },
  };
}

export function installPayload(opts: {
  installationId: number;
  repoId: number;
  fullName: string;
  sender: { id: number; login: string };
}) {
  const [, name] = opts.fullName.split("/");
  return {
    action: "created",
    installation: { id: opts.installationId },
    sender: opts.sender,
    repositories: [{ id: opts.repoId, name, full_name: opts.fullName }],
  };
}
