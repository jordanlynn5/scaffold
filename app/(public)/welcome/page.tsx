import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TeamBubble, UserBubble } from "@/components/chat/Bubble";
import { House } from "@/components/house/House";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Chip";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import {
  TeammateBadge,
  teammates,
  type TeammateId,
} from "@/components/ui/Teammate";

// The public landing page (handoff §6.0). Logged-out visitors see it at "/":
// proxy.ts serves this route there. One action only: sign up.

export const metadata: Metadata = {
  title: "Scaffold · One small task at a time",
  description:
    "For anyone with an ambitious goal who finds it hard to stay consistent. Scaffold turns that goal into one small task a day and helps you keep going.",
};

const section = "px-4 py-14 desk:px-10 desk:py-24";
const inner = "mx-auto w-full max-w-[1160px]";

const benefits: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "target",
    title: "Know what to do next",
    text: "Get one clear, manageable task at a time.",
  },
  {
    icon: "heart",
    title: "Keep going without guilt",
    text: "Gentle nudges and a weekly target that leaves room for life.",
  },
  {
    icon: "house",
    title: "See your progress",
    text: "Watch small actions add up toward something you care about.",
  },
];

const team: { who: TeammateId; line: string; alt: string }[] = [
  {
    who: "alice",
    line: "Helps you shape your goal and remembers why it matters to you.",
    alt: "Alice, the Architect, wearing a headset and glasses, pointing at a yellow blueprint",
  },
  {
    who: "georgina",
    line: "Turns your goal into a plan of small, manageable tasks.",
    alt: "Georgina, the General Contractor, wearing a headset and a safety vest, pointing at a clipboard of daily tasks",
  },
  {
    who: "paula",
    line: "Keeps an eye on your progress and adjusts the plan with you.",
    alt: "Paula, the Project Manager, wearing a headset, standing between two schedule charts",
  },
  {
    who: "sarah",
    line: "Sends your task each day with a gentle nudge.",
    alt: "Sarah, the Site Lead, wearing a headset and holding a megaphone that says Keep going",
  },
];

export default function LandingPage() {
  return (
    <div id="top" className="flex flex-1 flex-col">
      <Hero />
      <Benefits />
      <HowItWorks />
      <Team />
      <ClosingCta />
      <footer className="bg-ink px-4 py-8 desk:px-10">
        <div className={`${inner} flex flex-wrap items-center justify-between gap-4`}>
          <Logo size={30} />
          <p className="text-body-sm text-text-on-navy">
            Built one brick at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}

function GetStarted({ className }: { className?: string }) {
  return (
    <ButtonLink
      href="/sign-up"
      variant="highlight"
      className={`min-h-14 px-7 text-[18px] ${className ?? ""}`}
    >
      Get started on your goal →
    </ButtonLink>
  );
}

function Hero() {
  return (
    <header className="bg-grid-navy px-4 desk:px-10">
      <div className={`${inner} flex items-center justify-between py-4 desk:py-6`}>
        <Link href="#top" aria-label="Scaffold, top of page">
          <Logo size={34} />
        </Link>
        <nav aria-label="Page" className="flex items-center gap-6">
          <Link
            href="#how"
            className="hidden min-h-11 items-center text-[15px] font-medium text-text-on-navy hover:underline desk:inline-flex"
          >
            How it works
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center rounded-button border border-text-on-navy px-4 text-[15px] font-semibold text-surface"
          >
            Get started
          </Link>
        </nav>
      </div>

      <div
        className={`${inner} grid grid-cols-1 items-center gap-10 pt-8 pb-14 desk:grid-cols-2 desk:gap-14 desk:pt-14 desk:pb-24`}
      >
        <div className="flex flex-col items-start gap-6">
          <h1 className="font-heading text-[38px] leading-[1.05] font-bold text-surface desk:text-[60px]">
            Make progress on what matters to you,{" "}
            <span className="text-yellow">one small task at a time.</span>
          </h1>
          <p className="max-w-[540px] text-[17px] leading-[1.55] text-text-on-navy desk:text-[19px]">
            For anyone with an ambitious goal who finds it hard to stay
            consistent. Scaffold turns that goal into one small task a day and
            helps you keep going.
          </p>
          <div className="flex w-full flex-col items-start gap-2 desk:w-auto">
            <GetStarted className="w-full desk:w-auto" />
            <Link
              href="#how"
              className="inline-flex min-h-11 items-center text-[15px] font-medium text-text-on-navy hover:underline"
            >
              See how it works
            </Link>
          </div>
        </div>

        <HeroVisual />
      </div>
    </header>
  );
}

// The real product, not a stock image. Example data only.
function HeroVisual() {
  return (
    <figure
      aria-label="A preview of Scaffold: a house under construction at stage 3 of 5 with 20 bricks laid, today's ten-minute task, and a weekly target of 2 of 4 days"
      className="relative flex flex-col gap-4 desk:block desk:px-6 desk:py-10"
    >
      <div
        aria-hidden="true"
        className="bg-grid-paper rounded-card p-4 shadow-dialog desk:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tag>Stage 3 of 5 · Walls</Tag>
          <span className="text-caption text-text-muted">20 bricks laid</span>
        </div>
        {/* 20 of the 51 wall bricks */}
        <House stage={3} fill={20 / 51} bricksLaid={20} className="w-full" />
      </div>

      <div
        aria-hidden="true"
        className="rounded-card bg-ink p-4 text-surface shadow-float desk:absolute desk:top-0 desk:right-0 desk:w-[230px]"
      >
        <p className="text-caption">This week: 2 of 4 days</p>
        <div className="mt-2.5 flex gap-2">
          <span className="h-7 flex-1 rounded-[6px] bg-yellow" />
          <span className="h-7 flex-1 rounded-[6px] bg-yellow" />
          <span className="h-7 flex-1 rounded-[6px] border-2 border-dashed border-yellow" />
          <span className="h-7 flex-1 rounded-[6px] bg-surface/15" />
        </div>
        <p className="mt-2.5 text-[13px] text-text-on-navy">
          Room for real life, no guilt.
        </p>
      </div>

      <div
        aria-hidden="true"
        className="rounded-card border border-line bg-surface p-4 shadow-float desk:absolute desk:bottom-0 desk:-left-4 desk:w-[290px]"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="yellow">Today&apos;s brick</Tag>
          <span className="text-[13px] text-text-muted">About 10 minutes</span>
        </div>
        <p className="mt-2 font-heading text-[18px] leading-tight font-bold text-ink">
          Draw 5 hands, 2 minutes each
        </p>
        <div className="mt-3 flex min-h-11 items-center justify-center rounded-button bg-navy text-[15px] font-semibold text-surface">
          Mark as done
        </div>
      </div>
    </figure>
  );
}

function SectionHeading({
  label,
  title,
  intro,
}: {
  label: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="flex max-w-[720px] flex-col gap-3">
      <p className="text-label text-text-muted">{label}</p>
      <h2 className="font-heading text-[28px] leading-[1.15] font-bold desk:text-[38px]">
        {title}
      </h2>
      {intro ? <p className="text-body text-text-secondary">{intro}</p> : null}
    </div>
  );
}

function Benefits() {
  return (
    <section className={`bg-bg ${section}`}>
      <div className={`${inner} flex flex-col gap-8 desk:gap-12`}>
        <SectionHeading label="Why Scaffold" title="Small steps that actually add up" />
        <ul className="grid grid-cols-1 gap-4 desk:grid-cols-3 desk:gap-5">
          {benefits.map((b) => (
            <li key={b.title}>
              <Card className="flex h-full flex-col gap-3">
                <span className="inline-flex size-[52px] items-center justify-center rounded-input bg-navy text-yellow">
                  <Icon name={b.icon} size={26} />
                </span>
                <h3 className="text-h3">{b.title}</h3>
                <p className="text-body text-text-secondary">{b.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className={`scroll-mt-4 bg-surface ${section}`}>
      <div className={`${inner} flex flex-col gap-8 desk:gap-12`}>
        <SectionHeading
          label="How it works"
          title="From a goal to daily progress in three steps"
        />
        <ol className="grid grid-cols-1 gap-8 desk:grid-cols-3 desk:gap-5">
          <Step
            n={1}
            title="Choose a goal"
            text="Pick something you want to get better at or accomplish."
          >
            <TeamBubble>What do you want to accomplish?</TeamBubble>
            <UserBubble>Become a better illustrator</UserBubble>
          </Step>
          <Step
            n={2}
            title="Make a plan"
            text="Scaffold turns it into small, manageable tasks."
          >
            {[
              ["Day 1", "Draw 5 hands, 2 minutes each", "10 min"],
              ["Day 2", "Sketch 3 faces from photos", "12 min"],
              ["Day 3", "Shade one simple object", "15 min"],
            ].map(([day, task, minutes]) => (
              <div
                key={day}
                className="flex items-center gap-2.5 rounded-button border border-line bg-surface px-3 py-2 text-[13px]"
              >
                <span className="shrink-0 font-semibold text-text-muted">{day}</span>
                <span className="min-w-0 flex-1 truncate text-ink">{task}</span>
                <span className="shrink-0 rounded-badge bg-track px-2 py-0.5 text-text-secondary">
                  {minutes}
                </span>
              </div>
            ))}
          </Step>
          <Step
            n={3}
            title="Keep making progress"
            text="Get gentle nudges, mark tasks done, and see how far you've come."
          >
            <TeamBubble>Five hands today. Small bricks, solid walls.</TeamBubble>
            <div className="flex gap-1.5">
              {[1, 1, 1, 0, 0, 0, 0].map((done, i) => (
                <span
                  key={i}
                  className={`h-5 flex-1 rounded-[5px] ${done ? "bg-navy" : "bg-track"}`}
                />
              ))}
            </div>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-navy">
              <Icon name="check" size={16} />
              Done: one more brick in the wall
            </p>
          </Step>
        </ol>
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  text,
  children,
}: {
  n: number;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col gap-3">
      <div
        aria-hidden="true"
        className="bg-grid-paper flex h-[200px] flex-col justify-center gap-2.5 overflow-hidden rounded-card border border-line p-4 text-[14px] [&_.text-body]:text-[14px]"
      >
        {children}
      </div>
      <span
        aria-hidden="true"
        className="mt-2 inline-flex size-10 items-center justify-center rounded-full bg-yellow font-heading text-[18px] font-bold text-ink"
      >
        {n}
      </span>
      <h3 className="text-h3">{title}</h3>
      <p className="text-body text-text-secondary">{text}</p>
    </li>
  );
}

function Team() {
  return (
    <section className={`bg-bg ${section}`}>
      <div className={`${inner} flex flex-col gap-8 desk:gap-12`}>
        <SectionHeading
          label="Meet your team"
          title="You're the builder. They've got your back."
          intro="Four teammates, each with one job: helping you build something you care about."
        />
        <ul className="grid grid-cols-2 gap-3 desk:grid-cols-4 desk:gap-5">
          {team.map(({ who, line, alt }) => (
            <li key={who}>
              <Card padded={false} className="flex h-full flex-col overflow-hidden">
                {/* The badge on grid paper shows through if the image fails. */}
                <div className="bg-grid-paper relative flex aspect-square items-center justify-center">
                  <TeammateBadge who={who} size={56} />
                  <Image
                    src={`/team/${who}.webp`}
                    alt={alt}
                    width={800}
                    height={800}
                    loading="lazy"
                    sizes="(width >= 700px) 280px, 50vw"
                    className="absolute inset-0 size-full object-cover"
                  />
                </div>
                {/* Name and role are printed inside the image. */}
                <h3 className="sr-only">
                  {teammates[who].name}, {teammates[who].role}
                </h3>
                <p className="p-3.5 text-body-sm text-text-secondary desk:p-5">
                  {line}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className={`bg-grid-navy ${section}`}>
      <div className="mx-auto flex w-full max-w-[820px] flex-col items-center gap-6 text-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 64 48"
          width={80}
          height={60}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M10 44V22h44v22M6 22L32 4l26 18"
            strokeWidth={2}
            strokeDasharray="4 4"
            className="stroke-text-on-navy"
          />
          <path d="M2 44h60" strokeWidth={2} className="stroke-text-on-navy" />
          <rect x="12" y="36" width="14" height="7" rx="1" className="fill-yellow" />
        </svg>
        <h2 className="font-heading text-[32px] leading-[1.1] font-bold text-surface desk:text-[48px]">
          Big goals begin with one small step.
        </h2>
        <GetStarted className="w-full desk:w-auto" />
      </div>
    </section>
  );
}
