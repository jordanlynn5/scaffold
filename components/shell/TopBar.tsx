"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { isActive } from "./nav";

// Phone (below 700px): navy top bar with Profile on the right. Handoff §3.2.
export function TopBar() {
  const pathname = usePathname();
  const onProfile = isActive(pathname, "/profile");
  return (
    <header className="desk:hidden sticky top-0 z-10 flex items-center justify-between bg-navy px-5 py-3">
      <Link href="/" aria-label="Scaffold, home">
        <Logo size={30} />
      </Link>
      <Link
        href="/profile"
        aria-label="Profile"
        aria-current={onProfile ? "page" : undefined}
        className={`inline-flex size-11 items-center justify-center rounded-full ${
          onProfile ? "bg-yellow text-ink" : "text-text-on-navy"
        }`}
      >
        <Icon name="profile" />
      </Link>
    </header>
  );
}
