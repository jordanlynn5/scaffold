import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { JOIN_LASTS_DAYS } from "./channel";

// Records a WhatsApp message arriving from someone (spec.md > Components >
// WhatsApp Inbox). `from` is Twilio's "whatsapp:+34600000000".
//
// The sandbox only passes on messages from people who have joined it, so any
// message proves they are a member right now. Twilio may not pass on the
// "join ..." message itself, so a join is recorded either way: from the join
// message, or from the first message after the last recorded join expired.
export async function recordInbound(from: string, body: string, now = new Date()) {
  const number = from.replace(/^whatsapp:/, "");
  if (!/^\+\d{8,15}$/.test(number)) return [];
  const db = createAdminClient();
  const { data: people, error } = await db.from("profiles")
    .select("id, whatsapp_joined_at").eq("whatsapp", number);
  if (error) throw error;

  const expired = (at: string | null) =>
    !at || now.getTime() - new Date(at).getTime() >= JOIN_LASTS_DAYS * 24 * 60 * 60 * 1000;
  const isJoin = /^\s*join\s+\S+/i.test(body);

  for (const person of people ?? []) {
    const update: Record<string, string> = { whatsapp_last_inbound_at: now.toISOString() };
    if (isJoin || expired(person.whatsapp_joined_at)) update.whatsapp_joined_at = now.toISOString();
    const { error: updateError } = await db.from("profiles").update(update).eq("id", person.id);
    if (updateError) throw updateError;
  }
  return (people ?? []).map((p) => p.id);
}
