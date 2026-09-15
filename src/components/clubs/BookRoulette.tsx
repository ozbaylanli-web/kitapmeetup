"use client";

import { useEffect, useRef, useState } from "react";
import { Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import type { BookSummary } from "@/lib/types";

export function BookRoulette({ books }: { books: BookSummary[] }) {
  const [spinning, setSpinning] = useState(false);
  const [current, setCurrent] = useState<BookSummary>(books[0]);
  const [landed, setLanded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  function spin() {
    if (books.length === 0 || spinning) return;
    setSpinning(true);
    setLanded(false);

    let ticks = 0;
    const totalTicks = 16 + Math.floor(Math.random() * 6);
    intervalRef.current = setInterval(() => {
      setCurrent(books[Math.floor(Math.random() * books.length)]);
      ticks += 1;
      if (ticks >= totalTicks) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrent(books[Math.floor(Math.random() * books.length)]);
        setSpinning(false);
        setLanded(true);
        ambientEngine.playChime(0.1);
      }
    }, 90);
  }

  if (books.length === 0) return null;

  return (
    <div className="paper-card p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
        <Shuffle size={16} className="text-[var(--orange-600)]" />
        Kitap Ruleti
      </div>
      <p className="mb-4 text-xs text-[var(--ink-muted)]">
        Kulübün bir sonraki buluşmasında ne konuşacağınıza karar veremediniz mi? Ruleti çevirin.
      </p>

      <div
        className={`mb-4 flex items-center gap-3 rounded-xl border border-dashed px-4 py-4 transition-colors ${
          landed ? "border-[var(--orange-400)] bg-[var(--orange-50)]" : "border-[var(--line-strong)] bg-[var(--paper)]"
        }`}
      >
        <span className="h-10 w-3 shrink-0 rounded-sm" style={{ backgroundColor: current.spineColor }} />
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold text-[var(--ink)]">{current.title}</p>
          <p className="truncate text-xs text-[var(--ink-muted)]">{current.author}</p>
        </div>
        {landed && <Sparkles size={16} className="ml-auto shrink-0 text-[var(--orange-500)]" />}
      </div>

      <Button variant="outline" size="sm" onClick={spin} disabled={spinning} className="w-full">
        {spinning ? "Çevriliyor…" : landed ? "Tekrar çevir" : "Ruleti çevir"}
      </Button>
    </div>
  );
}
