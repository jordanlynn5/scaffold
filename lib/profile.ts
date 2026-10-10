import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  name: string | null;
  email: string;
  whatsapp: string | null;
  whatsapp_consent: boolean;
  timezone: string;
  nudge_time: string;
  weekly_target: number;
  houses_built: number;
};

const columns =
  "id, name, email, whatsapp, whatsapp_consent, timezone, nudge_time, weekly_target, houses_built";

// The logged-in person's own row, or null when nobody is logged in. For
// places that answer with an error instead of sending you to log-in.
export async function findProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) return null;

  const { data } = await supabase
    .from("profiles")
    .select(columns)
    .eq("id", auth.claims.sub)
    .single();
  return data ?? null;
}

// The logged-in person's own row. Sends logged-out visitors to log-in.
export async function getProfile(): Promise<Profile> {
  const profile = await findProfile();
  if (!profile) redirect("/log-in");
  return profile;
}
