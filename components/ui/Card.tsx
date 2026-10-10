import type { ComponentProps } from "react";

// Handoff §4.3
const variants = {
  standard: "bg-surface border border-line rounded-card",
  dark: "bg-ink text-surface rounded-card",
  navy: "bg-navy text-surface rounded-card",
  current: "bg-yellow-wash border-2 border-yellow rounded-card",
  "not-yet": "border-[1.5px] border-dashed border-input-border rounded-card",
  quiet: "bg-bg rounded-input",
} as const;

export function Card({
  variant = "standard",
  padded = true,
  className,
  ...props
}: { variant?: keyof typeof variants; padded?: boolean } & ComponentProps<"div">) {
  return (
    <div
      className={[
        variants[variant],
        padded ? (variant === "quiet" ? "p-4" : "p-5 desk:p-7") : "",
        className ?? "",
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}
