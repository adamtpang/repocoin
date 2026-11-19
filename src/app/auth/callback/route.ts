import { NextResponse } from "next/server";
import { safeNext, supabaseAuth } from "@/lib/auth";

/** GitHub sends the user back here; exchange the code for a session cookie. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const sb = await supabaseAuth();
  if (sb && code) await sb.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(next, url.origin));
}
