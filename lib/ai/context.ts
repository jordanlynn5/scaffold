// What a teammate is told about the builder (spec.md > Components > Team
// Brains). Today's task and recent progress are added when they exist.
export type BuilderFacts = {
  name: string | null;
  nudge_time?: string | null;
  weekly_target?: number | null;
  wish?: string | null;
  experience?: string | null;
  outcome?: string | null;
  obstacle?: string | null;
};

export function builderContext(facts: BuilderFacts) {
  const lines = [
    facts.name && `Name: ${facts.name}`,
    facts.nudge_time && `Daily message arrives at: ${facts.nudge_time.slice(0, 5)}`,
    facts.weekly_target && `Days a week they want to build: ${facts.weekly_target}`,
    facts.wish && `Wish (their goal): ${facts.wish}`,
    facts.experience && `Experience with it so far: ${facts.experience}`,
    facts.outcome && `Outcome (their why): ${facts.outcome}`,
    facts.obstacle && `Obstacle (what gets in the way inside them): ${facts.obstacle}`,
  ].filter(Boolean);
  if (lines.length === 0) return "You know nothing about the builder yet.";
  return `What you know about the builder so far:\n${lines.join("\n")}`;
}
