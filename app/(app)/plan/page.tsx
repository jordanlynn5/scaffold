import type { Metadata } from "next";
import { BlankPlan } from "@/components/house/EmptyLot";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Plan · Scaffold" };

// Plan before a goal is set. Handoff §6.2.
export default function PlanPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-h1">Plan</h1>
      <EmptyState
        illustration={<BlankPlan className="mx-auto w-full max-w-[460px]" />}
        heading="No plan yet"
        body="Georgina, your General Contractor, draws up your roadmap and daily tasks once you've designed your goal with Alice."
        button="Design your goal with Alice"
      />
    </div>
  );
}
