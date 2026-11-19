"use client";

import { useActionState } from "react";
import { placeOrder, type OrderState } from "./actions";

const initial: OrderState = { message: null, ok: false };

export function OrderForm({ owner, repo, ticker }: { owner: string; repo: string; ticker: string }) {
  const [state, action, pending] = useActionState(placeOrder, initial);
  const field = "w-full rounded-md border border-line bg-bg px-3 py-2 num";
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="owner" value={owner} />
      <input type="hidden" name="repo" value={repo} />
      <label className="text-sm">
        <span className="mb-1 block text-muted">Side</span>
        <select name="side" className={field} defaultValue="buy">
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-muted">Paper credits per {ticker} point</span>
        <input name="price" type="number" min={1} step={1} required className={field} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-muted">Quantity</span>
        <input name="qty" type="number" min={1} step={1} required className={field} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-accent px-4 py-2 text-sm text-accent disabled:opacity-50"
      >
        {pending ? "Placing..." : "Place paper order"}
      </button>
      {state.message && (
        <p role="status" className={`text-sm sm:col-span-4 ${state.ok ? "text-accent" : "text-bad"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
