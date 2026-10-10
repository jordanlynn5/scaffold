import type { Metadata } from "next";
import Link from "next/link";
import { TeamBubble } from "@/components/chat/Bubble";
import { chipClass, ChipRow } from "@/components/ui/Chip";
import { TeammateBadge, TeammateLabel } from "@/components/ui/Teammate";

export const metadata: Metadata = { title: "Talk to Team · Scaffold" };

// Team before a goal is set: the opening of the goal-finder chat with Alice
// (handoff §6.3). The conversation itself is built in checklist slice 14.
// Until then the one reply that already has somewhere to go is offered.
export default function TeamPage() {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-5">
      <header className="flex items-start gap-3">
        <TeammateBadge who="alice" size={36} />
        <div className="flex flex-col gap-0.5">
          <TeammateLabel who="alice" />
          <p className="text-body-sm text-text-secondary">
            Helps you find and design your goal. The rest of the team joins
            once it&apos;s set.
          </p>
        </div>
      </header>

      <div className="bg-grid-paper flex flex-col gap-3 rounded-card border border-line p-4 desk:p-6">
        <TeammateLabel who="alice" />
        <TeamBubble>
          Hi, I&apos;m Alice, your Architect. Not sure what to build yet?
          That&apos;s a good place to start. Let&apos;s find it together.
        </TeamBubble>
        <TeamBubble>
          What do you enjoy, or wish you were better at? Big dreams are welcome
          too.
        </TeamBubble>
      </div>

      <ChipRow>
        <Link href="/onboarding" className={chipClass}>
          I already know my goal
        </Link>
      </ChipRow>
    </div>
  );
}
