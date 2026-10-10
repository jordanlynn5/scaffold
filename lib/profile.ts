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

// The logged-in person's own row. Sends logged-out visitors to log-in.
export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/log-in");

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, name, email, whatsapp, whatsapp_consent, timezone, nudge_time, weekly_target, houses_built",
    )
    .eq("id", auth.claims.sub)
    .single();
  if (error || !data) redirect("/log-in");
  return data;
}
