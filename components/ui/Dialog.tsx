"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

// Handoff §4.8. Desktop: a centered dialog. Phone: the same content as a
// bottom sheet with a grab handle. The browser's own <dialog> moves focus
// in, keeps it there, closes on Esc and returns focus afterwards.
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="mx-0 mt-auto mb-0 w-full max-w-full rounded-t-dialog bg-surface p-0 text-ink shadow-dialog backdrop:bg-scrim desk:m-auto desk:max-w-[460px] desk:rounded-dialog"
    >
      <div className="flex flex-col gap-4 p-5 pb-7 desk:p-7">
        <span
          aria-hidden="true"
          className="mx-auto h-1 w-10 rounded-full bg-input-border desk:hidden"
        />
        <h2 id={titleId} className="text-h2">
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
