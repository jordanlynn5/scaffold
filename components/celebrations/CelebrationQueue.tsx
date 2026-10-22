"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TeammateLabel } from "@/components/ui/Teammate";
import { Tag } from "@/components/ui/Chip";

export type WeeklyCelebration = {
  id: string;
  kind: "weekly";
  done: number;
  target: number;
  bricksLaid: number;
  days: string[];
  streak: number;
};

export type Celebration = WeeklyCelebration;

// Owed celebrations, shown one at a time in the order given (handoff §7.3:
// milestone first, weekly after it is closed; never two dialogs at once).
export function CelebrationQueue({ items }: { items: Celebration[] }) {
  const [closed, setClosed] = useState<string[]>([]);
  const current = items.find((item) => !closed.includes(item.id));
  if (!current) return null;
  const close = () => {
    setClosed((ids) => [...ids, current.id]);
    void fetch("/api/celebrations/seen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: current.id }),
    });
  };
  return <WeeklyDialog key={current.id} item={current} onClose={close} />;
}

const confettiColors = ["bg-yellow", "bg-navy", "bg-sky", "bg-surface", "bg-confetti-accent"];

// Handoff §2.5: 70–90 pieces, 6–14px, rectangles and dots, falling for
// 2.6–4.6s, staggered over 0–1.4s. Made once from a fixed seed, so server
// and browser draw the same pieces.
const confetti = (() => {
  let seed = 7;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: 80 }, (_, i) => {
    const size = 6 + random() * 8;
    const dot = random() < 0.35;
    return {
      key: i,
      className: `${confettiColors[i % confettiColors.length]} ${dot ? "rounded-full" : "rounded-[2px]"}`,
      style: {
        left: `${random() * 100}%`,
        width: size,
        height: dot ? size : size * 0.55,
        animationDuration: `${2.6 + random() * 2}s`,
        animationDelay: `${random() * 1.4}s`,
      },
    };
  });
})();

function WeeklyDialog({ item, onClose }: { item: WeeklyCelebration; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-ink backdrop:bg-scrim"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden motion-reduce:hidden">
        {confetti.map((piece) => (
          <span key={piece.key} className={`confetti-piece absolute -top-4 ${piece.className}`} style={piece.style} />
        ))}
      </div>
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div className="celebration-pop flex w-full max-w-[460px] flex-col items-center gap-4 rounded-dialog bg-surface p-6 text-center shadow-dialog desk:p-8">
          <span className="flex h-[76px] w-[76px] items-center justify-center rounded-dialog bg-yellow text-ink" aria-hidden="true">
            <Icon name="trophy" size={40} />
          </span>
          <h2 id={titleId} className="text-h2">Congratulations, you hit your weekly target!</h2>
          <p className="text-body text-text-secondary">
            {item.done} of {item.target} {item.target === 1 ? "day" : "days"} this week.{" "}
            {item.bricksLaid} {item.bricksLaid === 1 ? "brick" : "bricks"} in the wall.
          </p>
          {item.days.length ? (
            <ul className="flex flex-wrap justify-center gap-2" aria-label="Days you built this week">
              {item.days.map((day, i) => (
                <li
                  key={day}
                  className={`rounded-full px-3 py-1 text-caption ${i === item.days.length - 1 ? "bg-yellow text-ink" : "bg-navy text-surface"}`}
                >
                  {day}
                </li>
              ))}
            </ul>
          ) : null}
          <Tag tone="yellow">
            {item.streak} {item.streak === 1 ? "week" : "weeks"} on target in a row
          </Tag>
          <div className="w-full rounded-input bg-bg p-4 text-left">
            <TeammateLabel who="sarah" />
            <p className="mt-1 text-body-sm">
              That’s your target for the week. Anything more this week is a bonus, not a must.
            </p>
          </div>
          <Button fullWidth onClick={() => ref.current?.close()}>Back to building</Button>
        </div>
      </div>
    </dialog>
  );
}
