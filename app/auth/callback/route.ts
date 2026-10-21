import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase sends the email's one-use code here. The saved PKCE verifier must
// be in this browser's cookies; no password or secret belongs in this URL.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (url.searchParams.has("error")) {
    return NextResponse.redirect(new URL("/reset-password?error=expired", url.origin));
  }
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/reset-password", url.origin));
    const reason = error.code === "pkce_code_verifier_not_found" || error.code === "bad_code_verifier"
      ? "browser"
      : error.code === "flow_state_expired" || error.code === "flow_state_not_found" || error.code === "otp_expired"
        ? "expired" : "verification";
    return NextResponse.redirect(new URL(`/reset-password?error=${reason}`, url.origin));
  }
  // A legacy implicit link carries its session in #..., which the server
  // cannot see. A redirect without a fragment preserves it for the browser.
  return NextResponse.redirect(new URL("/reset-password", url.origin));
}
