import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { House, stageNames } from "./House";
import { ProgressBar } from "./ProgressBits";

// Home's "Your house" card (handoff §6.6, item 4).
export function SmallHouse({ stage, fill, bricksLaid }: { stage: number; fill: number; bricksLaid: number }) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-h2">Your house</h2>
      <div className="bg-grid-paper rounded-input border border-line px-3 pt-3">
        <House tight stage={stage} fill={fill} bricksLaid={bricksLaid} className="mx-auto w-full max-w-[360px]" />
      </div>
      <p className="text-body-sm">
        Stage {stage} of 5: {stageNames[stage - 1]} · {bricksLaid} {bricksLaid === 1 ? "brick" : "bricks"} laid
      </p>
      <ProgressBar value={fill} label={`${stageNames[stage - 1]} progress`} />
      <ButtonLink href="/progress" variant="link" className="self-start">See progress →</ButtonLink>
    </Card>
  );
}
