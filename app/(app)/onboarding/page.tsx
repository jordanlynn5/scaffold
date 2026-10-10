import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TeammateBadge, TeammateLabel } from "@/components/ui/Teammate";

export const metadata: Metadata = { title: "Design your goal · Scaffold" };

// PLACEHOLDER. The onboarding chat with Alice (handoff §6.4) is built in
// checklist slice 2. This wording is not final copy.
export default function OnboardingPage() {
  return (
    <Card className="mx-auto flex max-w-[640px] flex-col gap-4">
      <div className="flex items-center gap-3">
        <TeammateBadge who="alice" size={36} />
        <TeammateLabel who="alice" />
      </div>
      <p className="text-body text-text-secondary">
        Placeholder: the chat where you design your goal with Alice is the
        next thing being built.
      </p>
      <div>
        <ButtonLink href="/" variant="secondary">
          Back to Home
        </ButtonLink>
      </div>
    </Card>
  );
}
