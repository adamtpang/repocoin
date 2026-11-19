import { createClient } from "@supabase/supabase-js";
import { demoStore } from "../fixtures";
import { DEMO_OWNER } from "../labels";
import { SupabaseStore } from "./supabase";
import type { Store } from "./types";

export type DataMode = "fixture" | "supabase" | "unconfigured";

const opts = { auth: { persistSession: false, autoRefreshToken: false } };

/** Public pages: the fixture demo, or Supabase read with the anon key. */
export async function getReadStore(owner: string): Promise<{ store: Store | null; mode: DataMode }> {
  if (owner.toLowerCase() === DEMO_OWNER) return { store: await demoStore(), mode: "fixture" };
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return { store: null, mode: "unconfigured" };
  return { store: new SupabaseStore(createClient(url, anon, opts)), mode: "supabase" };
}

/** Webhook writes: Supabase with the service role key. Server only. */
export function getWriteStore(): Store | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return new SupabaseStore(createClient(url, key, opts));
}
