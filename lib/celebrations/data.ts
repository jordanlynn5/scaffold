import "server-only";
import type { Celebration } from "@/components/celebrations/CelebrationQueue";
import { addDays, todayInZone } from "@/lib/dates";
import { streakWeeks } from "@/lib/progress/derive";
import type { Profile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";

// Milestone first, then weekly (handoff §7.3). Only kinds this build can
// show are returned; the others stay owed until their screens exist.
const order = { stage: 0, weekly: 1, house: 2 } as const;
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Celebrations come only from completeTask. This only reads what is owed.
export async function getPendingCelebrations(profile: Profile): Promise<Celebration[]> {
  const db = createAdminClient();
  const { data: owed, error } = await db.from("pending_celebrations")
    .select("id, kind, payload").eq("user_id", profile.id).is("shown_at", null);
  if (error) throw error;
  const weekly = (owed ?? []).filter((c) => c.kind === "weekly");
  if (!weekly.length) return [];

  const [weeks, done] = await Promise.all([
    db.from("week_records").select("week_start, hit, done_count").eq("user_id", profile.id),
    db.from("tasks").select("done_at, projects!inner(user_id, status)")
      .eq("projects.user_id", profile.id).eq("projects.status", "active").eq("status", "done"),
  ]);
  if (weeks.error) throw weeks.error;
  if (done.error) throw done.error;
  const doneDays = (done.data ?? []).map((t) => todayInZone(profile.timezone, new Date(t.done_at)));

  return weekly
    .sort((a, b) => order[a.kind as keyof typeof order] - order[b.kind as keyof typeof order])
    .map((c) => {
      const monday = String(c.payload.week_start);
      const week = weeks.data?.find((w) => w.week_start === monday);
      const days = weekdays.filter((_, i) => doneDays.includes(addDays(monday, i)));
      return {
        id: c.id,
        kind: "weekly" as const,
        done: week?.done_count ?? days.length,
        target: Number(c.payload.target),
        bricksLaid: doneDays.length,
        days,
        streak: streakWeeks(weeks.data ?? [], monday),
      };
    });
}
