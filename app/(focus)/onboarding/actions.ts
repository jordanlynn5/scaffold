"use server";

import { redirect } from "next/navigation";
import { clearOnboarding } from "@/lib/onboarding/flow";
import { getProfile } from "@/lib/profile";

// "Start over": clears the unfinished design, then opens a fresh chat.
export async function startOver() {
  const profile = await getProfile();
  await clearOnboarding(profile.id);
  redirect("/onboarding");
}
