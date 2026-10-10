import {
  stepBarIndex,
  stepBarLabels,
  type OnboardingStep,
} from "@/lib/onboarding/steps";

// Handoff §4.7, onboarding step bar: You, Wish, Outcome, Obstacle, Plan.
// Done: navy. Current: yellow with a heavier label. Future: track.
export function StepBar({ step }: { step: OnboardingStep }) {
  const current = stepBarIndex(step);
  return (
    <ol aria-label="Steps in designing your goal" className="grid grid-cols-5 gap-1.5">
      {stepBarLabels.map((label, i) => (
        <li
          key={label}
          aria-current={i === current ? "step" : undefined}
          className="flex flex-col gap-1.5"
        >
          <span
            className={`h-2 rounded-full ${
              i < current ? "bg-navy" : i === current ? "bg-yellow" : "bg-track"
            }`}
          />
          <span
            className={`text-[13px] ${
              i === current ? "font-semibold text-ink" : "text-text-muted"
            }`}
          >
            {label}
            {i < current ? <span className="sr-only"> (done)</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
