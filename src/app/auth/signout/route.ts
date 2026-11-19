import { NextResponse } from "next/server";
import { safeNext, supabaseAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const sb = await supabaseAuth();
  if (sb) await sb.auth.signOut();
  return NextResponse.redirect(new URL(safeNext(url.searchParams.get("next")), url.origin), 303);
}
