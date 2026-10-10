import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

// Handoff §4.1. If two buttons sit together, only one is filled.
const variants = {
  primary:
    "min-h-12 px-5 rounded-button bg-navy text-surface text-[16px] font-semibold",
  secondary:
    "min-h-12 px-5 rounded-button bg-surface border border-input-border text-ink text-[15px] font-medium",
  highlight:
    "min-h-12 px-5 rounded-button bg-yellow text-ink text-[16px] font-bold",
  // ONLY for "Yes, I want to abandon this project"
  danger:
    "min-h-12 px-5 rounded-button bg-surface border-[1.5px] border-danger text-danger text-[16px] font-semibold",
  link: "min-h-11 text-navy text-[15px] font-medium hover:underline",
} as const;

type Variant = keyof typeof variants;

const base =
  "inline-flex items-center justify-center gap-2 text-center disabled:opacity-60 disabled:cursor-not-allowed";

function classes(variant: Variant, fullWidth?: boolean, className?: string) {
  return [base, variants[variant], fullWidth ? "w-full" : "", className ?? ""]
    .join(" ")
    .trim();
}

type Common = {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: Common & ComponentProps<"button">) {
  return (
    <button className={classes(variant, fullWidth, className)} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: Common & ComponentProps<typeof Link>) {
  return <Link className={classes(variant, fullWidth, className)} {...props} />;
}
