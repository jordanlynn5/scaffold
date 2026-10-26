"use client";

import { useState, useTransition } from "react";
import { sendNudgeNow, type NudgeNowState } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/Button";

// "Send my nudge now" (spec.md > What Was Simplified and Why): today's real
// nudge, straight away, so trying it or recording the demo doesn't wait for
// the clock.
export function SendNudgeNow({ hasTask }: { hasTask: boolean }) {
  const [state, setState] = useState<NudgeNowState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-start gap-2 border-t border-line pt-4">
      <Button
        type="button"
        variant="secondary"
        disabled={!hasTask || pending}
        onClick={() => startTransition(async () => setState(await sendNudgeNow()))}
      >
        {pending ? "Sending…" : "Send my nudge now"}
      </Button>
      <p aria-live="polite" className="text-body-sm text-text-secondary">
        {hasTask
          ? state.message ?? "Sarah sends today's task straight away, the same way she does at your chosen time."
          : "Once you have a plan, Sarah can send today's task from here."}
      </p>
    </div>
  );
}
