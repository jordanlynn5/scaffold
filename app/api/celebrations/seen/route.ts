import { NextResponse } from "next/server";
import { findProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";

// Closing a celebration marks it shown, so it is never shown twice.
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  const profile = await findProfile();
  if (!profile) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const { id } = await request.json().catch(() => ({}));
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Unknown celebration." }, { status: 400 });
  const { error } = await createAdminClient().from("pending_celebrations")
    .update({ shown_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", profile.id).is("shown_at", null);
  if (error) return NextResponse.json({ error: "That didn’t save." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
