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
import { todayInZone, addDays } from "@/lib/dates";
import { weekStart } from "@/lib/tasks/weeks";
import { MarkDone } from "@/components/tasks/MarkDone";
import { SmallHouse } from "@/components/house/SmallHouse";
import { getProgress } from "@/lib/progress/data";
import { connection } from "next/server";
import { Suspense } from "react";
import { WhatsAppNotice } from "@/components/nudges/WhatsAppNotice";

const steps: { who: TeammateId; verb: string; withWhom: string }[] = [
  { who: "alice", verb: "Design", withWhom: "with Alice" },
  { who: "georgina", verb: "Plan", withWhom: "with Georgina" },
  { who: "sarah", verb: "Build daily", withWhom: "with Sarah" },
];

// Home before a goal is set (handoff §6.1). Two versions: a new user, and
// someone who has started designing a goal with Alice and left partway.
export default function HomePage() {
  return (
    <Suspense fallback={<Card className="w-full"><p role="status" className="text-body text-text-secondary">Loading your day…</p></Card>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  // Today's task and expiring proof-photo links must use the current request,
  // rather than being evaluated during Next.js's speculative prerender.
  await connection();
  const profile = await getProfile();
  const current = await getCurrentProject(profile.id);
  if (current?.status === "active") {
    const today = todayInZone(profile.timezone);
    const { data: task, error } = await createAdminClient().from("tasks")
      .select("id, status, position, title, how_to, minutes, count, minutes_per_item, why")
      .eq("project_id", current.id).eq("scheduled_date", today).maybeSingle();
    if (error) throw error;
    const monday = weekStart(today);
    const db = createAdminClient();
    const { data: week, error: weekError } = await db.from("week_records").select("done_count").eq("user_id", profile.id).eq("week_start", monday).maybeSingle();
    const { data: completedTasks, error: completedError } = await db.from("tasks").select("done_at, projects!inner(user_id)").eq("projects.user_id", profile.id).eq("status", "done").gte("done_at", `${addDays(monday, -1)}T00:00:00Z`).lt("done_at", `${addDays(monday, 8)}T00:00:00Z`);
    if (weekError) throw weekError;
    if (completedError) throw completedError;
    const completedDays = new Set((completedTasks ?? []).map((t) => todayInZone(profile.timezone, new Date(t.done_at))));
    const { data: proof, error: proofError } = task?.status === "done" ? await db.from("proofs").select("note, photo_path").eq("task_id", task.id).maybeSingle() : { data: null, error: null };
    if (proofError) throw proofError;
    const house = await getProgress(profile.id, current.id, profile.timezone);
    // Today's nudge from Sarah, the same line as her WhatsApp or email.
    const { data: nudge } = await db.from("nudge_log").select("line")
      .eq("user_id", profile.id).eq("sent_on", today).not("line", "is", null)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    let photoUrl: string | undefined;
    if (proof?.photo_path) {
      const signed = await db.storage.from("proofs").createSignedUrl(proof.photo_path, 600);
      photoUrl = signed.data?.signedUrl;
    }
    return (
      // Desktop: today's task on the left, the house and the week on the
      // right. Phone: one column in the handoff's order (§6.6).
      <div className="grid w-full grid-cols-1 items-start gap-5 desk:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
        <div className="flex min-w-0 flex-col gap-5">
        <p className="text-caption text-text-muted">{today}{task ? ` · Day ${task.position} of 14` : ""}</p>
        <h1 className="text-h1">Let’s build{profile.name ? `, ${profile.name}` : ""}</h1>
        <WhatsAppNotice person={profile} />
        <Card variant="quiet"><p className="text-body">Building: <strong>{current.wish}</strong></p></Card>
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-label text-text-muted">TODAY’S BRICK</span>{task ? <span className="text-body-sm">About {task.minutes} minutes</span> : null}</div>
          {task ? <><h2 className="text-h2">{task.title}</h2><p className="text-body text-text-secondary">{task.how_to}</p><p className="text-caption text-text-muted">{task.count} × {task.minutes_per_item} minutes = {task.minutes} minutes</p>
            <details className="text-body-sm"><summary className="cursor-pointer text-navy">Why this task?</summary><p className="mt-2">{task.why}</p></details>
            <MarkDone key={task.id} taskId={task.id} done={task.status === "done"} />
            {proof?.note ? <p className="text-body-sm italic">“{proof.note}”</p> : null}
            {photoUrl ? <a href={photoUrl} target="_blank" rel="noreferrer" className="text-body-sm text-navy underline">View your saved photo ↗</a> : null}
          </> : <p className="text-body text-text-secondary">No task is scheduled for today. Your saved plan is still here.</p>}
        </Card>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
        <SmallHouse stage={house.stage} fill={house.fill} bricksLaid={house.bricksLaid} />
        <Card><h2 className="text-h2">This week</h2><p className="mt-2 text-body">{week?.done_count ?? 0} of {profile.weekly_target} days</p><ul className="mt-4 grid grid-cols-7 gap-2" aria-label="Days completed this week">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => {
          const date = addDays(monday, i); const complete = completedDays.has(date);
          return <li key={date} aria-label={`${label}${complete ? ": done" : ": no task completed"}`} className="flex flex-col items-center gap-2 text-caption"><span>{label}</span><span aria-hidden="true" className={`flex h-8 w-8 items-center justify-center rounded-full border ${complete ? "border-navy bg-navy text-surface" : "border-line text-text-muted"}`}>{complete ? "✓" : "·"}</span></li>;
        })}</ul></Card>
        <Card variant="quiet"><h2 className="text-h2">When the obstacle shows up</h2>{current.draft_plan?.if_then_plans.map((p, index) => <p key={index} className="mt-3 text-body"><strong className="text-yellow">If</strong> {p.if}, <strong className="text-yellow">then</strong> {p.then}</p>)}<p className="mt-5 text-body-sm">Why you started: {current.outcome}</p></Card>
        <Card variant="dark"><div className="flex items-center gap-3"><TeammateBadge who="sarah" /><p className="text-body-sm">Sarah · Site Lead</p></div><p className="mt-4 text-body">{nudge?.line ?? (task?.status === "done" ? "That’s one more brick in place. You showed up for your goal today." : "One small task. One more brick. Start with what’s in front of you.")}</p><ButtonLink href="/team" variant="link" className="mt-3 text-yellow">Talk to the team →</ButtonLink></Card>
        </div>
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
