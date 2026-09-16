"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_ORDER_DESKTOP } from "@/lib/nav";
import { ambientEngine } from "@/lib/audio/ambientEngine";

export function NavLinks({
  orientation = "vertical",
  hasUnreadMessages = false,
}: {
  orientation?: "vertical" | "horizontal";
  hasUnreadMessages?: boolean;
}) {
  const pathname = usePathname();
  // Masaüstü kenar çubuğu (vertical) farklı bir sırada gösterilir - bkz. src/lib/nav.ts.
  const items =
    orientation === "vertical" ? NAV_ORDER_DESKTOP.map((href) => NAV_ITEMS.find((item) => item.href === href)!) : NAV_ITEMS;

  return (
    <nav className={cn(orientation === "vertical" ? "flex flex-col gap-1" : "flex items-stretch")}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const showUnreadDot = href === "/mesajlar" && hasUnreadMessages;
        return (
          <Link
            key={href}
            href={href}
            onClick={() => {
              if (!active) ambientEngine.playNavTick();
            }}
            className={cn(
              "relative",
              orientation === "vertical"
                ? "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                : "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2.5 text-center text-[11px] font-medium leading-tight transition-colors",
              active ? "text-[var(--orange-600)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
            )}
          >
            {active && (
              <motion.span
                layoutId={`nav-pill-${orientation}`}
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
                className={cn(
                  "absolute inset-0 -z-10",
                  orientation === "vertical" ? "rounded-xl bg-[var(--orange-100)]" : "rounded-2xl bg-[var(--orange-100)]"
                )}
              />
            )}
            <motion.span whileTap={{ scale: 0.82 }} className="relative shrink-0">
              <Icon size={orientation === "vertical" ? 18 : 22} strokeWidth={active ? 2.4 : 2} />
              {showUnreadDot && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--orange-500)] ring-2 ring-[var(--paper-elevated)]" />
              )}
            </motion.span>
            <span className="max-w-full truncate px-px">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
