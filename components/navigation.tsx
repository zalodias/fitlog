"use client";

import { cn } from "@/lib/utils";
import { Calendar, Dumbbell, LayoutGrid, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/log", label: "Log", icon: Plus, primary: true },
  { href: "/movements", label: "Movements", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-14 items-center border-b border-border-neutral-default bg-background-neutral-default/80 backdrop-blur px-6 gap-8">
        <Link
          href="/"
          className="text-title-small-strong text-foreground-neutral-default"
        >
          fitlog
        </Link>
        <nav className="flex gap-1">
          {links.map(({ href, label, icon: Icon, primary }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-body-medium-subtle transition-colors",
                  primary
                    ? "bg-foreground-neutral-default text-background-neutral-default hover:bg-foreground-neutral-default/90"
                    : active
                      ? "text-foreground-neutral-default bg-background-neutral-strong"
                      : "text-foreground-neutral-faded hover:text-foreground-neutral-default hover:bg-background-neutral-strong",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border-neutral-subtle bg-background-neutral-default/95 backdrop-blur">
        <div className="flex items-center">
          {links.map(({ href, label, icon: Icon, primary }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-body-small-subtle uppercase tracking-widest transition-colors",
                  primary
                    ? "text-foreground-neutral-default"
                    : active
                      ? "text-foreground-neutral-default"
                      : "text-foreground-neutral-faded",
                )}
              >
                {primary ? (
                  <span className="flex size-10 items-center justify-center rounded-full bg-foreground-neutral-default text-background-neutral-default">
                    <Icon className="size-5" />
                  </span>
                ) : (
                  <Icon
                    className={cn(
                      "size-5",
                      active && "text-foreground-neutral-default",
                    )}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
