import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase Auth session cookie before market pages render, so
 * a signed-in trader stays signed in. Does nothing when auth is not set up.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !anon) return response;

  const sb = createServerClient(url, anon, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  await sb.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/:owner/:repo/market"],
};
