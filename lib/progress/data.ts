import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayInZone } from "@/lib/dates";
import { weekStart } from "@/lib/tasks/weeks";
import { deriveHouse, streakWeeks, type HouseProgress } from "./derive";

export type Milestone = { position: number; stage_name: string; title: string };

export type Progress = HouseProgress & {
  milestones: (Milestone & { done: number; finished: boolean })[];
  weekDone: number;
  streak: number;
};

// The house, roadmap, this week and the streak for one person's project.
// The admin client is used, so every query filters by the person itself.
export async function getProgress(userId: string, projectId: string, timezone: string): Promise<Progress> {
  const db = createAdminClient();
  const monday = weekStart(todayInZone(timezone));
  const [milestones, weeks] = await Promise.all([
    db.from("milestones").select("position, stage_name, title, status, tasks(status), projects!inner(user_id)")
      .eq("project_id", projectId).eq("projects.user_id", userId).order("position"),
    db.from("week_records").select("week_start, hit, done_count").eq("user_id", userId)
      .lte("week_start", monday).order("week_start", { ascending: false }).limit(60),
  ]);
  if (milestones.error) throw milestones.error;
  if (weeks.error) throw weeks.error;
  const house = deriveHouse(milestones.data ?? []);
  return {
    ...house,
    milestones: (milestones.data ?? []).map((m, i) => ({
      position: m.position, stage_name: m.stage_name, title: m.title,
      done: house.stages[i].done, finished: house.stages[i].finished,
    })),
    weekDone: weeks.data?.find((w) => w.week_start === monday)?.done_count ?? 0,
    streak: streakWeeks(weeks.data ?? [], monday),
  };
}
