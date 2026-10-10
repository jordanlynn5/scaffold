import type { ComponentProps } from "react";

// A labelled text input. Sign-up and log-in are not in the handoff, so this
// uses its input style: 48px tall, radius 12, bg fill (§4.5 composer input).
export function Field({
  label,
  hint,
  id,
  ...props
}: { label: string; hint?: string; id: string } & ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="min-h-12 rounded-input border border-input-border bg-bg px-3.5 text-body text-ink placeholder:text-text-muted"
        {...props}
      />
      {hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
