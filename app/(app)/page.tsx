import { EmptyLot } from "@/components/house/EmptyLot";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TeammateBadge, type TeammateId } from "@/components/ui/Teammate";

const steps: { who: TeammateId; verb: string; withWhom: string }[] = [
  { who: "alice", verb: "Design", withWhom: "with Alice" },
  { who: "georgina", verb: "Plan", withWhom: "with Georgina" },
  { who: "sarah", verb: "Build daily", withWhom: "with Sarah" },
];

// Home before a goal is set, new user. Handoff §6.1.
export default function HomePage() {
  return (
    <Card padded={false} className="mx-auto max-w-[720px] overflow-hidden">
      <div className="bg-grid-paper border-b border-line px-4 pt-4">
        <EmptyLot className="mx-auto w-full max-w-[520px]" />
      </div>
      <div className="flex flex-col items-center gap-5 p-5 text-center desk:p-8">
        <h1 className="text-h1">Every dream house starts with a plan</h1>
        <p className="text-body text-text-secondary">
          Your lot is ready. Tell Alice, your Architect, what you want to
          accomplish. It takes about 5 minutes.
        </p>
        <ul className="grid w-full grid-cols-1 gap-3 desk:grid-cols-3">
          {steps.map((step) => (
            <li key={step.who}>
              <Card variant="quiet" className="flex items-center gap-3 text-left">
                <TeammateBadge who={step.who} />
                <span className="text-body-sm">
                  <strong className="font-semibold">{step.verb}</strong>{" "}
                  <span className="text-text-secondary">{step.withWhom}</span>
                </span>
              </Card>
            </li>
          ))}
        </ul>
        <div className="flex w-full flex-col items-center gap-1">
          <ButtonLink href="/onboarding" className="w-full desk:w-auto">
            Get to work on your dream →
          </ButtonLink>
          <ButtonLink href="/team" variant="link">
            Not sure what to build? Chat with Alice
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}
