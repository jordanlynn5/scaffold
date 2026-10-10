// The house, drawn from numbers rather than fixed images (handoff §5).
// Each stage has a fixed number of slots, filled by the share of that
// stage's tasks that are done, so the drawing never changes size.
//
// TODO(slice 5): the "stage complete" and "finished" looks, and the slot
// counts agreed with the owner. This draws the in-progress state.

export const stageNames = [
  "Groundwork",
  "Foundation",
  "Walls",
  "Roof",
  "Finishing",
] as const;

type Rect = { x: number; y: number; w: number; h: number };

const GROUND_Y = 286;
const LEFT = 140;
const RIGHT = 340;
const WALL_TOP = 142;
const WALL_BOTTOM = 250;

// Stage 1, Groundwork: one row of footings on the ground.
const footings: Rect[] = Array.from({ length: 6 }, (_, i) => ({
  x: 128 + i * 37.33,
  y: 274,
  w: 35.33,
  h: 10,
}));

// Stage 2, Foundation: 2 rows of wide blocks.
const foundation: Rect[] = [1, 0].flatMap((row) =>
  Array.from({ length: 4 }, (_, i) => ({
    x: 132 + i * 54,
    y: 250 + row * 12,
    w: 52,
    h: 10,
  })),
);

// Stage 3, Walls: 6 rows of bricks in running bond, bottom row first.
const walls: Rect[] = Array.from({ length: 6 }, (_, r) => r).flatMap((r) => {
  const y = WALL_BOTTOM - (r + 1) * 18;
  const offset = r % 2 === 1;
  const bricks: Rect[] = [];
  let x = LEFT;
  if (offset) {
    bricks.push({ x, y, w: 10.5, h: 16 });
    x += 12.5;
  }
  while (x < RIGHT - 1) {
    const w = Math.min(23, RIGHT - x);
    bricks.push({ x, y, w, h: 16 });
    x += 25;
  }
  return bricks;
});

// Stage 4, Roof: bands from the eaves up to the peak.
const PEAK = { x: 240, y: 62 };
const EAVES = { left: 122, right: 358, y: WALL_TOP - 2 };
const ROOF_BANDS = 5;
const roofBands = Array.from({ length: ROOF_BANDS }, (_, i) => {
  const at = (t: number) => ({
    y: EAVES.y - t * (EAVES.y - PEAK.y),
    left: EAVES.left + t * (PEAK.x - EAVES.left),
    right: EAVES.right - t * (EAVES.right - PEAK.x),
  });
  const a = at(i / ROOF_BANDS);
  const b = at((i + 1) / ROOF_BANDS);
  return `M${a.left} ${a.y}L${a.right} ${a.y}L${b.right} ${b.y}L${b.left} ${b.y}Z`;
});

function laidCount(slots: number, stageIndex: number, stage: number, fill: number) {
  if (stageIndex < stage) return slots;
  if (stageIndex > stage) return 0;
  return Math.round(Math.min(1, Math.max(0, fill)) * slots);
}

function slotClass(stageIndex: number, stage: number, laid: boolean) {
  if (!laid) return "fill-none stroke-dash";
  return stageIndex < stage ? "fill-slate stroke-slate" : "fill-navy stroke-navy";
}

export function House({
  stage,
  fill,
  bricksLaid,
  scaffolding = true,
  className,
}: {
  /** Current stage, 1 to 5. */
  stage: number;
  /** Share of the current stage that is done, 0 to 1. */
  fill: number;
  bricksLaid?: number;
  scaffolding?: boolean;
  className?: string;
}) {
  const label = [
    `Your house: stage ${stage} of 5, ${stageNames[stage - 1]}`,
    bricksLaid === undefined ? null : `${bricksLaid} bricks laid`,
    stage < 5 ? "the rest still to build" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const groups: [Rect[], number][] = [
    [footings, 1],
    [foundation, 2],
    [walls, 3],
  ];
  const roofLaid = laidCount(ROOF_BANDS, 4, stage, fill);
  const finishingLaid = laidCount(2, 5, stage, fill);

  return (
    <svg viewBox="0 0 480 320" role="img" aria-label={label} className={className}>
      <path
        d={`M0 ${GROUND_Y}h480`}
        strokeWidth={3}
        strokeLinecap="round"
        className="stroke-ground"
      />

      {groups.map(([rects, stageIndex]) => {
        const laid = laidCount(rects.length, stageIndex, stage, fill);
        return rects.map((r, i) => (
          <rect
            key={`${stageIndex}-${i}`}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            rx={1.5}
            strokeWidth={i < laid ? 0 : 1.5}
            strokeDasharray={i < laid ? undefined : "4 3"}
            className={slotClass(stageIndex, stage, i < laid)}
          />
        ));
      })}

      {roofBands.map((d, i) => (
        <path
          key={d}
          d={d}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeDasharray={i < roofLaid ? undefined : "6 5"}
          className={slotClass(4, stage, i < roofLaid)}
        />
      ))}

      {/* Finishing: the door, then the window. */}
      <rect
        x={224}
        y={198}
        width={32}
        height={52}
        rx={2}
        strokeWidth={1.5}
        strokeDasharray={finishingLaid > 0 ? undefined : "6 5"}
        className={finishingLaid > 0 ? "fill-yellow stroke-ink" : "fill-surface stroke-dash"}
      />
      <rect
        x={164}
        y={170}
        width={34}
        height={30}
        rx={2}
        strokeWidth={1.5}
        strokeDasharray={finishingLaid > 1 ? undefined : "6 5"}
        className={finishingLaid > 1 ? "fill-sky stroke-navy" : "fill-surface stroke-dash"}
      />

      {scaffolding ? <Scaffolding /> : null}
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
