import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plan } from "@/lib/ai/plan-shape";

export type ProjectPlan = {
  id: string;
  status: "onboarding" | "draft_plan" | "active";
  onboarding_step: string;
  wish: string | null;
  experience: string | null;
  outcome: string | null;
  obstacle: string | null;
  draft_plan: Plan | null;
  plan_revision: number;
  committed_at: string | null;
};
export async function getCurrentProject(userId: string): Promise<ProjectPlan | null> {
  const { data, error } = await createAdminClient().from("projects")
    .select("id, status, onboarding_step, wish, experience, outcome, obstacle, draft_plan, plan_revision, committed_at")
    .eq("user_id", userId).neq("status", "complete").maybeSingle();
  if (error) throw error;
  return data as ProjectPlan | null;
}
