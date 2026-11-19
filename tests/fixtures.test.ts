import { describe, expect, it } from "vitest";
import { computeBalances } from "@/lib/balances";
import { demoStore, DEMO_REPO } from "@/lib/fixtures";
import { DEMO_OWNER } from "@/lib/labels";

describe("fixture demo", () => {
  it("runs through the real pipeline and credits only accepted work", async () => {
    const store = await demoStore();
    const project = await store.getProjectBySlug(DEMO_OWNER, DEMO_REPO);
    expect(project).not.toBeNull();
    const credits = await store.listCredits(project!.id);
    expect(credits.map((c) => c.prNumber).sort((a, b) => a - b)).toEqual([9, 12, 15, 18, 19, 24, 26]);
    expect(credits.find((c) => c.prNumber === 19)?.status).toBe("voided");
    expect(credits.find((c) => c.prNumber === 24)?.reviewerLogin).toBe("dev-ana");
    const rejected = store.auditLog.filter((a) => a.action === "credit_rejected").map((a) => a.detail.reason);
    expect(rejected.sort()).toEqual(["bot_author", "no_approval", "self_approval_only"]);
    const balances = computeBalances(credits, await store.listLedger(project!.id), await store.listBonds(project!.id), new Date());
    expect(balances.find((b) => b.login === "spam-sam")?.unvestedPoints).toBe(0);

    // Paper market trades left earned points untouched.
    const fills = await store.listPaperFills(project!.id, 50);
    expect(fills.map((f) => [f.buyerLogin, f.sellerLogin, f.price, f.qty])).toEqual(
      expect.arrayContaining([
        ["acme-corp", "dev-ana", 6, 40],
        ["acme-corp", "dev-ben", 7, 10],
      ]),
    );
    expect(fills[0].price).toBe(7); // newest fill first, even within one order
    expect((await store.listLedger(project!.id)).some((e) => e.githubLogin === "acme-corp")).toBe(false);
  });
});
