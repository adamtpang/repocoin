import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Who is signed in, by GitHub identity. Paper accounts are keyed by GitHub user id. */
export interface Viewer {
  githubUserId: number;
  login: string;
}

export function authConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

/** Supabase Auth client bound to the request cookies. Null when not configured. */
export async function supabaseAuth() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server Components cannot set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** The signed-in GitHub account, verified with Supabase Auth. */
export async function getViewer(): Promise<Viewer | null> {
  const sb = await supabaseAuth();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  const meta = data.user?.user_metadata as { provider_id?: string; user_name?: string } | undefined;
  const id = Number(meta?.provider_id);
  if (!data.user || !Number.isInteger(id) || id <= 0 || !meta?.user_name) return null;
  return { githubUserId: id, login: meta.user_name };
}

/** Only same-site relative paths, so the sign-in flow cannot redirect elsewhere. */
export function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}
