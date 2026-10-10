"use server";

import { refresh } from "next/cache";
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
    .update({ name: name || null, email, whatsapp })
    .eq("id", profile.id);
  if (error) {
    return { values, formError: "That didn't save. Try again in a moment." };
  }
  refresh();
  return { saved: true, values };
}
