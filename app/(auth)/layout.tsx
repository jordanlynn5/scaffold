import Link from "next/link";
import { House } from "@/components/house/House";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

// Sign-up layout from the handoff §6.0b. Log-in is not designed and reuses it.
// Desktop: a navy panel (44%) beside the form. Phone: a navy top bar, then
// the form only.
const promises = [
  // The handoff says "5 to 15 minutes". Tasks are 20 minutes or less (prd.md).
  "One small task a day, 20 minutes or less",
  "A gentle nudge on WhatsApp",
  "A weekly target that leaves room for life",
];

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col desk:flex-row">
      <header className="bg-navy px-5 py-3 desk:hidden">
        <Link href="/" aria-label="Scaffold, home page">
          <Logo size={30} />
        </Link>
      </header>

      <aside className="bg-grid-navy hidden w-[44%] flex-col gap-8 px-12 py-10 desk:flex">
        <Link href="/" aria-label="Scaffold, home page">
          <Logo size={34} />
        </Link>
        <div className="flex flex-1 flex-col justify-center gap-6">
          <div className="bg-grid-paper w-full max-w-[300px] rounded-card p-3">
            <House stage={3} fill={0.3} className="w-full" />
          </div>
          <h1 className="font-heading text-[38px] leading-[1.1] font-bold text-surface">
            Every dream house starts with a plan.
          </h1>
          <p className="max-w-[440px] text-body text-text-on-navy">
            Create your account, then Alice, your Architect, will help you
            design your goal. It takes about 5 minutes.
          </p>
          <ul className="flex flex-col gap-3">
            {promises.map((line) => (
              <li key={line} className="flex items-center gap-3 text-body text-surface">
                <Icon name="check" className="shrink-0 text-yellow" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-1 items-start justify-center bg-bg px-4 py-8 desk:items-center desk:py-12">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  );
}
