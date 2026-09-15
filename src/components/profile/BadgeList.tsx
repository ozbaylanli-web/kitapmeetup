"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BadgeStatus } from "@/lib/badges";

/** Kazanılan rozetler renkli, henüz kazanılmayanlar soluk/kilitli görünür — tıklayınca nasıl kazanılacağı açılır. */
export function BadgeList({ badges }: { badges: BadgeStatus[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {badges.map((badge) => {
        const expanded = expandedId === badge.id;
        return (
          <button
            key={badge.id}
            type="button"
            onClick={() => setExpandedId(expanded ? null : badge.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-colors",
              badge.earned ? "bg-[var(--paper-sunken)]" : "bg-[var(--paper-sunken)]/50 opacity-60 hover:opacity-90"
            )}
          >
            <span className="relative text-2xl">
              {badge.emoji}
              {!badge.earned && (
                <span className="absolute -bottom-1 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--paper-elevated)] text-[var(--ink-muted)] ring-1 ring-[var(--line)]">
                  <Lock size={9} />
                </span>
              )}
            </span>
            <span className={cn("text-xs font-semibold", badge.earned ? "text-[var(--ink)]" : "text-[var(--ink-muted)]")}>{badge.label}</span>
            {expanded && (
              <span className="mt-0.5 text-[11px] leading-snug text-[var(--ink-muted)]">
                {badge.earned ? badge.description : badge.howTo}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
