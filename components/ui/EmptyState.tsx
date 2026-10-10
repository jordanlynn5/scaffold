import type { ReactNode } from "react";
import { ButtonLink } from "./Button";
import { Card } from "./Card";

// Handoff §6.2: the card each tab shows before a goal exists. Every one
// points to Alice.
export function EmptyState({
  illustration,
  heading,
  body,
  button,
}: {
  illustration: ReactNode;
  heading: string;
  body: string;
  button: string;
}) {
  return (
    <Card padded={false} className="mx-auto max-w-[640px] overflow-hidden">
      <div className="bg-grid-paper border-b border-line px-4 pt-4">
        {illustration}
      </div>
      <div className="flex flex-col items-center gap-4 p-5 text-center desk:p-8">
        <h2 className="text-h2">{heading}</h2>
        <p className="text-body text-text-secondary">{body}</p>
        <div className="flex w-full flex-col items-center gap-1 pt-2">
          <ButtonLink href="/onboarding" className="w-full desk:w-auto">
            {button}
          </ButtonLink>
          <p className="pt-2 text-[13px] text-text-muted">
            About 5 minutes with Alice
          </p>
          <ButtonLink href="/team" variant="link">
            Not sure what to build? Chat with Alice
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
