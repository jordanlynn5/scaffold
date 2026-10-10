import type { Metadata } from "next";
import { FirstBrick } from "@/components/house/EmptyLot";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Progress · Scaffold" };

// Progress before a goal is set. Handoff §6.2.
export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-h1">Progress</h1>
      <EmptyState
        illustration={<FirstBrick className="mx-auto w-full max-w-[460px]" />}
        heading="Nothing to track yet"
        body="This is where your house goes up. Every task you finish will add a brick, and every milestone completes a stage."
        button="Get to work on your dream"
      />
    </div>
  );
}
