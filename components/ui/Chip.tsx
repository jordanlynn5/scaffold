import type { ComponentProps, ReactNode } from "react";

// Handoff §4.2. Suggestion chip: quick replies in chats.
export const chipClass =
  "inline-flex shrink-0 items-center min-h-11 px-4 rounded-full border-[1.5px] border-navy bg-surface text-navy text-[15px] font-medium disabled:border-input-border disabled:text-text-muted";

export function Chip(props: ComponentProps<"button">) {
  return <button type="button" className={chipClass} {...props} />;
}

// Phone: one row that scrolls sideways. Desktop: chips wrap.
export function ChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto desk:flex-wrap desk:overflow-visible">
      {children}
    </div>
  );
}

// Status tag, e.g. "TODAY'S BRICK" or "Stage 3 of 5 · Walls".
export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: "yellow" | "neutral" | "navy";
  children: ReactNode;
}) {
  const tones = {
    yellow: "bg-yellow-tint text-yellow-text",
    neutral: "bg-track text-text-secondary",
    navy: "bg-navy text-surface",
  };
  return (
    <span
      className={`inline-flex items-center rounded-badge px-2.5 py-1 text-label ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
