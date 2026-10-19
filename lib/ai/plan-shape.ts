import { z } from "zod";

export const stages = ["Groundwork", "Foundation", "Walls", "Roof", "Finishing"] as const;
const text = z.string().trim().min(1).max(1200);
// Keep the arithmetic explicit: the UI renders these numbers alongside the
// instructions, so a model cannot label 5 × 6 minutes as a ten-minute task.
export const planShape = z.object({
  milestones: z.array(z.object({ title: text })).length(5),
  tasks: z.array(z.object({
    milestone: z.number().int().min(1).max(5),
    title: text,
    how_to: text,
    count: z.number().int().min(1).max(30),
    minutes_per_item: z.number().min(0.5).max(30),
    minutes: z.number().min(0.5).max(30),
    why: text,
  })).length(14),
  if_then_plans: z.array(z.object({ if: text, then: text })).min(1).max(2),
});
export type Plan = z.infer<typeof planShape>;

export function checkPlan(input: unknown): Plan {
  const plan = planShape.parse(input);
  for (const task of plan.tasks) {
    if (Math.abs(task.count * task.minutes_per_item - task.minutes) > 0.001) {
      throw new Error("Task minutes must equal count times minutes per item.");
    }
  }
  for (let i = 1; i < plan.tasks.length; i++) {
    if (plan.tasks[i].milestone < plan.tasks[i - 1].milestone) {
      throw new Error("Tasks must follow the roadmap order.");
    }
  }
  if (plan.tasks[0].milestone !== 1) throw new Error("Start with Groundwork.");
  return plan;
}
