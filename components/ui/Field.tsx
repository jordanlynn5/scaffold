import type { ComponentProps } from "react";
import { Icon } from "./Icon";

// A labelled input (handoff §6.0b): 48px tall, radius 12, visible label,
// help text linked through aria-describedby. Errors show under the field in
// secondary text with a warning icon. Never red: red is reserved (§2.1).
export function Field({
  label,
  hint,
  error,
  id,
  ...props
}: {
  label: string;
  hint?: string;
  error?: React.ReactNode;
  id: string;
} & ComponentProps<"input">) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="min-h-12 rounded-input border border-input-border bg-surface px-3.5 text-body text-ink placeholder:text-text-muted aria-invalid:border-2 aria-invalid:border-ink"
        {...props}
      />
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
      {hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FieldError({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-caption text-text-secondary">
      <Icon name="warning" size={18} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  );
}
