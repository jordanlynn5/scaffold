import type { Metadata } from "next";
import { OnboardingChat } from "@/components/onboarding/OnboardingChat";
import { getOnboarding } from "@/lib/onboarding/flow";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Design your goal · Scaffold" };

// The onboarding chat with Alice (handoff §6.4). Opens at the saved step.
export default async function OnboardingPage() {
  const profile = await getProfile();
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
