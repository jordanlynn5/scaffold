import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase sends the email's one-use code here. The saved PKCE verifier must
// be in this browser's cookies; no password or secret belongs in this URL.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/reset-password", url.origin));
  }
  return NextResponse.redirect(new URL("/reset-password?error=expired", url.origin));
}
