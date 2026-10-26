import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sendDueNudges } from "@/lib/nudges/send";

// The hourly bell (spec.md > External Services > Supabase, Cron). Supabase
// calls this with "Authorization: Bearer CRON_SECRET". Anyone else is turned
// away before anything is read or sent.

function authorized(header: string | null) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  const given = Buffer.from(header);
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(request: Request) {
  if (!authorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }
  const results = await sendDueNudges();
  return NextResponse.json({
    checked: results.length,
    sent: results.filter((r) => r.result.sent).length,
  });
}
