"use server";

import { refresh } from "next/cache";
import { sendNudge } from "@/lib/nudges/send";
import { getProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  isEmail,
  messages,
  normalizeWhatsapp,
  nudgeTimes,
} from "@/lib/validation";

// Weekly target, nudge time and WhatsApp consent save the moment they change.
// A changed weekly target applies right away, including this week, but never
// triggers a celebration: only marking a task done can (handoff §7.2, §7.3).
export async function saveRhythm(change: {
  weekly_target?: number;
  nudge_time?: string;
  whatsapp_consent?: boolean;
}): Promise<{ ok: boolean }> {
  const profile = await getProfile();
  const update: typeof change = {};

  if (change.weekly_target !== undefined) {
    const days = Math.round(change.weekly_target);
    if (days < 1 || days > 7) return { ok: false };
    update.weekly_target = days;
  }
  if (change.nudge_time !== undefined) {
    if (!nudgeTimes.includes(change.nudge_time)) return { ok: false };
    update.nudge_time = change.nudge_time;
  }
  if (change.whatsapp_consent !== undefined) {
    update.whatsapp_consent = Boolean(change.whatsapp_consent);
  }
  if (Object.keys(update).length === 0) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", profile.id);
  if (error) return { ok: false };
  refresh();
  return { ok: true };
}

export type ContactState = {
  saved?: boolean;
  values?: { name: string; email: string; whatsapp: string };
  errors?: Partial<Record<"name" | "email" | "whatsapp", string>>;
  formError?: string;
};

export async function saveContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const profile = await getProfile();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const whatsappInput = String(formData.get("whatsapp") ?? "").trim();
  const values = { name, email, whatsapp: whatsappInput };

  const errors: ContactState["errors"] = {};
  if (name.length > 60) errors.name = "Keep your name under 60 characters.";
  if (!isEmail(email)) errors.email = messages.email;
  const whatsapp = normalizeWhatsapp(whatsappInput);
  if (!whatsapp) errors.whatsapp = messages.whatsapp;
  if (Object.keys(errors).length > 0) return { values, errors };

  // The email is also what you log in with, so it changes in two places.
  // There is no confirmation email (spec.md > What Was Simplified and Why).
  if (email.toLowerCase() !== profile.email.toLowerCase()) {
    const admin = createAdminClient();
    const { data: taken } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email.replace(/[\\%_]/g, "\\$&"))
      .neq("id", profile.id)
      .limit(1);
    if (taken && taken.length > 0) {
      return {
        values,
        errors: { email: "Another account already uses that email." },
      };
    }
    const { error } = await admin.auth.admin.updateUserById(profile.id, {
      email,
      email_confirm: true,
    });
    if (error) {
      return {
        values,
        errors: {
          email: "That email address wasn't accepted. Check it and try again.",
        },
      };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: name || null, email, whatsapp,
      // A new phone number has not joined the sandbox or opened its window.
      ...(whatsapp !== profile.whatsapp
        ? { whatsapp_joined_at: null, whatsapp_last_inbound_at: null }
        : {}),
    })
    .eq("id", profile.id);
  if (error) {
    return { values, formError: "That didn't save. Try again in a moment." };
  }
  refresh();
  return { saved: true, values };
}

export type NudgeNowState = { message?: string; sent?: boolean };

// "Send my nudge now" (spec.md > What Was Simplified and Why): sends a real
// nudge through the same path as the hourly bell, without waiting.
export async function sendNudgeNow(): Promise<NudgeNowState> {
  const profile = await getProfile();
  const result = await sendNudge(profile.id, "manual");
  if (result.sent) {
    refresh();
    return {
      sent: true,
      message:
        result.channel === "whatsapp"
          ? "Sent. Check WhatsApp."
          : `Sent. Check your email (${profile.email}).`,
    };
  }
  const reasons = {
    "no-task": "There's no task for today yet, so there's nothing to send.",
    "too-soon": "Sarah just sent one. Try again in a minute.",
    "already-done": "Today's task is already done.",
    "already-sent": "Sarah just sent one. Try again in a minute.",
    failed: "That didn't send. Try again in a moment.",
  } as const;
  return { message: reasons[result.reason] };
}
