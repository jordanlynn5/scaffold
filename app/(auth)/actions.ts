"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

type FieldName = "email" | "whatsapp" | "password";

export type AuthState = {
  // What the person typed, so the form is not emptied by a mistake.
  values?: { email?: string; whatsapp?: string; consent?: boolean };
  // One message per field, shown under that field.
  errors?: Partial<Record<FieldName, string>>;
  // The email already has an account: shown with a link to log in.
  emailTaken?: boolean;
  // A problem that belongs to no single field.
  formError?: string;
};

const notSetUp =
  "Scaffold isn't connected to its database yet. Add the Supabase keys to .env.local.";

// "+34 612 34 56 78" → "+34612345678" (the E.164 format). Returns null if it
// isn't a full international number.
function normalizeWhatsapp(input: string) {
  const digits = input.replace(/[\s\-().]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(digits) ? digits : null;
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const whatsappInput = String(formData.get("whatsapp") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const consent = formData.get("consent") === "on";
  const values = { email, whatsapp: whatsappInput, consent };

  const errors: AuthState["errors"] = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "That email doesn't look complete. Check it and try again.";
  }
  const whatsapp = normalizeWhatsapp(whatsappInput);
  if (!whatsapp) {
    errors.whatsapp =
      "Write your number with its country code, starting with +. For example +34 600 000 000.";
  }
  if (password.length < 8) {
    errors.password = "Pick a password with at least 8 characters.";
  }
  if (Object.keys(errors).length > 0) return { values, errors };

  if (!supabaseConfigured) return { values, formError: notSetUp };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { whatsapp, timezone, whatsapp_consent: consent } },
  });
  if (error) {
    if (error.code === "user_already_exists") return { values, emailTaken: true };
    if (error.code === "email_address_invalid") {
      return {
        values,
        errors: { email: "That email address wasn't accepted. Check it and try again." },
      };
    }
    return { values, formError: "That didn't go through. Try again in a moment." };
  }
  if (!data.session) {
    // Only happens if "Confirm email" is switched on in Supabase.
    return {
      values,
      formError: "Check your email to confirm your account, then log in.",
    };
  }
  // New users land on the empty lot (Home before a goal), as the owner asked.
  // The handoff §6.0b says to go straight to the onboarding chat instead:
  // to be settled with the owner once that chat exists (checklist slice 2).
  redirect("/");
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!supabaseConfigured) return { values, formError: notSetUp };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      values,
      formError:
        "That email and password don't match an account. Check them and try again.",
    };
  }
  redirect("/");
}

export async function logOut() {
  if (supabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
