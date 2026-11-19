import { evaluateMerge, type MergedPullRequest } from "./credit";
import { defaultConstitution } from "./constitution";
import { CONSTITUTION_PATH, VOID_LABEL } from "./labels";
import type { GitHubApi } from "./github/api";
import type { Store } from "./store/types";
import { DEFAULT_PARAMS, type Project } from "./types";
import { vestedPoints, vestingSchedule } from "./vesting";

export interface WebhookDeps {
  store: Store;
  github: GitHubApi;
  now: () => Date;
}

export interface WebhookResult {
  outcome: string;
}

/* Loose shapes of the GitHub payload fields we read. */
interface Account {
  id: number;
  login: string;
  type?: string;
}
interface RepoRef {
  id: number;
  name: string;
  full_name: string;
  default_branch?: string;
}
interface Payload {
  action?: string;
  installation?: { id: number };
  sender?: Account;
  repository?: RepoRef & { owner?: Account };
  repositories?: RepoRef[];
  repositories_added?: RepoRef[];
  repositories_removed?: RepoRef[];
  label?: { name: string };
  pull_request?: {
    number: number;
    title: string;
    merged: boolean;
    merge_commit_sha: string | null;
    merged_at: string | null;
    base: { ref: string };
    user: Account;
  };
  ref?: string;
  after?: string;
  commits?: Array<{ added?: string[]; modified?: string[] }>;
}

/**
 * Entry point for every verified GitHub App delivery. The delivery id is
 * claimed first, so a redelivered event is a no-op. A processing error
 * releases the claim so GitHub's retry can run again.
 */
export async function handleWebhook(
  event: string,
  deliveryId: string,
  /** The parsed JSON body of a verified delivery. */
  payload: unknown,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  const claimed = await deps.store.claimDelivery(deliveryId, event);
  if (!claimed) return { outcome: "duplicate_delivery" };
  try {
    const result = await dispatch(event, deliveryId, payload as Payload, deps);
    await deps.store.finishDelivery(deliveryId, result.outcome);
    return result;
  } catch (err) {
    await deps.store.releaseDelivery(deliveryId);
    throw err;
  }
}

async function dispatch(
  event: string,
  deliveryId: string,
  payload: Payload,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  switch (event) {
    case "ping":
      return { outcome: "pong" };
    case "installation":
      if (payload.action === "created" || payload.action === "unsuspend") {
        return connectRepos(payload.repositories ?? [], payload, deps);
      }
      if (payload.action === "deleted" || payload.action === "suspend") {
        await deps.store.setConnected((payload.repositories ?? []).map((r) => r.id), false);
        return { outcome: "disconnected" };
      }
      return { outcome: "ignored" };
    case "installation_repositories":
      if (payload.repositories_removed?.length) {
        await deps.store.setConnected(payload.repositories_removed.map((r) => r.id), false);
      }
      if (payload.repositories_added?.length) {
        return connectRepos(payload.repositories_added, payload, deps);
      }
      return { outcome: "disconnected" };
    case "pull_request":
      if (payload.action === "closed") return onPullClosed(deliveryId, payload, deps);
      if (payload.action === "labeled" && payload.label?.name === VOID_LABEL) {
        return onVoidLabel(payload, deps);
      }
      return { outcome: "ignored" };
    case "push":
      return onPush(payload, deps);
    default:
      return { outcome: "ignored" };
  }
}

/**
 * GitHub only lets someone with admin rights on a repo install an App on it,
 * so the installation itself is the proof that the installer maintains it.
 */
async function connectRepos(repos: RepoRef[], payload: Payload, deps: WebhookDeps) {
  const installationId = payload.installation?.id;
  const sender = payload.sender;
  if (!installationId || !sender) return { outcome: "ignored" };
  for (const r of repos) {
    const [owner, repo] = r.full_name.split("/");
    const defaultBranch = await deps.github.getDefaultBranch(installationId, owner, repo);
    const project = await deps.store.connectRepo({
      githubRepoId: r.id,
      owner,
      repo,
      defaultBranch,
      installationId,
      installerGithubUserId: sender.id,
      installerLogin: sender.login,
      constitutionMarkdown: defaultConstitution(owner, repo, DEFAULT_PARAMS),
      params: DEFAULT_PARAMS,
    });
    const published = await deps.github.getFile(installationId, owner, repo, CONSTITUTION_PATH, defaultBranch);
    if (published) {
      await deps.store.updateConstitution(project.id, published, deps.now().toISOString());
    }
    await deps.store.audit(project.id, "connect", sender.login, { installation_id: installationId });
  }
  return { outcome: "connected" };
}

async function onPullClosed(
  deliveryId: string,
  payload: Payload,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  const raw = payload.pull_request;
  const repoId = payload.repository?.id;
  if (!raw || !repoId) return { outcome: "ignored" };
  const project = await deps.store.getProjectByRepoId(repoId);
  const pr: MergedPullRequest = {
    number: raw.number,
    title: raw.title,
    merged: raw.merged,
    mergeCommitSha: raw.merge_commit_sha,
    mergedAt: raw.merged_at,
    baseRef: raw.base.ref,
    authorId: raw.user.id,
    authorLogin: raw.user.login,
    authorType: raw.user.type ?? "User",
  };

  // Cheap checks first: no GitHub call for unconnected repos or unmerged PRs.
  const pre = evaluateMerge(project, pr, [], []);
  if (!pre.credit && pre.reason !== "no_approval") {
    return reject(project, pr, pre.reason, deps);
  }

  const p = project as Project;
  const installationId = payload.installation?.id ?? p.installationId;
  if (!installationId) return reject(p, pr, "project_not_connected", deps);
  const [owner, repo] = [p.owner, p.repo];
  const reviews = await deps.github.listReviews(installationId, owner, repo, pr.number);
  const bonds = (await deps.store.listBonds(p.id)).filter((b) => b.status === "active");
  const decision = evaluateMerge(p, pr, reviews, bonds);
  if (!decision.credit) return reject(p, pr, decision.reason, deps);

  const schedule = vestingSchedule(new Date(pr.mergedAt!), p.params);
  const result = await deps.store.creditMerge({
    projectId: p.id,
    prNumber: pr.number,
    mergeCommitSha: pr.mergeCommitSha!,
    title: pr.title,
    authorId: pr.authorId,
    authorLogin: pr.authorLogin,
    reviewerId: decision.reviewer.id,
    reviewerLogin: decision.reviewer.login,
    mergedAt: new Date(pr.mergedAt!).toISOString(),
    points: p.params.pointsPerMerge,
    disputeEndsAt: schedule.disputeEndsAt.toISOString(),
    vestStartAt: schedule.vestStartAt.toISOString(),
    cliffAt: schedule.cliffAt.toISOString(),
    vestEndAt: schedule.vestEndAt.toISOString(),
    deliveryId,
  });
  return { outcome: result.status === "credited" ? "credited" : "duplicate_pr_sha" };
}

async function reject(
  project: Project | null,
  pr: MergedPullRequest,
  reason: string,
  deps: WebhookDeps,
): Promise<WebhookResult> {
  // Unmerged closes are routine; only record merged PRs that did not earn.
  if (project && reason !== "not_merged") {
    await deps.store.audit(project.id, "credit_rejected", pr.authorLogin, {
      pr_number: pr.number,
      reason,
    });
  }
  return { outcome: `rejected:${reason}` };
}

/** A maintainer (admin or maintain role) voids a credit by labeling the PR. */
async function onVoidLabel(payload: Payload, deps: WebhookDeps): Promise<WebhookResult> {
  const raw = payload.pull_request;
  const repoId = payload.repository?.id;
  const sender = payload.sender;
  if (!raw || !repoId || !sender) return { outcome: "ignored" };
  const project = await deps.store.getProjectByRepoId(repoId);
  if (!project) return { outcome: "ignored" };
  const installationId = payload.installation?.id ?? project.installationId;
  if (!installationId) return { outcome: "ignored" };

  const role = await deps.github.getRole(installationId, project.owner, project.repo, sender.login);
  if (role !== "admin" && role !== "maintain") {
    await deps.store.audit(project.id, "void_denied", sender.login, { pr_number: raw.number, role });
    return { outcome: "void_denied" };
  }

  const now = deps.now();
  let voided = 0;
  for (const c of await deps.store.listCreditsForPr(project.id, raw.number)) {
    if (c.status !== "vesting") continue;
    const ok = await deps.store.voidCredit({
      creditId: c.id,
      reason: `Maintainer added the ${VOID_LABEL} label`,
      byLogin: sender.login,
      at: now.toISOString(),
      returnedPoints: c.points - vestedPoints(c, now),
    });
    if (ok) voided += 1;
  }
  return { outcome: voided > 0 ? "voided" : "nothing_to_void" };
}

/** Merging `.repocoin/constitution.md` into the default branch publishes it. */
async function onPush(payload: Payload, deps: WebhookDeps): Promise<WebhookResult> {
  const repoId = payload.repository?.id;
  if (!repoId || !payload.after) return { outcome: "ignored" };
  const project = await deps.store.getProjectByRepoId(repoId);
  if (!project || !project.connected) return { outcome: "ignored" };
  if (payload.ref !== `refs/heads/${project.defaultBranch}`) return { outcome: "ignored" };
  const touched = (payload.commits ?? []).some((c) =>
    [...(c.added ?? []), ...(c.modified ?? [])].includes(CONSTITUTION_PATH),
  );
  if (!touched) return { outcome: "ignored" };
  const installationId = payload.installation?.id ?? project.installationId;
  if (!installationId) return { outcome: "ignored" };
  const text = await deps.github.getFile(
    installationId,
    project.owner,
    project.repo,
    CONSTITUTION_PATH,
    payload.after,
  );
  if (!text) return { outcome: "ignored" };
  await deps.store.updateConstitution(project.id, text, deps.now().toISOString());
  await deps.store.audit(project.id, "publish_constitution", payload.sender?.login ?? null, {
    sha: payload.after,
  });
  return { outcome: "constitution_published" };
}
