import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PlanReview } from "@/components/plan/PlanReview";
import { getCurrentProject } from "@/lib/plans/data";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Your plan · Scaffold" };
export default async function PlanReviewPage() {
  const profile = await getProfile();
  const project = await getCurrentProject(profile.id);
  if (!project || project.onboarding_step !== "done") redirect("/onboarding");
  if (project.status === "active") redirect("/");
  return <PlanReview project={project} name={profile.name} weeklyTarget={profile.weekly_target} nudgeTime={profile.nudge_time} whatsappConsent={profile.whatsapp_consent} />;
}
