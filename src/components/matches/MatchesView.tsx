"use client";

import { useState, useSyncExternalStore } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";
import { MatchDeck } from "@/components/matches/MatchDeck";
import { MatchCard } from "@/components/matches/MatchCard";
import { cn } from "@/lib/utils";
import type { BookMatch } from "@/lib/types";

const noopSubscribe = () => () => {};

export function MatchesView({ matches }: { matches: BookMatch[] }) {
  const [mode, setMode] = useState<"deck" | "list">("deck");
  // Kart destesi framer-motion'ın canlı stil/transform değerleriyle çalışıyor —
  // sunucu ile istemcinin ilk boyaması birebir uyuşmayabilir. Bu yüzden
  // hydration tamamlanana kadar sade bir iskelet gösterip gerçek desteyi
  // sadece istemcide (mount sonrası) render ediyoruz.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  return (
    <div>
      <div className="mb-4 flex justify-center gap-1 rounded-full border border-[var(--line)] bg-[var(--paper-elevated)] p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMode("deck")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors",
            mode === "deck" ? "bg-[var(--orange-500)] text-white" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          )}
        >
          <LayoutGrid size={13} /> Kart
        </button>
        <button
          type="button"
          onClick={() => setMode("list")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-colors",
            mode === "list" ? "bg-[var(--orange-500)] text-white" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          )}
        >
          <Rows3 size={13} /> Liste
        </button>
      </div>

      {mode === "deck" ? (
        mounted ? (
          <MatchDeck matches={matches} />
        ) : (
          <div className="mx-auto h-80 max-w-sm animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--paper-elevated)]" />
        )
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard key={m.user.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
