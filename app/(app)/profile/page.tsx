import type { Metadata } from "next";
import { logOut } from "@/app/(auth)/actions";
import { ContactForm } from "@/components/profile/ContactForm";
import { DailyNudge, WeeklyTarget } from "@/components/profile/RhythmSettings";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Profile · Scaffold" };

// Profile (handoff §6.10). Before a goal exists there is no goal card
// (§13 #10). The current-goal card and the abandon flow arrive in checklist
// slice 12.
export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-4 desk:gap-5">
      <h1 className="text-h1">Profile</h1>

      <WeeklyTarget initial={profile.weekly_target} />
      <DailyNudge
        initialTime={profile.nudge_time.slice(0, 5)}
        initialConsent={profile.whatsapp_consent}
      />
      <ContactForm
        initial={{
          name: profile.name ?? "",
          email: profile.email,
          whatsapp: profile.whatsapp ?? "",
        }}
      />

      <Card variant="navy" className="flex items-center gap-5">
        <span className="font-heading text-[44px] leading-none font-bold text-yellow">
          {profile.houses_built}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-h3">Houses built</h2>
          <p className="text-body-sm text-text-on-navy">
            Finished houses stay in this count forever, whatever happens next.
          </p>
        </div>
      </Card>

      <form action={logOut}>
        <Button type="submit" variant="link">
          Log out
        </Button>
      </form>
    </div>
  );
}
