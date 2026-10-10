import type { TeammateId } from "@/components/ui/Teammate";

// The questions Alice asks, in order (handoff §6.4). The saved step is the
// question she is waiting on. "done" means every answer is in.
export const onboardingSteps = [
  "name",
  "nudge_time",
  "days",
  "wish",
  "experience",
  "outcome",
  "obstacle",
  "done",
] as const;

export type OnboardingStep = (typeof onboardingSteps)[number];

export function nextStep(step: OnboardingStep): OnboardingStep {
  const i = onboardingSteps.indexOf(step);
  return onboardingSteps[Math.min(i + 1, onboardingSteps.length - 1)];
}

// The step bar (handoff §4.7): You → Wish → Outcome → Obstacle → Plan.
export const stepBarLabels = ["You", "Wish", "Outcome", "Obstacle", "Plan"];

export function stepBarIndex(step: OnboardingStep) {
  const index: Record<OnboardingStep, number> = {
    name: 0,
    nudge_time: 0,
    days: 0,
    wish: 1,
    experience: 1,
    outcome: 2,
    obstacle: 3,
    done: 4,
  };
  return index[step];
}

export type ChatMessage = {
  id: string;
  sender: "user" | TeammateId | "system";
  body: string;
  chips: string[];
};

// What /api/chat sends back, one line at a time, while a teammate replies.
export type ChatEvent =
  | { type: "saved"; step: OnboardingStep }
  | { type: "text"; text: string }
  | { type: "message"; message: ChatMessage; step: OnboardingStep }
  | { type: "idle"; step: OnboardingStep }
  | { type: "error" };
