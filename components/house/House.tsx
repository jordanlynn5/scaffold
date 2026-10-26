// The house, drawn from numbers rather than fixed images (handoff §5).
// Each stage has a fixed number of slots (12, 12, 51, 12, 12, agreed with
// the owner), filled by the share of that stage's tasks that are done, so
// the drawing never changes size however long a stage is.
import { STAGE_SLOTS, slotsLaid } from "@/lib/progress/derive";

export const stageNames = [
  "Groundwork",
  "Foundation",
  "Walls",
  "Roof",
  "Finishing",
] as const;

type Rect = { x: number; y: number; w: number; h: number };

const GROUND_Y = 286;
// The handoff's 480 × 320 canvas, trimmed to the house, scaffolding and ground.
const TIGHT_VIEWBOX = "72 50 336 258";
const LEFT = 140;
const RIGHT = 340;
const WALL_TOP = 142;
const WALL_BOTTOM = 250;

// Stage 1, Groundwork: two rows of footings, the lower row in the ground.
const footings: Rect[] = [290, 274].flatMap((y) =>
  Array.from({ length: 6 }, (_, i) => ({ x: 128 + i * 37.33, y, w: 35.33, h: 10 })),
);

// Stage 2, Foundation: 2 rows of wide blocks, bottom row first.
const foundation: Rect[] = [262, 250].flatMap((y) =>
  Array.from({ length: 6 }, (_, i) => ({ x: 132 + i * 36, y, w: 34, h: 10 })),
);

// Stage 3, Walls: 6 rows of bricks in running bond, bottom row first (51).
const walls: Rect[] = Array.from({ length: 6 }, (_, r) => r).flatMap((r) => {
  const y = WALL_BOTTOM - (r + 1) * 18;
  const bricks: Rect[] = [];
  let x = LEFT;
  if (r % 2 === 1) {
    bricks.push({ x, y, w: 10.5, h: 16 });
    x += 12.5;
  }
  while (x < RIGHT - 1) {
    bricks.push({ x, y, w: Math.min(23, RIGHT - x), h: 16 });
    x += 25;
  }
  return bricks;
});

// Stage 4, Roof: 3 rows of 4 tiles from the eaves up to the peak.
const PEAK = { x: 240, y: 62 };
const EAVES = { left: 122, right: 358, y: WALL_TOP - 2 };
const ROOF_ROWS = 3;
const TILES_PER_ROW = 4;
const roofAt = (t: number) => ({
  y: EAVES.y - t * (EAVES.y - PEAK.y),
  left: EAVES.left + t * (PEAK.x - EAVES.left),
  right: EAVES.right - t * (EAVES.right - PEAK.x),
});
const roofTiles: string[] = Array.from({ length: ROOF_ROWS }, (_, row) => row).flatMap((row) => {
  const low = roofAt(row / ROOF_ROWS);
  const high = roofAt((row + 1) / ROOF_ROWS);
  // Height of the roof outline at x, within this row.
  const top = (x: number) => {
    if (x < high.left) return low.y - ((x - low.left) / (high.left - low.left)) * (low.y - high.y);
    if (x > high.right) return low.y - ((low.right - x) / (low.right - high.right)) * (low.y - high.y);
    return high.y;
  };
  const width = (low.right - low.left) / TILES_PER_ROW;
  return Array.from({ length: TILES_PER_ROW }, (_, i) => {
    const x0 = low.left + i * width;
    const x1 = x0 + width;
    const points = [[x0, low.y], [x1, low.y], [x1, top(x1)]];
    if (high.right > x0 && high.right < x1) points.push([high.right, high.y]);
    if (high.left > x0 && high.left < x1) points.push([high.left, high.y]);
    points.push([x0, top(x0)]);
    return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
  });
});
const roofOutline = `M${EAVES.left} ${EAVES.y}L${PEAK.x} ${PEAK.y}L${EAVES.right} ${EAVES.y}Z`;

// Stage 5, Finishing (12 pieces): door, doorstep, two windows of four panes,
// the round attic window and the chimney.
const panes = (x: number, y: number): Rect[] =>
  [0, 1].flatMap((row) => [0, 1].map((col) => ({ x: x + col * 17, y: y + row * 15, w: 15, h: 13 })));
const DOOR: Rect = { x: 224, y: 196, w: 32, h: 48 };
const STEP: Rect = { x: 216, y: 244, w: 48, h: 6 };
const LEFT_WINDOW = { x: 166, y: 170 };
const RIGHT_WINDOW = { x: 282, y: 170 };
const windowPanes = [...panes(LEFT_WINDOW.x, LEFT_WINDOW.y), ...panes(RIGHT_WINDOW.x, RIGHT_WINDOW.y)];
const ATTIC = { cx: 240, cy: 108, r: 10 };
const CHIMNEY: Rect = { x: 302, y: 76, w: 18, h: 34 };

type Look = "finished" | "current" | "todo";

const lookClass: Record<Look, string> = {
  finished: "fill-slate stroke-slate",
  current: "fill-navy stroke-navy",
  todo: "fill-none stroke-dash",
};

function looks(slots: number, stageIndex: number, stage: number, fill: number, stageComplete: boolean): Look[] {
  const laid = slotsLaid(slots, stageIndex, stage, fill, stageComplete);
  return Array.from({ length: slots }, (_, i) =>
    i >= laid ? "todo" : stageIndex < stage ? "finished" : "current",
  );
}

export function House({
  stage,
  fill,
  bricksLaid,
  stageComplete = false,
  finished = false,
  scaffolding = !finished,
  tight = false,
  className,
}: {
  /** Current stage, 1 to 5. */
  stage: number;
  /** Share of the current stage that is done, 0 to 1. */
  fill: number;
  bricksLaid?: number;
  /** The current stage drawn fully laid (the milestone celebration). */
  stageComplete?: boolean;
  /** The whole house built, scaffolding down (handoff §5, "Finished house"). */
  finished?: boolean;
  scaffolding?: boolean;
  /** Trim the empty margin around the house so it fills its card. */
  tight?: boolean;
  className?: string;
}) {
  const viewBox = tight ? TIGHT_VIEWBOX : "0 0 480 320";
  const label = finished
    ? `Your finished house${bricksLaid === undefined ? "" : `, ${bricksLaid} bricks laid`}`
    : [
        `Your house: stage ${stage} of 5, ${stageNames[stage - 1]}${stageComplete ? ", complete" : ""}`,
        bricksLaid === undefined ? null : `${bricksLaid} bricks laid`,
        stage < 5 ? "the rest still to build" : null,
      ]
        .filter(Boolean)
        .join(", ");

  if (finished) return <FinishedHouse label={label} viewBox={viewBox} className={className} />;

  const [g, f, w, r, fin] = STAGE_SLOTS.map((slots, i) => looks(slots, i + 1, stage, fill, stageComplete));

  const rect = (box: Rect, look: Look, key: string, rx = 1.5) => (
    <rect
      key={key}
      x={box.x}
      y={box.y}
      width={box.w}
      height={box.h}
      rx={rx}
      strokeWidth={look === "todo" ? 1.5 : 0}
      strokeDasharray={look === "todo" ? "4 3" : undefined}
      className={lookClass[look]}
    />
  );

  // Finishing pieces sit over the walls, so an unbuilt one keeps a white
  // fill behind its dashed outline.
  const finishing = (look: Look) =>
    look === "todo" ? "fill-surface stroke-dash" : look === "finished" ? "fill-slate stroke-slate" : "fill-navy stroke-navy";

  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={className}>
      <path d={`M0 ${GROUND_Y}h480`} strokeWidth={3} strokeLinecap="round" className="stroke-ground" />

      {footings.map((box, i) => rect(box, g[i], `g${i}`))}
      {foundation.map((box, i) => rect(box, f[i], `f${i}`))}
      {walls.map((box, i) => rect(box, w[i], `w${i}`))}

      {roofTiles.map((d, i) => (
        <path
          key={`r${i}`}
          d={d}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeDasharray={r[i] === "todo" ? "6 5" : undefined}
          className={r[i] === "todo" ? "fill-none stroke-dash" : `${lookClass[r[i]].split(" ")[0]} stroke-surface`}
        />
      ))}

      {[DOOR, STEP].map((box, i) => (
        <rect
          key={`d${i}`}
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={2}
          strokeWidth={1.5}
          strokeDasharray={fin[i] === "todo" ? "5 4" : undefined}
          className={finishing(fin[i])}
        />
      ))}
      {windowPanes.map((box, i) => (
        <rect
          key={`p${i}`}
          x={box.x}
          y={box.y}
          width={box.w}
          height={box.h}
          rx={1}
          strokeWidth={1.5}
          strokeDasharray={fin[i + 2] === "todo" ? "4 3" : undefined}
          className={finishing(fin[i + 2])}
        />
      ))}
      <circle
        cx={ATTIC.cx}
        cy={ATTIC.cy}
        r={ATTIC.r}
        strokeWidth={1.5}
        strokeDasharray={fin[10] === "todo" ? "4 3" : undefined}
        className={finishing(fin[10])}
      />
      <rect
        x={CHIMNEY.x}
        y={CHIMNEY.y}
        width={CHIMNEY.w}
        height={CHIMNEY.h}
        rx={1.5}
        strokeWidth={1.5}
        strokeDasharray={fin[11] === "todo" ? "4 3" : undefined}
        className={finishing(fin[11])}
      />

      {scaffolding ? <Scaffolding /> : null}
    </svg>
  );
}

// Handoff §5: light walls, ink roof with a yellow outline, yellow door,
// sky-blue windows with navy frames, a round attic window and a chimney.
function FinishedHouse({ label, viewBox, className }: { label: string; viewBox: string; className?: string }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={className}>
      <path d={`M0 ${GROUND_Y}h480`} strokeWidth={3} strokeLinecap="round" className="stroke-ground" />
      {[...footings, ...foundation].map((box, i) => (
        <rect key={i} x={box.x} y={box.y} width={box.w} height={box.h} rx={1.5} className="fill-slate" />
      ))}
      <rect x={LEFT} y={WALL_TOP} width={RIGHT - LEFT} height={WALL_BOTTOM - WALL_TOP} className="fill-text-on-navy stroke-slate" strokeWidth={1.5} />
      <rect x={CHIMNEY.x} y={CHIMNEY.y} width={CHIMNEY.w} height={CHIMNEY.h} rx={1.5} className="fill-ink stroke-yellow" strokeWidth={2} />
      <path d={roofOutline} strokeWidth={3} strokeLinejoin="round" className="fill-ink stroke-yellow" />
      <circle cx={ATTIC.cx} cy={ATTIC.cy} r={ATTIC.r} strokeWidth={3} className="fill-sky stroke-navy" />
      {[LEFT_WINDOW, RIGHT_WINDOW].map((win) => (
        <g key={win.x}>
          <rect x={win.x - 1} y={win.y - 1} width={34} height={30} rx={2} strokeWidth={3} className="fill-sky stroke-navy" />
          <path d={`M${win.x + 16} ${win.y - 1}v30M${win.x - 1} ${win.y + 14}h34`} strokeWidth={2} className="stroke-navy" />
        </g>
      ))}
      <rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} rx={2} strokeWidth={1.5} className="fill-yellow stroke-ink" />
      <circle cx={DOOR.x + DOOR.w - 7} cy={DOOR.y + DOOR.h / 2} r={2} className="fill-ink" />
      <rect x={STEP.x} y={STEP.y} width={STEP.w} height={STEP.h} rx={2} className="fill-slate" />
    </svg>
  );
}

// Yellow poles and planks with thin diagonal braces, drawn over the house.
function Scaffolding() {
  const towers = [
    [98, 126],
    [354, 382],
  ];
  return (
    <g strokeLinecap="round" className="stroke-yellow" fill="none">
      {towers.map(([a, b]) => (
        <g key={a}>
          <path d={`M${a} ${GROUND_Y}V104M${b} ${GROUND_Y}V104`} strokeWidth={4.5} />
          <path d={`M${a - 6} 228H${b + 6}M${a - 6} 168H${b + 6}M${a - 6} 112H${b + 6}`} strokeWidth={4.5} />
          <path
            d={`M${a} 228L${b} 168M${a} 168L${b} 112M${a} ${GROUND_Y}L${b} 228`}
            strokeWidth={1.5}
          />
        </g>
      ))}
    </g>
  );
}
