import { EmptyLot } from "@/components/house/EmptyLot";
import { StartOver } from "@/components/onboarding/StartOver";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StepBar } from "@/components/ui/StepBar";
import { TeammateBadge, type TeammateId } from "@/components/ui/Teammate";
import { getOnboarding } from "@/lib/onboarding/flow";
import { getProfile } from "@/lib/profile";
import { getCurrentProject } from "@/lib/plans/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayInZone } from "@/lib/dates";

const steps: { who: TeammateId; verb: string; withWhom: string }[] = [
  { who: "alice", verb: "Design", withWhom: "with Alice" },
  { who: "georgina", verb: "Plan", withWhom: "with Georgina" },
  { who: "sarah", verb: "Build daily", withWhom: "with Sarah" },
];

// Home before a goal is set (handoff §6.1). Two versions: a new user, and
// someone who has started designing a goal with Alice and left partway.
export default async function HomePage() {
  const profile = await getProfile();
  const current = await getCurrentProject(profile.id);
  if (current?.status === "active") {
    const today = todayInZone(profile.timezone);
    const { data: task, error } = await createAdminClient().from("tasks")
      .select("title, how_to, minutes, count, minutes_per_item, why")
      .eq("project_id", current.id).eq("scheduled_date", today).maybeSingle();
    if (error) throw error;
    return (
      <div className="mx-auto flex w-full max-w-[800px] flex-col gap-5">
        <p className="text-caption text-text-muted">{today}</p>
        <h1 className="text-h1">Let’s build{profile.name ? `, ${profile.name}` : ""}</h1>
        <Card variant="quiet"><p className="text-body">Building: <strong>{current.wish}</strong></p></Card>
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-label text-text-muted">TODAY’S BRICK</span>{task ? <span className="text-body-sm">About {task.minutes} minutes</span> : null}</div>
          {task ? <><h2 className="text-h2">{task.title}</h2><p className="text-body text-text-secondary">{task.how_to}</p><p className="text-caption text-text-muted">{task.count} × {task.minutes_per_item} minutes = {task.minutes} minutes</p>
            <details className="text-body-sm"><summary className="cursor-pointer text-navy">Why this task?</summary><p className="mt-2">{task.why}</p></details>
          </> : <p className="text-body text-text-secondary">No task is scheduled for today. Your saved plan is still here.</p>}
        </Card>
        <Card variant="dark"><h2 className="text-h2">When the obstacle shows up</h2>{current.draft_plan?.if_then_plans.map((p, index) => <p key={index} className="mt-3 text-body"><strong className="text-yellow">If</strong> {p.if}, <strong className="text-yellow">then</strong> {p.then}</p>)}<p className="mt-5 text-body-sm">Why you started: {current.outcome}</p></Card>
      </div>
    );
  }
  if (current?.onboarding_step === "done") {
    return <Card className="mx-auto flex max-w-[720px] flex-col gap-5"><h1 className="text-h1">Your design is ready</h1><p className="text-body text-text-secondary">{current.status === "draft_plan" ? "Georgina saved your draft. Review it, ask for changes, and commit when it feels right." : "Georgina is ready to turn your goal into a roadmap and small daily tasks."}</p><p className="text-body">Building: <strong>{current.wish}</strong></p><ButtonLink href="/onboarding/plan">{current.status === "draft_plan" ? "Review your plan →" : "See your plan →"}</ButtonLink></Card>;
  }
  const onboarding = await getOnboarding(profile.id);

  if (onboarding && onboarding.project.onboarding_step !== "name") {
    const { project } = onboarding;
    return (
      <Card className="mx-auto flex max-w-[720px] flex-col gap-5">
        <h1 className="text-h1">
          Welcome back{profile.name ? `, ${profile.name}` : ""}
        </h1>
        <p className="text-body text-text-secondary">
          Your design is halfway done. Alice saved everything, so you can pick
          up right where you stopped.
        </p>
        <StepBar step={project.onboarding_step} />
        {project.wish ? (
          <Card variant="quiet">
            <p className="text-body-sm text-text-secondary">
              Your wish so far:{" "}
              <strong className="font-semibold text-ink">{project.wish}</strong>
            </p>
          </Card>
        ) : null}
        <div className="flex flex-col items-start gap-1">
          <ButtonLink href="/onboarding" className="w-full desk:w-auto">
            Continue where you left off →
          </ButtonLink>
          <StartOver />
        </div>
      </Card>
    );
  }

  return (
    <Card padded={false} className="mx-auto max-w-[720px] overflow-hidden">
      <div className="bg-grid-paper border-b border-line px-4 pt-4">
        <EmptyLot className="mx-auto w-full max-w-[520px]" />
      </div>
      <div className="flex flex-col items-center gap-5 p-5 text-center desk:p-8">
        <h1 className="text-h1">Every dream house starts with a plan</h1>
        <p className="text-body text-text-secondary">
          Your lot is ready. Tell Alice, your Architect, what you want to
          accomplish. It takes about 5 minutes.
        </p>
        <ul className="grid w-full grid-cols-1 gap-3 desk:grid-cols-3">
          {steps.map((step) => (
            <li key={step.who}>
              <Card variant="quiet" className="flex items-center gap-3 text-left">
                <TeammateBadge who={step.who} />
                <span className="text-body-sm">
                  <strong className="font-semibold">{step.verb}</strong>{" "}
                  <span className="text-text-secondary">{step.withWhom}</span>
                </span>
              </Card>
            </li>
          ))}
        </ul>
        <div className="flex w-full flex-col items-center gap-1">
          <ButtonLink href="/onboarding" className="w-full desk:w-auto">
            Get to work on your dream →
          </ButtonLink>
          <ButtonLink href="/team" variant="link">
            Not sure what to build? Chat with Alice
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
