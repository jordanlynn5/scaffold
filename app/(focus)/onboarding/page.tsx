import type { Metadata } from "next";
import { OnboardingChat } from "@/components/onboarding/OnboardingChat";
import { getOnboarding } from "@/lib/onboarding/flow";
import { getProfile } from "@/lib/profile";
import { getCurrentProject } from "@/lib/plans/data";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Design your goal · Scaffold" };

// The onboarding chat with Alice (handoff §6.4). Opens at the saved step.
export default async function OnboardingPage() {
  const profile = await getProfile();
  const project = await getCurrentProject(profile.id);
  if (project?.status === "active") redirect("/");
  if (project?.status === "draft_plan") redirect("/onboarding/plan");
  const onboarding = await getOnboarding(profile.id);
  return (
    <OnboardingChat
      // A fresh chat after "Start over" must not keep the old one's messages.
      key={onboarding?.conversationId ?? "new"}
      initialMessages={onboarding?.messages ?? []}
      initialStep={onboarding?.project.onboarding_step ?? "name"}
    />
  );
}
