import type { Metadata } from "next";
import { BlankPlan } from "@/components/house/EmptyLot";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getCurrentProject } from "@/lib/plans/data";
import { getProfile } from "@/lib/profile";
import { stages } from "@/lib/ai/plan-shape";

export const metadata: Metadata = { title: "Plan · Scaffold" };

// Plan before a goal is set. Handoff §6.2.
export default async function PlanPage() {
  const profile = await getProfile();
  const project = await getCurrentProject(profile.id);
  if (project?.onboarding_step === "done") {
    return <div className="flex flex-col gap-5"><h1 className="text-h1">Plan</h1>
      <Card className="flex flex-col items-start gap-4"><h2 className="text-h2">{project.wish}</h2>
        {project.status === "active" ? <><p className="text-body text-text-secondary">Your plan is committed. Your first two weeks are saved, and today’s task is on Home.</p>
          <ol className="flex flex-col gap-3">{project.draft_plan?.milestones.map((m, index) => <li key={index} className="text-body-sm"><span className="text-text-muted">{index + 1}. {stages[index]}:</span> {m.title}</li>)}</ol>
          <ButtonLink href="/">See today’s task</ButtonLink></>
          : <><p className="text-body text-text-secondary">Review your roadmap and first two weeks with Georgina, then commit when it feels right.</p><ButtonLink href="/onboarding/plan">Review your plan</ButtonLink></>}
      </Card></div>;
  }
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-h1">Plan</h1>
      <EmptyState
        illustration={<BlankPlan className="mx-auto w-full max-w-[460px]" />}
        heading="No plan yet"
        body="Georgina, your General Contractor, draws up your roadmap and daily tasks once you've designed your goal with Alice."
        button="Design your goal with Alice"
      />
    </div>
  );
}
