"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Logo } from "@/components/ui/Logo";
import { StepBar } from "@/components/ui/StepBar";
import { TeammateBadge, TeammateLabel } from "@/components/ui/Teammate";
import { stages, type Plan } from "@/lib/ai/plan-shape";
import type { ProjectPlan } from "@/lib/plans/data";

export function PlanReview({ project, name, weeklyTarget, nudgeTime, whatsappConsent }: {
  project: ProjectPlan; name: string | null; weeklyTarget: number; nudgeTime: string; whatsappConsent: boolean;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(project.draft_plan);
  const [revision, setRevision] = useState(project.plan_revision);
  const [busy, setBusy] = useState<"generate" | "commit" | null>(null);
  const [error, setError] = useState("");
  const [week, setWeek] = useState(0);
  const [editing, setEditing] = useState(false);
  const [changes, setChanges] = useState("");
  const [failedAction, setFailedAction] = useState<"generate" | "commit">("generate");
  const started = useRef(false);
  const inFlight = useRef(false);

  async function request(action: "generate" | "commit", changeRequest?: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(action);
    setError("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, revision, changes: changeRequest }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result) {
        throw new Error(result?.error || "Georgina couldn't finish that just now. Your saved answers and plan are safe. Try again.");
      }
      if (result.committed) {
        router.push("/");
        router.refresh();
      } else {
        setPlan(result.plan);
        setRevision(result.revision);
        setEditing(false);
        setChanges("");
      }
    } catch (cause) {
      setFailedAction(action);
      setError(cause instanceof Error && !(cause instanceof TypeError)
        ? cause.message
        : "Couldn't reach Georgina. Your saved answers and plan are safe. Try again.");
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  useEffect(() => {
    if (project.draft_plan || started.current) return;
    started.current = true;
    void request("generate");
    // Run once on entry. Requests after this are explicit button presses.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh bg-grid-paper">
      <header className="border-b border-line bg-surface px-4 py-4">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-4">
          <Link href="/" aria-label="Back to Home"><Logo size={30} onNavy={false} /></Link>
          <StepBar step="done" />
        </div>
      </header>
      <main className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 py-7 pb-64 desk:pb-44">
        <div className="flex items-center gap-2"><TeammateBadge who="georgina" /><TeammateLabel who="georgina" /></div>
        <h1 className="text-h1">{plan ? `Here's your plan${name ? `, ${name}` : ""}` : "Georgina is drawing up your plan"}</h1>
        <p className="max-w-[720px] text-body text-text-secondary">{plan
          ? "Five stages to your finished house. Only the first two weeks are broken into daily tasks, so nothing gets overwhelming. Look it over, then commit when it feels right."
          : "She's turning your design into small, clear tasks. This can take a little while. Your answers are already saved."}</p>
        <section aria-label="Your design" className="grid gap-3 desk:grid-cols-3">
          {[["Wish", project.wish], ["Outcome · your why", project.outcome], ["Obstacle", project.obstacle]].map(([label, value]) => (
            <Card key={label} variant="quiet"><h2 className="text-label text-text-muted">{label}</h2><p className="mt-2 text-body-sm">{value}</p></Card>
          ))}
        </section>
        {busy === "generate" ? <p role="status" className="text-body-sm text-text-secondary">{plan ? "Georgina is revising your plan. Your saved draft stays here until the new one is ready…" : "Georgina is working on your first two weeks…"}</p> : null}
        {error ? <Card className="flex flex-col items-start gap-3"><p role="alert">{error}</p>
          <Button disabled={Boolean(busy)} variant="secondary" onClick={() => void request(failedAction, changes.trim() || undefined)}>Try again</Button>
          <ButtonLink href="/" variant="link">Back to Home</ButtonLink>
          <Button variant="link" onClick={() => window.location.reload()}>Reload saved plan</Button>
        </Card> : null}
        {plan ? <>
          <section aria-labelledby="roadmap"><h2 id="roadmap" className="mb-3 text-h2">Your roadmap</h2>
            <ol className="grid gap-3 desk:grid-cols-5">{plan.milestones.map((m, index) => (
              <li key={index} className={`rounded-card border-2 bg-surface p-4 ${index === 0 ? "border-yellow" : "border-dashed border-line"}`}>
                <p className="text-label text-text-muted">{index + 1}. {stages[index]}</p><h3 className="mt-2 text-body-sm font-semibold">{m.title}</h3><p className="mt-3 text-caption text-text-muted">{index === 0 ? "Start here" : "Not yet"}</p>
              </li>
            ))}</ol>
          </section>
          <section aria-labelledby="daily-tasks"><h2 id="daily-tasks" className="mb-3 text-h2">Your first two weeks</h2>
            <div className="mb-3 flex gap-2" role="group" aria-label="Choose a week">{[0, 1].map((w) => <Button key={w} variant={week === w ? "primary" : "secondary"} aria-pressed={week === w} onClick={() => setWeek(w)}>Week {w + 1}</Button>)}</div>
            <ol start={week * 7 + 1} className="flex flex-col gap-3">{plan.tasks.slice(week * 7, week * 7 + 7).map((task, index) => (
              <li key={week * 7 + index}><Card className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3"><span className="text-caption text-text-muted">Day {week * 7 + index + 1}</span><span className="shrink-0 rounded-chip bg-yellow-wash px-3 py-1 text-caption">{task.minutes} min</span></div>
                <h3 className="text-body font-semibold">{task.title}</h3><p className="text-body-sm text-text-secondary">{task.how_to}</p>
                <p className="text-caption text-text-muted">{task.count} × {task.minutes_per_item} minutes = {task.minutes} minutes</p>
                <details className="text-body-sm"><summary className="cursor-pointer text-navy">Why this task?</summary><p className="mt-2 text-text-secondary">{task.why}</p></details>
              </Card></li>
            ))}</ol>
          </section>
          <Card variant="dark"><h2 className="mb-3 text-h2">When the obstacle shows up</h2>{plan.if_then_plans.map((p, i) => <p key={i} className="mt-2 text-body"><strong className="text-yellow">If</strong> {p.if}, <strong className="text-yellow">then</strong> {p.then}</p>)}</Card>
        </> : null}
        {editing ? <Card><form className="flex flex-col gap-3" onSubmit={(event) => { event.preventDefault(); void request("generate", changes.trim()); }}>
          <label htmlFor="plan-changes" className="text-body font-semibold">What would you like Georgina to change?</label>
          <textarea id="plan-changes" value={changes} onChange={(event) => setChanges(event.target.value)} maxLength={1200} required rows={3} disabled={Boolean(busy)} className="w-full rounded-input border border-input-border bg-bg p-3 text-body" placeholder="Tell her what would make these tasks work better for you." />
          <div className="flex flex-wrap gap-3"><Button disabled={Boolean(busy) || !changes.trim()}>Send to Georgina</Button><Button type="button" variant="secondary" disabled={Boolean(busy)} onClick={() => setEditing(false)}>Keep this draft</Button></div>
        </form></Card> : null}
      </main>
      {plan ? <footer className="fixed inset-x-0 bottom-0 border-t border-line bg-surface px-4 py-4">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-3 desk:flex-row desk:items-center desk:justify-between">
          <p className="text-body-sm text-text-secondary">{weeklyTarget} days a week{whatsappConsent ? ` · daily WhatsApp nudge at ${nudgeTime.slice(0, 5)} from Sarah` : " · WhatsApp nudges are off"}</p>
          <div className="flex flex-col gap-2 desk:flex-row"><Button variant="secondary" disabled={Boolean(busy)} onClick={() => { setEditing(true); window.setTimeout(() => document.getElementById("plan-changes")?.focus(), 0); }}>Ask for changes</Button><Button disabled={Boolean(busy) || editing} onClick={() => void request("commit")}>{busy === "commit" ? "Saving your commitment…" : "I commit to this plan"}</Button></div>
        </div>
      </footer> : null}
    </div>
  );
}
