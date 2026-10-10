"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export type AuthState = { error?: string; email?: string; whatsapp?: string };

const notSetUp =
  "Scaffold isn't connected to its database yet. Add the Supabase keys to .env.local.";

// "+34 612 34 56 78" → "+34612345678". Returns null if it isn't a full
// international number.
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
  const back = { email, whatsapp: whatsappInput };

  if (!supabaseConfigured) return { ...back, error: notSetUp };
  if (!email.includes("@")) {
    return { ...back, error: "That email doesn't look complete. Check it and try again." };
  }
  if (password.length < 8) {
    return { ...back, error: "Pick a password with at least 8 characters." };
  }
  const whatsapp = normalizeWhatsapp(whatsappInput);
  if (!whatsapp) {
    return {
      ...back,
      error:
        "Write your WhatsApp number with its country code, starting with +. For example +34 612 345 678.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { whatsapp, timezone } },
  });
  if (error) {
    return {
      ...back,
      error:
        error.code === "user_already_exists"
          ? "There's already an account with that email. Log in instead."
          : "That didn't go through. Try again in a moment.",
    };
  }
  if (!data.session) {
    // Only happens if "Confirm email" is switched on in Supabase.
    return { ...back, error: "Check your email to confirm your account, then log in." };
  }
  redirect("/");
}

export async function logIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!supabaseConfigured) return { email, error: notSetUp };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return {
      email,
      error: "That email and password don't match an account. Check them and try again.",
    };
  }
  redirect("/");
}

export async function logOut() {
  if (supabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/log-in");
}
