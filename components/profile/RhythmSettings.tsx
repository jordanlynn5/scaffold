"use client";

import { useState, useTransition } from "react";
import { saveRhythm } from "@/app/(app)/profile/actions";
import { Card } from "@/components/ui/Card";
import { nudgeTimes } from "@/lib/validation";

// Handoff §4.9
const hints = [
  "A gentle start. Room for a busy life.",
  "Steady and light.",
  "A good rhythm for most people.",
  "Solid progress with rest days built in.",
  "Most weekdays. Ambitious but doable.",
  "Nearly every day. Leave one day to rest.",
  "Every day. Only if it truly fits your life.",
];

type Status = "idle" | "saved" | "failed";

function SaveStatus({ status, pending }: { status: Status; pending: boolean }) {
  const text = pending
    ? "Saving…"
    : status === "saved"
      ? "Saved."
      : status === "failed"
        ? "That didn't save. Try again in a moment."
        : "";
  return (
    <p aria-live="polite" className="min-h-5 text-[13px] text-text-muted">
      {text}
    </p>
  );
}

function useSave() {
  const [status, setStatus] = useState<Status>("idle");
  const [pending, startTransition] = useTransition();
  function save(change: Parameters<typeof saveRhythm>[0], onFail: () => void) {
    startTransition(async () => {
      const result = await saveRhythm(change);
      setStatus(result.ok ? "saved" : "failed");
      if (!result.ok) onFail();
    });
  }
  return { status, pending, save };
}

const stepButton =
  "inline-flex size-11 items-center justify-center rounded-button border border-input-border bg-surface text-[22px] font-medium text-ink disabled:opacity-40";

// Handoff §6.10 card 2 and §4.9: the – [value] + stepper, 1 to 7.
export function WeeklyTarget({ initial }: { initial: number }) {
  const [days, setDays] = useState(initial);
  const { status, pending, save } = useSave();

  function change(next: number) {
    const before = days;
    setDays(next);
    save({ weekly_target: next }, () => setDays(before));
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-h3">Weekly target</h2>
      <Card variant="quiet" className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="One day fewer"
            className={stepButton}
            disabled={days <= 1}
            onClick={() => change(days - 1)}
          >
            –
          </button>
          <p aria-live="polite" className="min-w-24 text-center">
            <span className="font-heading text-[26px] font-bold">{days}</span>{" "}
            <span className="text-body-sm text-text-secondary">
              {days === 1 ? "day a week" : "days a week"}
            </span>
          </p>
          <button
            type="button"
            aria-label="One day more"
            className={stepButton}
            disabled={days >= 7}
            onClick={() => change(days + 1)}
          >
            +
          </button>
        </div>
        <p className="text-center text-body-sm text-text-secondary">
          {hints[days - 1]}
        </p>
      </Card>
      <p className="text-[13px] text-text-muted">
        Changes apply right away, including this week.
      </p>
      <SaveStatus status={status} pending={pending} />
    </Card>
  );
}

// Handoff §6.10 card 3, plus the WhatsApp consent from sign-up (§6.0b).
export function DailyNudge({
  initialTime,
  initialConsent,
}: {
  initialTime: string;
  initialConsent: boolean;
}) {
  const [time, setTime] = useState(initialTime);
  const [consent, setConsent] = useState(initialConsent);
  const { status, pending, save } = useSave();

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-h3">Daily nudge from Sarah</h2>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nudge_time" className="text-caption text-ink">
          WhatsApp message arrives at
        </label>
        <select
          id="nudge_time"
          value={time}
          onChange={(event) => {
            const before = time;
            setTime(event.target.value);
            save({ nudge_time: event.target.value }, () => setTime(before));
          }}
          className="min-h-12 max-w-[220px] rounded-input border border-input-border bg-surface px-3 text-body text-ink"
        >
          {nudgeTimes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-input border border-input-border bg-surface p-3.5 text-body-sm text-ink">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            const before = consent;
            setConsent(event.target.checked);
            save({ whatsapp_consent: event.target.checked }, () =>
              setConsent(before),
            );
          }}
          className="mt-0.5 size-[22px] shrink-0 accent-navy"
        />
        <span>
          Yes, send me one message a day on WhatsApp with my task. I can stop
          it any time.
        </span>
      </label>
      {consent ? null : (
        <p className="text-body-sm text-text-secondary">
          Sarah won&apos;t message you on WhatsApp until this is ticked.
        </p>
      )}
      <SaveStatus status={status} pending={pending} />
    </Card>
  );
}
