// Progress is worked out from tasks and week records, never stored
// (spec > Data Model, "Worked out when needed"). No imports, so the check
// scripts can load this file directly.

export const STAGE_SLOTS = [12, 12, 51, 12, 12] as const;

export type StageInput = {
  position: number;
  status: string;
  tasks: { status: string }[];
};

export type StageProgress = {
  position: number;
  done: number;
  planned: number;
  finished: boolean;
};

export type HouseProgress = {
  stages: StageProgress[];
  /** The first stage that is not finished, 1 to 5. */
  stage: number;
  /** Share of the current stage that is built, 0 to 1. */
  fill: number;
  bricksLaid: number;
  houseFinished: boolean;
};

// A stage is finished when its milestone is marked done, or when all of its
// planned tasks are done and the plan has already moved on to a later stage.
// The last stage with tasks in a two-week chunk is never assumed finished:
// the next chunk may add more tasks to it.
export function deriveHouse(milestones: StageInput[]): HouseProgress {
  const sorted = [...milestones].sort((a, b) => a.position - b.position);
  const stages = sorted.map((m, i) => {
    const done = m.tasks.filter((t) => t.status === "done").length;
    const planned = m.tasks.length;
    const laterPlanned = sorted.slice(i + 1).some((later) => later.tasks.length > 0);
    const finished =
      m.status === "done" || (planned > 0 && done === planned && laterPlanned);
    return { position: m.position, done, planned, finished };
  });
  const bricksLaid = stages.reduce((sum, s) => sum + s.done, 0);
  const current = stages.find((s) => !s.finished);
  if (!current) {
    return { stages, stage: 5, fill: 1, bricksLaid, houseFinished: stages.length === 5 };
  }
  // Kept just under full until the stage is really finished (see above).
  const share = current.planned ? Math.min(0.95, current.done / current.planned) : 0;
  return { stages, stage: current.position, fill: share, bricksLaid, houseFinished: false };
}

// How many slots of a stage are drawn as laid. The current stage keeps its
// last slot open until the stage is really finished, so it never looks done
// early (agreed with the owner, Oct 21, 2026).
export function slotsLaid(slots: number, stageIndex: number, stage: number, fill: number, stageComplete = false) {
  if (stageIndex < stage) return slots;
  if (stageIndex > stage) return 0;
  if (stageComplete) return slots;
  const laid = Math.round(Math.min(1, Math.max(0, fill)) * slots);
  return Math.min(laid, slots - 1);
}

function shiftDate(date: string, days: number) {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + days);
  return day.toISOString().slice(0, 10);
}

// Consecutive weeks on target, ending this week or last. This week not
// being hit yet does not break a streak that ran through last week.
export function streakWeeks(records: { week_start: string; hit: boolean }[], thisMonday: string) {
  const hit = new Set(records.filter((r) => r.hit).map((r) => r.week_start));
  let monday = hit.has(thisMonday) ? thisMonday : shiftDate(thisMonday, -7);
  let count = 0;
  while (hit.has(monday)) {
    count++;
    monday = shiftDate(monday, -7);
  }
  return count;
}
