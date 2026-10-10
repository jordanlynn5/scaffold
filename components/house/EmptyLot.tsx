// Handoff §5, required state 1: the empty lot before a goal exists.
// Ground, a dashed house outline, a dashed door, survey stakes and a
// yellow "YOUR LOT" sign.
export function EmptyLot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-label="An empty lot marked out with stakes, with the outline of a house still to be built"
      className={className}
    >
      <g
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="6 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-dash"
      >
        <path d="M150 270V150h180v120" />
        <path d="M134 150l106-82 106 82z" />
        <path d="M222 270v-62h36v62" />
      </g>
      {/* ground */}
      <path d="M0 270h480" strokeWidth={3} strokeLinecap="round" className="stroke-ground" />
      {/* survey stakes with a string line */}
      <g strokeWidth={3} strokeLinecap="round" className="stroke-slate">
        <path d="M112 270v-26" />
        <path d="M368 270v-26" />
      </g>
      <path d="M112 248h256" strokeWidth={1} className="stroke-slate" />
      {/* sign */}
      <path d="M408 270v-58" strokeWidth={4} strokeLinecap="round" className="stroke-slate" />
      <rect x="372" y="176" width="72" height="38" rx="4" className="fill-yellow" />
      <text
        x="408"
        y="200"
        textAnchor="middle"
        className="fill-ink font-heading"
        fontSize="11"
        fontWeight="700"
        letterSpacing="0.6"
      >
        YOUR LOT
      </text>
    </svg>
  );
}

// Handoff §6.2, Progress before a goal: a lot with a dashed house, one navy
// brick and a yellow arrow.
export function FirstBrick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-label="A dashed house outline with one brick ready to be laid"
      className={className}
    >
      <g
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="6 5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-dash"
      >
        <path d="M150 270V150h180v120" />
        <path d="M134 150l106-82 106 82z" />
        <path d="M222 270v-62h36v62" />
      </g>
      <path d="M0 270h480" strokeWidth={3} strokeLinecap="round" className="stroke-ground" />
      <rect x="152" y="252" width="44" height="17" rx="2" className="fill-navy" />
      <g
        fill="none"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-yellow"
      >
        <path d="M84 196c6 34 30 54 58 60" />
        <path d="M128 244l16 13-19 8" />
      </g>
    </svg>
  );
}

// Handoff §6.2, Plan before a goal: a blank blueprint sheet titled
// "YOUR PLAN", dashed lines and a yellow pencil.
export function BlankPlan({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-label="A blank blueprint sheet titled Your Plan, with a pencil beside it"
      className={className}
    >
      <rect
        x="120"
        y="40"
        width="220"
        height="250"
        rx="8"
        strokeWidth={1.5}
        className="fill-surface stroke-input-border"
      />
      <text
        x="144"
        y="78"
        className="fill-navy font-heading"
        fontSize="14"
        fontWeight="700"
        letterSpacing="1"
      >
        YOUR PLAN
      </text>
      <g strokeWidth={1.5} strokeDasharray="6 5" strokeLinecap="round" className="stroke-dash">
        <path d="M144 112h172" />
        <path d="M144 146h172" />
        <path d="M144 180h140" />
        <path d="M144 214h172" />
        <path d="M144 248h110" />
      </g>
      <g transform="rotate(38 380 190)">
        <rect x="372" y="110" width="16" height="130" rx="3" className="fill-yellow" />
        <path d="M372 240h16l-8 20z" className="fill-ink" />
        <rect x="372" y="110" width="16" height="14" rx="3" className="fill-slate" />
      </g>
    </svg>
  );
}
