import { describe, expect, it } from "vitest";
import { bookLevels, PAPER_START_CREDITS, PaperMarket } from "@/lib/market";

const P = "proj";
const at = "2026-11-19T00:00:00Z";
const order = (m: PaperMarket, userId: number, side: "buy" | "sell", price: number, qty: number, sellableBase = 0) =>
  m.place({ projectId: P, userId, login: `u${userId}`, side, price, qty, sellableBase, at });

describe("paper market engine", () => {
  it("rests an order that does not cross", () => {
    const m = new PaperMarket();
    expect(order(m, 1, "sell", 10, 5, 100)).toMatchObject({ ok: true, filled: 0 });
    expect(order(m, 2, "buy", 9, 5)).toMatchObject({ ok: true, filled: 0 });
    expect(bookLevels(m.orders)).toEqual({
      bids: [{ price: 9, qty: 5, orders: 1 }],
      asks: [{ price: 10, qty: 5, orders: 1 }],
    });
  });

  it("fills at the resting price, best price first, then time", () => {
    const m = new PaperMarket();
    order(m, 1, "sell", 12, 5, 100);
    order(m, 2, "sell", 10, 5, 100);
    order(m, 3, "sell", 10, 5, 100);
    expect(order(m, 4, "buy", 12, 8)).toMatchObject({ ok: true, filled: 8 });
    expect(m.fills.map((f) => [f.sellerId, f.price, f.qty])).toEqual([
      [2, 10, 5],
      [3, 10, 3],
    ]);
    const buyer = m.account(P, 4, "u4");
    expect(buyer.credits).toBe(PAPER_START_CREDITS - 80);
    expect(buyer.unitsDelta).toBe(8);
    expect(m.account(P, 2, "u2")).toMatchObject({ credits: PAPER_START_CREDITS + 50, unitsDelta: -5 });
  });

  it("never sells more than unbonded vested points plus paper buys", () => {
    const m = new PaperMarket();
    expect(order(m, 1, "sell", 10, 6, 5)).toMatchObject({ ok: false });
    expect(order(m, 1, "sell", 10, 5, 5)).toMatchObject({ ok: true });
    expect(order(m, 1, "sell", 10, 1, 5)).toMatchObject({ ok: false });
  });

  it("never spends more paper credits than the account has unreserved", () => {
    const m = new PaperMarket();
    expect(order(m, 1, "buy", 100, 101)).toMatchObject({ ok: false });
    expect(order(m, 1, "buy", 100, 60)).toMatchObject({ ok: true });
    expect(order(m, 1, "buy", 100, 41)).toMatchObject({ ok: false });
  });

  it("skips your own resting orders", () => {
    const m = new PaperMarket();
    order(m, 1, "sell", 10, 5, 100);
    expect(order(m, 1, "buy", 10, 5)).toMatchObject({ ok: true, filled: 0 });
    expect(m.fills).toHaveLength(0);
  });

  it("lets only the owner cancel an open order", () => {
    const m = new PaperMarket();
    const r = order(m, 1, "sell", 10, 5, 100);
    if (!r.ok) throw new Error("expected ok");
    expect(m.cancel(r.orderId, 2)).toBe(false);
    expect(m.cancel(r.orderId, 1)).toBe(true);
    expect(m.cancel(r.orderId, 1)).toBe(false);
    expect(bookLevels(m.orders).asks).toEqual([]);
  });

  it("rejects bad prices and quantities", () => {
    const m = new PaperMarket();
    expect(order(m, 1, "buy", 0, 1)).toMatchObject({ ok: false });
    expect(order(m, 1, "buy", 1.5, 1)).toMatchObject({ ok: false });
    expect(order(m, 1, "buy", 1, -3)).toMatchObject({ ok: false });
  });
});
