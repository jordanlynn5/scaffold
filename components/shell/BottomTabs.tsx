"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isActive, navItems } from "./nav";

// Phone (below 700px): Home, Progress, Plan, Team. Handoff §3.2.
export function BottomTabs() {
  const pathname = usePathname();
  const tabs = navItems.filter((item) => item.href !== "/profile");
  return (
    <nav
      aria-label="Main"
      className="desk:hidden fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {tabs.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-[12px] ${
                  active ? "font-semibold text-ink" : "text-text-muted"
                }`}
              >
                <span
                  className={`inline-flex h-[30px] w-14 items-center justify-center rounded-full ${
                    active ? "bg-yellow" : ""
                  }`}
                >
                  <Icon name={item.icon} />
                </span>
                {item.shortLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
