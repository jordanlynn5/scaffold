import type { IconName } from "@/components/ui/Icon";

// Handoff §3: Home, Progress, Plan, Talk to Team, Profile.
export const navItems: {
  href: string;
  label: string;
  shortLabel: string;
  icon: IconName;
}[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: "home" },
  { href: "/progress", label: "Progress", shortLabel: "Progress", icon: "progress" },
  { href: "/plan", label: "Plan", shortLabel: "Plan", icon: "plan" },
  { href: "/team", label: "Talk to Team", shortLabel: "Team", icon: "team" },
  { href: "/profile", label: "Profile", shortLabel: "Profile", icon: "profile" },
];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/onboarding");
  return pathname === href || pathname.startsWith(`${href}/`);
}
