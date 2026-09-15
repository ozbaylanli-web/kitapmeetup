"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Target, Pencil } from "lucide-react";
import { setReadingGoalAction } from "@/lib/actions/readingGoals";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import type { ReadingGoal } from "@/lib/types";

export function ReadingGoalCard({ goal, year, isOwnProfile }: { goal: ReadingGoal | null; year: number; isOwnProfile: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!goal && isOwnProfile);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!goal && !isOwnProfile) return null;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await setReadingGoalAction({ ok: true }, formData);
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else if (result.demo) {
        setDemo(true);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  const pct = goal ? Math.min(100, Math.round((goal.completed / goal.target) * 100)) : 0;

  return (
    <div className="paper-card p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
          <Target size={15} className="text-[var(--orange-600)]" /> {year} Okuma Hedefi
        </p>
        {isOwnProfile && goal && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
            <Pencil size={12} /> Düzenle
          </button>
        )}
      </div>

      {!editing && goal && (
        <>
          <div className="mb-1.5 flex items-baseline justify-between text-xs text-[var(--ink-muted)]">
            <span>
              <strong className="text-sm text-[var(--ink)]">{goal.completed}</strong> / {goal.target} kitap
            </span>
            <span>%{pct}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--paper-sunken)]">
            <div className="h-full rounded-full bg-[var(--orange-500)] transition-all" style={{ width: `${pct}%` }} />
          </div>
          {goal.completed >= goal.target && (
            <p className="mt-2 text-xs font-medium text-[var(--success)]">🎉 Hedefine ulaştın, tebrikler!</p>
          )}
        </>
      )}

      {editing && isOwnProfile && (
        <form onSubmit={submit} className="flex items-center gap-2">
          <input type="hidden" name="year" value={year} />
          <input
            type="number"
            name="target"
            min={1}
            max={500}
            defaultValue={goal?.target ?? 12}
            required
            className="w-20 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />
          <span className="text-xs text-[var(--ink-muted)]">kitap hedefliyorum</span>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </Button>
          {goal && (
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Vazgeç
            </Button>
          )}
        </form>
      )}

      {demo && <DemoNote />}
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
