import type { Metadata } from "next";
import { logOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "Profile · Scaffold" };

// Profile before a goal exists is not designed (handoff §13 #10). Following
// its recommendation: contact details, weekly target and nudge time only,
// with no goal section. Editing arrives in checklist slice 6.
export default async function ProfilePage() {
  const profile = await getProfile();
  const days = profile.weekly_target === 1 ? "day" : "days";

  return (
    <div className="flex flex-col gap-4 desk:gap-5">
      <h1 className="text-h1">Profile</h1>

      <Card className="flex flex-col gap-4">
        <h2 className="text-h3">Contact details</h2>
        <dl className="grid grid-cols-1 gap-3 desk:grid-cols-2">
          <Detail label="Email" value={profile.email} />
          <Detail label="WhatsApp number" value={profile.whatsapp ?? "Not set"} />
        </dl>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-h3">Your rhythm</h2>
        <dl className="grid grid-cols-1 gap-3 desk:grid-cols-2">
          <Detail
            label="Weekly target"
            value={`${profile.weekly_target} ${days} a week`}
          />
          <Detail
            label="WhatsApp message arrives at"
            value={profile.nudge_time.slice(0, 5)}
          />
        </dl>
      </Card>

      <Card variant="navy" className="flex items-center gap-5">
        <span className="font-heading text-[44px] font-bold leading-none text-yellow">
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Card variant="quiet" className="flex flex-col gap-1">
      <dt className="text-[13px] text-text-muted">{label}</dt>
      <dd className="text-body font-medium break-words">{value}</dd>
    </Card>
  );
}
