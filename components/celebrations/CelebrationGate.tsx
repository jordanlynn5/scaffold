import { connection } from "next/server";
import { getPendingCelebrations } from "@/lib/celebrations/data";
import { findProfile } from "@/lib/profile";
import { CelebrationQueue } from "./CelebrationQueue";

// Checks on every app screen for celebrations owed to the person, including
// ones earned while away (for example by a WhatsApp reply).
export async function CelebrationGate() {
  await connection();
  const profile = await findProfile();
  if (!profile) return null;
  const items = await getPendingCelebrations(profile);
  return items.length ? <CelebrationQueue items={items} /> : null;
}
