import { randomUUID } from "node:crypto";

/**
 * The paper market. Play money only: nothing here is redeemable, nothing
 * leaves this page, and no paper price is a price for any future token.
 *
 * Trades never touch the earned-points ledger. Each person's paper position
 * starts from their unbonded vested points (`sellableBase`) and moves only by
 * paper fills. Buyers start with PAPER_START_CREDITS of play money.
 *
 * This engine is the reference for the SQL function `place_paper_order` in
 * supabase/migrations; tests run the same scenarios against both.
 */

/** Play money each account starts with, per project. Assumption. */
export const PAPER_START_CREDITS = 10_000;
export const MAX_PRICE = 1_000_000;
export const MAX_QTY = 1_000_000;

export type Side = "buy" | "sell";

export interface PaperOrder {
  id: string;
  projectId: string;
  userId: number;
  login: string;
  side: Side;
  price: number;
  qty: number;
  remaining: number;
  status: "open" | "filled" | "cancelled";
  seq: number;
  createdAt: string;
}

export interface PaperAccount {
  projectId: string;
  userId: number;
  login: string;
  credits: number;
  unitsDelta: number;
}

export interface PaperFill {
  id: string;
  projectId: string;
  buyOrderId: string;
  sellOrderId: string;
  buyerId: number;
  buyerLogin: string;
  sellerId: number;
  sellerLogin: string;
  price: number;
  qty: number;
  createdAt: string;
}

export interface PlaceOrderInput {
  projectId: string;
  userId: number;
  login: string;
  side: Side;
  price: number;
  qty: number;
  /** Unbonded vested points, computed by the app from the ledger. */
  sellableBase: number;
  at: string;
}

export type PlaceResult =
  | { ok: true; orderId: string; filled: number }
  | { ok: false; reason: string };

export function validateOrder(price: number, qty: number): string | null {
  if (!Number.isInteger(price) || price < 1 || price > MAX_PRICE) {
    return `Price must be a whole number of paper credits from 1 to ${MAX_PRICE.toLocaleString("en-US")}.`;
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return `Quantity must be a whole number from 1 to ${MAX_QTY.toLocaleString("en-US")}.`;
  }
  return null;
}

export class PaperMarket {
  orders: PaperOrder[] = [];
  accounts: PaperAccount[] = [];
  fills: PaperFill[] = [];
  private seq = 0;

  account(projectId: string, userId: number, login: string): PaperAccount {
    let a = this.accounts.find((x) => x.projectId === projectId && x.userId === userId);
    if (!a) {
      a = { projectId, userId, login, credits: PAPER_START_CREDITS, unitsDelta: 0 };
      this.accounts.push(a);
    }
    return a;
  }

  private open(projectId: string) {
    return this.orders.filter((o) => o.projectId === projectId && o.status === "open");
  }

  place(input: PlaceOrderInput): PlaceResult {
    const invalid = validateOrder(input.price, input.qty);
    if (invalid) return { ok: false, reason: invalid };
    const acct = this.account(input.projectId, input.userId, input.login);
    const mine = this.open(input.projectId).filter((o) => o.userId === input.userId);

    if (input.side === "buy") {
      const reserved = mine.filter((o) => o.side === "buy").reduce((s, o) => s + o.price * o.remaining, 0);
      if (acct.credits - reserved < input.price * input.qty) {
        return { ok: false, reason: "Not enough unreserved paper credits." };
      }
    } else {
      const reserved = mine.filter((o) => o.side === "sell").reduce((s, o) => s + o.remaining, 0);
      if (input.sellableBase + acct.unitsDelta - reserved < input.qty) {
        return { ok: false, reason: "Not enough unreserved paper units to sell." };
      }
    }

    const order: PaperOrder = {
      id: randomUUID(),
      projectId: input.projectId,
      userId: input.userId,
      login: input.login,
      side: input.side,
      price: input.price,
      qty: input.qty,
      remaining: input.qty,
      status: "open",
      seq: ++this.seq,
      createdAt: input.at,
    };

    // Price-time priority. Fills execute at the resting order's price.
    // Your own resting orders are skipped (no self-trades).
    const makers = this.open(input.projectId)
      .filter((o) => o.side !== input.side && o.userId !== input.userId)
      .filter((o) => (input.side === "buy" ? o.price <= input.price : o.price >= input.price))
      .sort((a, b) => (input.side === "buy" ? a.price - b.price : b.price - a.price) || a.seq - b.seq);

    let filled = 0;
    for (const maker of makers) {
      if (order.remaining === 0) break;
      const q = Math.min(order.remaining, maker.remaining);
      const buy = input.side === "buy" ? order : maker;
      const sell = input.side === "buy" ? maker : order;
      const buyer = this.account(input.projectId, buy.userId, buy.login);
      const seller = this.account(input.projectId, sell.userId, sell.login);
      buyer.credits -= maker.price * q;
      buyer.unitsDelta += q;
      seller.credits += maker.price * q;
      seller.unitsDelta -= q;
      order.remaining -= q;
      maker.remaining -= q;
      if (maker.remaining === 0) maker.status = "filled";
      filled += q;
      this.fills.push({
        id: randomUUID(),
        projectId: input.projectId,
        buyOrderId: buy.id,
        sellOrderId: sell.id,
        buyerId: buy.userId,
        buyerLogin: buy.login,
        sellerId: sell.userId,
        sellerLogin: sell.login,
        price: maker.price,
        qty: q,
        createdAt: input.at,
      });
    }
    if (order.remaining === 0) order.status = "filled";
    this.orders.push(order);
    return { ok: true, orderId: order.id, filled };
  }

  cancel(orderId: string, userId: number): boolean {
    const o = this.orders.find((x) => x.id === orderId);
    if (!o || o.userId !== userId || o.status !== "open") return false;
    o.status = "cancelled";
    return true;
  }
}

export interface BookLevel {
  price: number;
  qty: number;
  orders: number;
}

/** Aggregates open orders into price levels: bids high to low, asks low to high. */
export function bookLevels(orders: PaperOrder[]): { bids: BookLevel[]; asks: BookLevel[] } {
  const level = (side: Side) => {
    const m = new Map<number, BookLevel>();
    for (const o of orders) {
      if (o.status !== "open" || o.side !== side) continue;
      const l = m.get(o.price) ?? { price: o.price, qty: 0, orders: 0 };
      l.qty += o.remaining;
      l.orders += 1;
      m.set(o.price, l);
    }
    return [...m.values()].sort((a, b) => (side === "buy" ? b.price - a.price : a.price - b.price));
  };
  return { bids: level("buy"), asks: level("sell") };
}
