import { stageNames } from "./House";

// Handoff §4.7 progress bar: an 8px track with a navy or yellow fill.
export function ProgressBar({ value, tone = "navy", label }: { value: number; tone?: "navy" | "yellow"; label: string }) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 w-full overflow-hidden rounded-full bg-track">
      <div className={`h-full rounded-full ${tone === "navy" ? "bg-navy" : "bg-yellow"}`} style={{ width: `${percent}%` }} />
    </div>
  );
}

// Handoff §4.7 stage bar: five equal segments with a label below each.
// Finished: slate. Current: track with a navy fill. Future: track.
export function StageBar({ stage, fill, finished = false }: { stage: number; fill: number; finished?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
    <ol className="grid grid-cols-5 gap-2" aria-label="Construction stages">
      {stageNames.map((name, i) => {
        const position = i + 1;
        const done = finished || position < stage;
        const current = !finished && position === stage;
        return (
          <li key={name} className="flex min-w-0 flex-col gap-1.5" aria-current={current ? "step" : undefined}>
            <span className="block h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
              {done ? <span className="block h-full w-full bg-slate" /> : null}
              {current ? <span className="block h-full bg-navy" style={{ width: `${Math.round(fill * 100)}%` }} /> : null}
            </span>
            <span className={`sr-only text-[12px] leading-tight desk:not-sr-only ${current ? "font-semibold text-ink" : "text-text-muted"}`}>
              {name}
              <span className="sr-only">{done ? ", finished" : current ? ", in progress" : ", still to come"}</span>
            </span>
          </li>
        );
      })}
    </ol>
    {/* Phone: the five names don't fit under the segments, so they wrap
        as one line below the bar instead. */}
    <p aria-hidden="true" className="text-caption text-text-muted desk:hidden">
      {stageNames.map((name, i) => (
        <span key={name} className={!finished && i + 1 === stage ? "font-semibold text-ink" : undefined}>
          {i ? " · " : ""}{name}
        </span>
      ))}
    </p>
    </div>
  );
}

// Handoff §6.7 legend under the large house.
export function HouseLegend() {
  const items = [
    ["bg-slate", "Finished stages"],
    ["bg-navy", "This stage"],
    ["border-[1.5px] border-dashed border-dash", "Still to build"],
  ];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-caption text-text-secondary">
      {items.map(([swatch, label]) => (
        <li key={label} className="flex items-center gap-2">
          <span aria-hidden="true" className={`inline-block h-3 w-4 rounded-[3px] ${swatch}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}
