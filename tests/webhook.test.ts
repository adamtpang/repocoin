import { beforeEach, describe, expect, it } from "vitest";
import { computeBalances } from "@/lib/balances";
import { closedPrPayload, FakeGitHub, installPayload, review } from "@/lib/github/fake";
import { CONSTITUTION_PATH, VOID_LABEL } from "@/lib/labels";
import { MemoryStore } from "@/lib/store/memory";
import { handleWebhook, type WebhookDeps } from "@/lib/webhook";

const repoId = 555;
const installationId = 9;
const fullName = "acme/widget";
const maint = { id: 10, login: "maint" };
const dev = { id: 20, login: "dev" };
const rando = { id: 30, login: "rando" };
const mergedAt = "2026-03-01T00:00:00Z";

let store: MemoryStore;
let github: FakeGitHub;
let deps: WebhookDeps;
let clock: Date;

const pr = (number: number, author = dev, sha = `sha${number}`, merged: string | null = mergedAt) =>
  closedPrPayload({ repoId, fullName, installationId, number, title: `PR ${number}`, author, mergedAt: merged, sha });

const approve = (number: number, who = maint, association = "OWNER") =>
  github.reviews.set(number, [review(who, "APPROVED", association, "2026-02-28T00:00:00Z")]);

beforeEach(async () => {
  store = new MemoryStore();
  github = new FakeGitHub();
  clock = new Date("2026-03-02T00:00:00Z");
  deps = { store, github, now: () => clock };
  github.roles.set(maint.login, "admin");
  await handleWebhook("installation", "install-1", installPayload({ installationId, repoId, fullName, sender: maint }), deps);
});

describe("GitHub App webhook pipeline", () => {
  it("connects the repo and publishes a default constitution", async () => {
    const project = await store.getProjectBySlug("acme", "widget");
    expect(project?.connected).toBe(true);
    expect(project?.installerLogin).toBe("maint");
    for (const section of ["Supply and allocations", "Vesting", "Treasury rules", "Rights", "Retained maintainer powers", "What the token is not"]) {
      expect(project?.constitutionMarkdown).toContain(`## ${section}`);
    }
  });

  it("credits a reviewed merge once, with points and reputation", async () => {
    approve(1);
    expect(await handleWebhook("pull_request", "d1", pr(1), deps)).toEqual({ outcome: "credited" });
    expect(store.credits).toHaveLength(1);
    expect(store.credits[0]).toMatchObject({ authorLogin: "dev", reviewerLogin: "maint", points: 100 });
    const rep = store.ledger.filter((e) => e.ledger === "reputation");
    expect(rep.map((e) => e.githubLogin).sort()).toEqual(["dev", "maint"]);
  });

  it("does not credit an unreviewed merge", async () => {
    expect(await handleWebhook("pull_request", "d1", pr(1), deps)).toEqual({ outcome: "rejected:no_approval" });
    expect(store.credits).toHaveLength(0);
    expect(store.ledger).toHaveLength(0);
    expect(store.auditLog.at(-1)).toMatchObject({ action: "credit_rejected", detail: { reason: "no_approval" } });
  });

  it("does not credit a self-approval", async () => {
    approve(1, dev, "COLLABORATOR");
    expect(await handleWebhook("pull_request", "d1", pr(1), deps)).toEqual({ outcome: "rejected:self_approval_only" });
    expect(store.credits).toHaveLength(0);
  });

  it("does not double-credit a duplicate webhook delivery", async () => {
    approve(1);
    await handleWebhook("pull_request", "same-delivery", pr(1), deps);
    expect(await handleWebhook("pull_request", "same-delivery", pr(1), deps)).toEqual({ outcome: "duplicate_delivery" });
    expect(store.credits).toHaveLength(1);
    expect(store.ledger.filter((e) => e.ledger === "token_points")).toHaveLength(1);
  });

  it("does not double-credit the same (project, PR, sha) under a new delivery id", async () => {
    approve(1);
    await handleWebhook("pull_request", "d1", pr(1), deps);
    expect(await handleWebhook("pull_request", "d2", pr(1), deps)).toEqual({ outcome: "duplicate_pr_sha" });
    expect(store.credits).toHaveLength(1);
    expect(store.ledger).toHaveLength(3);
  });

  it("does not credit merges on repos that are not connected, and never calls GitHub for them", async () => {
    approve(1);
    const other = closedPrPayload({ repoId: 999, fullName: "x/y", installationId, number: 1, title: "t", author: dev, mergedAt, sha: "s" });
    expect(await handleWebhook("pull_request", "d1", other, deps)).toEqual({ outcome: "rejected:project_not_connected" });
    await handleWebhook("installation_repositories", "d2", { action: "removed", installation: { id: installationId }, repositories_removed: [{ id: repoId, name: "widget", full_name: fullName }] }, deps);
    expect(await handleWebhook("pull_request", "d3", pr(1), deps)).toEqual({ outcome: "rejected:project_not_connected" });
    expect(github.reviewCalls).toBe(0);
    expect(store.credits).toHaveLength(0);
  });

  it("ignores PRs closed without merging", async () => {
    approve(1);
    expect(await handleWebhook("pull_request", "d1", pr(1, dev, "s", null), deps)).toEqual({ outcome: "rejected:not_merged" });
    expect(store.credits).toHaveLength(0);
  });

  it("does not let a points balance stand in for review standing", async () => {
    // rando has earned plenty of points but has no repo role and no bond.
    for (let n = 1; n <= 5; n++) {
      approve(n);
      await handleWebhook("pull_request", `earn-${n}`, pr(n, rando), deps);
    }
    approve(50, rando, "CONTRIBUTOR");
    expect(await handleWebhook("pull_request", "d50", pr(50), deps)).toEqual({ outcome: "rejected:reviewer_not_qualified" });
  });

  it("lets a maintainer void a credit, which stops vesting and returns unvested points", async () => {
    approve(1);
    await handleWebhook("pull_request", "d1", pr(1), deps);
    clock = new Date("2026-06-01T00:00:00Z");
    const label = {
      action: "labeled",
      label: { name: VOID_LABEL },
      installation: { id: installationId },
      repository: { id: repoId, name: "widget", full_name: fullName },
      sender: maint,
      pull_request: { number: 1 },
    };
    expect(await handleWebhook("pull_request", "void-1", label, deps)).toEqual({ outcome: "voided" });
    const credit = store.credits[0];
    expect(credit.status).toBe("voided");

    const atVoid = computeBalances(store.credits, store.ledger, store.bonds, clock)[0];
    const later = computeBalances(store.credits, store.ledger, store.bonds, new Date("2027-12-01T00:00:00Z"))[0];
    expect(later.vestedPoints).toBe(atVoid.vestedPoints);
    expect(later.unvestedPoints).toBe(0);
    expect(later.returnedPoints).toBe(100 - atVoid.vestedPoints);
    const pointsSum = store.ledger.filter((e) => e.ledger === "token_points").reduce((s, e) => s + e.amount, 0);
    expect(pointsSum).toBe(atVoid.vestedPoints);
  });

  it("refuses a void from someone without admin or maintain", async () => {
    approve(1);
    await handleWebhook("pull_request", "d1", pr(1), deps);
    github.roles.set(rando.login, "triage");
    const label = {
      action: "labeled",
      label: { name: VOID_LABEL },
      installation: { id: installationId },
      repository: { id: repoId, name: "widget", full_name: fullName },
      sender: rando,
      pull_request: { number: 1 },
    };
    expect(await handleWebhook("pull_request", "void-1", label, deps)).toEqual({ outcome: "void_denied" });
    expect(store.credits[0].status).toBe("vesting");
  });

  it("releases the delivery claim on an error so a retry can credit", async () => {
    approve(1);
    const original = github.listReviews.bind(github);
    github.listReviews = async () => {
      throw new Error("GitHub down");
    };
    await expect(handleWebhook("pull_request", "d1", pr(1), deps)).rejects.toThrow("GitHub down");
    github.listReviews = original;
    expect(await handleWebhook("pull_request", "d1", pr(1), deps)).toEqual({ outcome: "credited" });
    expect(store.credits).toHaveLength(1);
  });

  it("publishes a constitution merged into the default branch", async () => {
    github.files.set(CONSTITUTION_PATH, "# Our rules");
    const push = {
      ref: "refs/heads/main",
      after: "deadbeef",
      installation: { id: installationId },
      repository: { id: repoId, name: "widget", full_name: fullName },
      sender: maint,
      commits: [{ modified: [CONSTITUTION_PATH] }],
    };
    expect(await handleWebhook("push", "p1", push, deps)).toEqual({ outcome: "constitution_published" });
    expect((await store.getProjectBySlug("acme", "widget"))?.constitutionMarkdown).toBe("# Our rules");
    expect(await handleWebhook("push", "p2", { ...push, ref: "refs/heads/feature" }, deps)).toEqual({ outcome: "ignored" });
  });
});
