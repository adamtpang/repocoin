import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { PaperMarket } from "@/lib/market";

/**
 * Runs the checked-in migrations on a real Postgres (PGlite, in process) and
 * exercises the SQL functions: credit idempotency, self-approval, void, and
 * the paper market matched against the TypeScript reference engine.
 */
const dir = join(process.cwd(), "supabase", "migrations");
let db: PGlite;
let projectId: string;

beforeAll(async () => {
  db = new PGlite();
  // Supabase provides these roles; the migrations revoke from them.
  await db.exec("create role anon; create role authenticated;");
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(dir, f), "utf8"));
  }
  const r = await db.query<{ id: string }>(
    `insert into projects (github_repo_id, owner, repo, constitution_markdown)
     values (1, 'acme', 'widget', '# c') returning id`,
  );
  projectId = r.rows[0].id;
}, 60_000);

const credit = (pr: number, sha: string, author = 20, reviewer = 10) =>
  db.query<{ id: string | null }>(
    `select credit_merge($1, $2, $3, 't', $4, 'a', $5, 'r', now(), 100, now(), now(), now() + interval '1 month', now() + interval '12 months', 'd') as id`,
    [projectId, pr, sha, author, reviewer],
  );

describe("SQL: credit_merge and void_credit", () => {
  it("credits once per (project, PR, sha) and writes both ledgers", async () => {
    const first = await credit(1, "abc");
    expect(first.rows[0].id).not.toBeNull();
    const again = await credit(1, "abc");
    expect(again.rows[0].id).toBeNull();
    const n = await db.query<{ n: number }>(
      "select count(*)::int as n from ledger_entries where pull_credit_id = $1",
      [first.rows[0].id],
    );
    expect(n.rows[0].n).toBe(3);
  });

  it("refuses a self-approved credit at the database level", async () => {
    await expect(credit(2, "def", 20, 20)).rejects.toThrow(/no_self_approval/);
  });

  it("voids only once and records the returned points", async () => {
    const c = await credit(3, "ghi");
    const id = c.rows[0].id;
    const v1 = await db.query<{ ok: boolean }>("select void_credit($1, 'farmed', 'maint', now(), 100) as ok", [id]);
    const v2 = await db.query<{ ok: boolean }>("select void_credit($1, 'farmed', 'maint', now(), 100) as ok", [id]);
    expect([v1.rows[0].ok, v2.rows[0].ok]).toEqual([true, false]);
    const sum = await db.query<{ s: number }>(
      "select sum(amount)::int as s from ledger_entries where pull_credit_id = $1 and ledger = 'token_points'",
      [id],
    );
    expect(sum.rows[0].s).toBe(0);
  });
});

describe("SQL: paper market matches the reference engine", () => {
  it("produces the same fills and balances as src/lib/market.ts", async () => {
    const script: Array<[number, "buy" | "sell", number, number, number]> = [
      [1, "sell", 12, 5, 100],
      [2, "sell", 10, 5, 100],
      [3, "sell", 10, 5, 100],
      [4, "buy", 12, 8, 0],
      [4, "buy", 11, 50, 0],
      [1, "sell", 11, 7, 100],
      [5, "buy", 100, 101, 0], // rejected: not enough credits
      [2, "sell", 9, 96, 100], // rejected: only 95 unreserved units left
      [2, "buy", 10, 3, 100], // skips nothing of its own; rests
      [3, "sell", 10, 2, 100], // fills user 2's bid
    ];
    const ref = new PaperMarket();
    for (const [user, side, price, qty, base] of script) {
      const r = ref.place({ projectId, userId: user, login: `u${user}`, side, price, qty, sellableBase: base, at: "x" });
      const s = await db.query<{ r: { ok: boolean; filled?: number } }>(
        "select place_paper_order($1, $2, $3, $4, $5, $6, $7) as r",
        [projectId, user, `u${user}`, side, price, qty, base],
      );
      expect({ ok: s.rows[0].r.ok, filled: s.rows[0].r.filled }).toEqual({
        ok: r.ok,
        filled: r.ok ? r.filled : undefined,
      });
    }
    const fills = await db.query<{ buyer: number; seller: number; price: number; qty: number }>(
      `select buyer_github_user_id::int as buyer, seller_github_user_id::int as seller, price, qty
         from paper_fills where project_id = $1 order by seq`,
      [projectId],
    );
    const key = (f: { buyer: number; seller: number; price: number; qty: number }) =>
      `${f.buyer}-${f.seller}-${f.price}-${f.qty}`;
    expect(fills.rows.map(key).sort()).toEqual(
      ref.fills.map((f) => key({ buyer: f.buyerId, seller: f.sellerId, price: f.price, qty: f.qty })).sort(),
    );
    const accts = await db.query<{ u: number; credits: number; delta: number }>(
      "select github_user_id::int as u, credits::int as credits, units_delta::int as delta from paper_accounts where project_id = $1",
      [projectId],
    );
    for (const a of accts.rows) {
      const r = ref.accounts.find((x) => x.userId === a.u)!;
      expect({ u: a.u, credits: a.credits, delta: a.delta }).toEqual({ u: r.userId, credits: r.credits, delta: r.unitsDelta });
    }
  });

  it("cancels only the owner's open order", async () => {
    const s = await db.query<{ r: { order_id: string } }>(
      "select place_paper_order($1, 7, 'u7', 'buy', 1, 1, 0) as r",
      [projectId],
    );
    const id = s.rows[0].r.order_id;
    const c = (u: number) => db.query<{ ok: boolean }>("select cancel_paper_order($1, $2) as ok", [id, u]);
    expect((await c(8)).rows[0].ok).toBe(false);
    expect((await c(7)).rows[0].ok).toBe(true);
    expect((await c(7)).rows[0].ok).toBe(false);
  });
});
