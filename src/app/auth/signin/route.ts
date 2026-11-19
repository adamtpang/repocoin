import { safeNext, supabaseAuth } from "@/lib/auth";

/** Starts GitHub sign-in through Supabase Auth. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const sb = await supabaseAuth();
  if (!sb) return Response.json({ error: "sign-in is not configured" }, { status: 503 });
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) return Response.json({ error: "sign-in failed" }, { status: 500 });
  return Response.redirect(data.url, 302);
}
