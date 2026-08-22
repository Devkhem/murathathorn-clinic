"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, ClipboardList, CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/patients", label: "คนไข้", icon: Users },
  { href: "/visits", label: "บันทึกการรักษา", icon: ClipboardList },
  { href: "/appointments", label: "นัดหมาย", icon: CalendarDays },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The one and only primary navigation, per docs/PRODUCT_SPEC.md — exactly 4 items.
 * Renders as a bottom tab bar (thumb-reachable on iPad/mobile) and doubles as a
 * left rail on wide desktop screens.
 */
export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card md:inset-y-0 md:left-0 md:right-auto md:w-24 md:border-r md:border-t-0"
    >
      <ul className="flex justify-around md:h-full md:flex-col md:justify-start md:gap-2 md:py-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-3 text-sm font-medium transition-colors md:mx-2 md:rounded-xl md:py-4",
                  active
                    ? "text-primary md:bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-7" strokeWidth={active ? 2.5 : 2} />
                <span className="text-center leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
