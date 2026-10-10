"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { isActive, navItems } from "./nav";

// Desktop (700px and above): 232px navy sidebar. Handoff §3.1.
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden desk:flex w-[232px] shrink-0 flex-col gap-8 bg-navy px-[18px] py-7 sticky top-0 h-dvh">
      <Link href="/" aria-label="Scaffold, home" className="px-1.5">
        <Logo size={34} />
      </Link>
      <nav aria-label="Main">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-11 items-center gap-3 rounded-[8px] px-3 text-[15px] ${
                    active
                      ? "bg-yellow font-semibold text-ink"
                      : "text-text-on-navy hover:bg-surface/10"
                  }`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
