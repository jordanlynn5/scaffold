"use client";

import { useState, useTransition } from "react";
import { startOver } from "@/app/(focus)/onboarding/actions";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

// The "Start over" text link, with a light confirmation first
// (prd.md > Open Questions, decided in the build checklist).
export function StartOver() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button variant="link" onClick={() => setOpen(true)}>
        Start over
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Start your design over?">
        <p className="text-body text-text-secondary">
          Alice will ask her questions again from the beginning, and the
          answers you&apos;ve given so far will be cleared.
        </p>
        <div className="flex flex-col gap-2 desk:flex-row-reverse">
          <Button onClick={() => setOpen(false)} className="desk:flex-1">
            Keep my answers
          </Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => startTransition(() => startOver())}
            className="desk:flex-1"
          >
            {pending ? "Clearing…" : "Start over"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
