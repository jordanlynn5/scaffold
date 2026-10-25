import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { whatsappBlocked, type Blocked } from "./channel";
import { clockInZone, isDue } from "./due";
import { nudgeEmailHtml, writeNudge } from "./message";
import { sandboxJoin, sendWhatsApp } from "./whatsapp";
import { sendEmail } from "./email";

// The Nudge Sender (spec.md > Components > Nudge Sender). Both the hourly bell and "Send my nudge now" in Profile come through here, so the button
// sends a real nudge through the real path.
// Roll-forward (bringPlanUpToDate) and the missed-day messages join this in
// checklist slices 8 and 9; for now every nudge is the normal one.

const profileColumns =
  "id, name, email, whatsapp, whatsapp_consent, whatsapp_joined_at, whatsapp_last_inbound_at, timezone, nudge_time";

type Person = {
  id: string; name: string | null; email: string; whatsapp: string | null;
  whatsapp_consent: boolean; whatsapp_joined_at: string | null;
  whatsapp_last_inbound_at: string | null; timezone: string; nudge_time: string;
};

export type NudgeResult =
  | { sent: true; channel: "whatsapp" | "email"; id: string; fellBack: boolean }
  | { sent: false; reason: "no-task" | "already-done" | "already-sent" | "too-soon" | "failed" };

// A manual send waits a minute after the last one, so a double tap can't
// send twice. Scheduled nudges are limited to one a day by the database.
const MANUAL_GAP_MS = 60_000;

export async function sendNudge(
  userId: string,
  trigger: "scheduled" | "manual",
  now = new Date(),
): Promise<NudgeResult> {
  const db = createAdminClient();
  const { data: person, error } = await db.from("profiles")
    .select(profileColumns).eq("id", userId).single<Person>();
  if (error) throw error;

  const today = clockInZone(person.timezone, now).date;
  const { data: project, error: projectError } = await db.from("projects")
    .select("id, wish, outcome, obstacle").eq("user_id", userId).eq("status", "active").maybeSingle();
  if (projectError) throw projectError;
  if (!project) return { sent: false, reason: "no-task" };
  const { data: task, error: taskError } = await db.from("tasks")
    .select("title, how_to, minutes, count, minutes_per_item, status")
    .eq("project_id", project.id).eq("scheduled_date", today).maybeSingle();
  if (taskError) throw taskError;
  if (!task) return { sent: false, reason: "no-task" };
  if (trigger === "scheduled" && task.status === "done") return { sent: false, reason: "already-done" };

  if (trigger === "manual") {
    const { data: last } = await db.from("nudge_log").select("created_at")
      .eq("user_id", userId).eq("trigger", "manual")
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (last && now.getTime() - new Date(last.created_at).getTime() < MANUAL_GAP_MS) {
      return { sent: false, reason: "too-soon" };
    }
  }

  // Claim today's nudge before sending. A second bell finds the row taken.
  const { data: claim, error: claimError } = await db.from("nudge_log")
    .insert({ user_id: userId, sent_on: today, trigger, kind: "normal", created_at: now.toISOString() })
    .select("id").single();
  if (claimError) {
    if (claimError.code === "23505") return { sent: false, reason: "already-sent" };
    throw claimError;
  }

  let lineSaved = false;
  try {
    const message = await writeNudge(
      { name: person.name, wish: project.wish, outcome: project.outcome, obstacle: project.obstacle },
      task,
    );
    // Home keeps the nudge even when the email provider cannot deliver it.
    const { error: lineError } = await db.from("nudge_log")
      .update({ line: message.line }).eq("id", claim.id);
    if (lineError) throw lineError;
    lineSaved = true;
    const blocked = whatsappBlocked(person, now);
    let channel: "whatsapp" | "email" = "email";
    let id: string | null = null;
    let fellBack = false;
    if (!blocked) {
      try {
        id = await sendWhatsApp(person.whatsapp!, message.whatsapp);
        channel = "whatsapp";
      } catch (problem) {
        console.error("WhatsApp nudge failed, sending by email instead", problem);
        fellBack = true;
      }
    }
    if (!id) {
      id = await sendEmail(
        person.email,
        message.subject,
        nudgeEmailHtml(message, task, reconnectNote(fellBack ? "quiet" : blocked)),
        message.text,
      );
    }
    const { error: receiptError } = await db.from("nudge_log")
      .update({ channel, provider_id: id }).eq("id", claim.id);
    // The provider has accepted it: retain the claim even if saving its
    // receipt fails, so another scheduler call cannot send it again.
    if (receiptError) console.error("Nudge receipt could not be saved", receiptError.code);
    return { sent: true, channel, id, fellBack };
  } catch (problem) {
    console.error("Nudge failed", problem);
    // Keep Sarah's line available on Home if delivery failed. A manual send
    // can retry after a minute; daily scheduling still runs only once.
    if (!lineSaved) await db.from("nudge_log").delete().eq("id", claim.id);
    return { sent: false, reason: "failed" };
  }
}

// The line under an emailed nudge, saying why it came by email.
function reconnectNote(blocked: Blocked | null) {
  if (!blocked || blocked === "switched-off") return null;
  if (blocked === "no-consent") {
    return "You're getting this by email because WhatsApp messages are switched off. You can turn them on in Profile.";
  }
  if (blocked === "no-number") {
    return "You're getting this by email because there's no WhatsApp number in your Profile.";
  }
  const { number, message } = sandboxJoin();
  return `You're getting this by email because WhatsApp can't reach you right now. To get tomorrow's on WhatsApp, send "${message}" to ${number} on WhatsApp.`;
}

// Everyone whose nudge time has arrived and who hasn't had today's scheduled
// nudge yet. Sends to them one at a time (the sandbox allows one message
// every 3 seconds), and reports what happened.
export async function sendDueNudges(now = new Date()) {
  const db = createAdminClient();
  const { data: people, error } = await db.from("profiles")
    .select("id, timezone, nudge_time, projects!inner(status)")
    .eq("projects.status", "active");
  if (error) throw error;

  const results: { userId: string; result: NudgeResult }[] = [];
  let lastWhatsApp = 0;
  for (const person of people ?? []) {
    if (!isDue(person.nudge_time, person.timezone, now)) continue;
    const wait = lastWhatsApp + 3_000 - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    const result = await sendNudge(person.id, "scheduled", now);
    if (result.sent && result.channel === "whatsapp") lastWhatsApp = Date.now();
    results.push({ userId: person.id, result });
  }
  return results;
}
