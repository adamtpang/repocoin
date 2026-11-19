"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { computeBalances, sellableBase } from "@/lib/balances";
import { DEMO_OWNER } from "@/lib/labels";
import { validateOrder, type Side } from "@/lib/market";
import { getWriteStore } from "@/lib/store";

export interface OrderState {
  message: string | null;
  ok: boolean;
}

/** Places a paper order for the signed-in GitHub account. Play money only. */
export async function placeOrder(_prev: OrderState, form: FormData): Promise<OrderState> {
  const owner = String(form.get("owner") ?? "");
  const repo = String(form.get("repo") ?? "");
  const side = form.get("side") === "sell" ? "sell" : ("buy" as Side);
  const price = Number(form.get("price"));
  const qty = Number(form.get("qty"));

  if (owner.toLowerCase() === DEMO_OWNER) return { ok: false, message: "The fixture demo is read-only." };
  const invalid = validateOrder(price, qty);
  if (invalid) return { ok: false, message: invalid };

  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "Sign in with GitHub to trade paper points." };
  const store = getWriteStore();
  if (!store) return { ok: false, message: "The paper market is not configured on this deployment." };
  const project = await store.getProjectBySlug(owner, repo);
  if (!project || !project.connected) return { ok: false, message: "This repo is not connected." };

  const [credits, ledger, bonds] = await Promise.all([
    store.listCredits(project.id),
    store.listLedger(project.id),
    store.listBonds(project.id),
  ]);
  const mine = computeBalances(credits, ledger, bonds, new Date()).find(
    (b) => b.githubUserId === viewer.githubUserId,
  );

  const result = await store.placePaperOrder({
    projectId: project.id,
    userId: viewer.githubUserId,
    login: viewer.login,
    side,
    price,
    qty,
    sellableBase: sellableBase(mine),
    at: new Date().toISOString(),
  });
  revalidatePath(`/${project.owner}/${project.repo}/market`);
  if (!result.ok) return { ok: false, message: result.reason };
  return {
    ok: true,
    message: result.filled > 0 ? `Order placed. ${result.filled} filled on paper.` : "Order placed on the paper book.",
  };
}

export async function cancelOrder(form: FormData): Promise<void> {
  const owner = String(form.get("owner") ?? "");
  const repo = String(form.get("repo") ?? "");
  const orderId = String(form.get("orderId") ?? "");
  if (owner.toLowerCase() === DEMO_OWNER) return;
  const viewer = await getViewer();
  const store = getWriteStore();
  if (!viewer || !store || !orderId) return;
  await store.cancelPaperOrder(orderId, viewer.githubUserId);
  revalidatePath(`/${owner}/${repo}/market`);
}
