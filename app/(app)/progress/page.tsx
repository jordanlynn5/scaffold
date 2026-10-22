import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { FirstBrick } from "@/components/house/EmptyLot";
import { House, stageNames } from "@/components/house/House";
import { HouseLegend, ProgressBar, StageBar } from "@/components/house/ProgressBits";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Chip";
import { getCurrentProject } from "@/lib/plans/data";
import { getProfile } from "@/lib/profile";
import { getProgress } from "@/lib/progress/data";

export const metadata: Metadata = { title: "Progress · Scaffold" };

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Progress (handoff §6.7). Before a goal is set, the empty state (§6.2).
export default function ProgressPage() {
  return (
    <Suspense fallback={<Card><p role="status" className="text-body text-text-secondary">Loading your house…</p></Card>}>
      <ProgressContent />
    </Suspense>
  );
}

async function ProgressContent() {
  // This week and the streak depend on today's date, so read per request.
  await connection();
  const profile = await getProfile();
  const project = await getCurrentProject(profile.id);

  if (project?.status !== "active") {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-h1">Progress</h1>
        <EmptyState
          illustration={<FirstBrick className="mx-auto w-full max-w-[460px]" />}
          heading="Nothing to track yet"
          body="This is where your house goes up. Every task you finish will add a brick, and every milestone completes a stage."
          button="Get to work on your dream"
        />
      </div>
    );
  }

  const progress = await getProgress(profile.id, project.id, profile.timezone);
  const { stage, fill, bricksLaid, milestones, weekDone, streak } = progress;
  const target = profile.weekly_target;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-caption text-text-muted">House {profile.houses_built + 1} · {project.wish}</p>
        <h1 className="text-h1">Your house is going up</h1>
      </header>

      <div className="grid grid-cols-1 gap-5 desk:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-h2">Stage {stage} of 5: {stageNames[stage - 1]}</h2>
            <p className="text-body-sm text-text-secondary">{plural(bricksLaid, "brick")} laid</p>
          </div>
          <div className="bg-grid-paper rounded-input border border-line px-3 pt-3">
            <House tight stage={stage} fill={fill} bricksLaid={bricksLaid} className="mx-auto w-full max-w-[640px]" />
          </div>
          <HouseLegend />
          <StageBar stage={stage} fill={fill} />
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="flex flex-col gap-3">
            <h2 className="text-label text-text-muted">Weekly target</h2>
            <p className="text-body">
              <span className="font-heading text-[34px] font-bold leading-none">{weekDone}</span>{" "}
              of {plural(target, "day")} this week
            </p>
            <ProgressBar value={weekDone / target} tone="yellow" label="This week’s target" />
            <p className="flex items-center gap-2 text-body-sm text-text-secondary">
              <Icon name="trophy" size={20} className="text-yellow-text" />
              {plural(streak, "week")} on target in a row
            </p>
          </Card>

          <Card variant="navy" className="flex flex-col gap-2">
            <h2 className="text-label text-text-on-navy">Houses built</h2>
            <p className="font-heading text-[44px] font-bold leading-none text-yellow">{profile.houses_built}</p>
            <p className="text-body-sm text-text-on-navy">When this one is done, the scaffolding comes down.</p>
          </Card>
        </div>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="roadmap">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="roadmap" className="text-h2">Roadmap</h2>
          <ButtonLink href="/plan" variant="link">See daily tasks in Plan →</ButtonLink>
        </div>
        <ol className="grid grid-cols-1 gap-3 desk:grid-cols-5">
          {milestones.map((m) => {
            const current = m.position === stage;
            const variant = m.finished ? "standard" : current ? "current" : "not-yet";
            return (
              <li key={m.position}>
                <Card variant={variant} padded={false} className="flex h-full flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-label text-text-muted">{m.position}. {m.stage_name}</span>
                    {m.finished ? <Icon name="check" size={18} className="text-slate" /> : null}
                  </div>
                  <p className={`text-body-sm ${m.finished || current ? "font-semibold" : "text-text-secondary"}`}>{m.title}</p>
                  <div className="mt-auto">
                    {m.finished ? <Tag>Done · {plural(m.done, "brick")}</Tag>
                      : current ? <Tag tone="yellow">Now · {plural(m.done, "brick")}</Tag>
                      : <span className="text-caption text-text-muted">Later</span>}
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
