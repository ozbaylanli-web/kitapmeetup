"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClubAction } from "@/lib/actions/clubs";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";

const COLOR_OPTIONS = [
  { label: "Turuncu", value: "#F0611F" },
  { label: "Mor (Felsefe)", value: "#6F5A94" },
  { label: "Teal (Bilimkurgu)", value: "#146B62" },
  { label: "Pudra (Şiir)", value: "#C05F82" },
  { label: "Petrol (Distopya)", value: "#35594D" },
];

const initialState = { ok: true as const };

export function ClubForm() {
  const [state, formAction, pending] = useActionState(createClubAction, initialState);
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) {
      router.push("/kulupler");
    }
    wasPending.current = pending;
  }, [pending, state, router]);

  return (
    <form action={formAction} className="paper-card space-y-4 p-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Kulüp adı</label>
        <input
          name="name"
          required
          placeholder="ör. Distopya Kulübü"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Bu kulüpte neler konuşulacak?"
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Simge (emoji)</label>
          <input
            name="icon"
            defaultValue="📚"
            maxLength={4}
            className="w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Renk</label>
          <select
            name="color"
            defaultValue={COLOR_OPTIONS[0].value}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">
          {state.demo && <DemoNote />}
          {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Oluşturuluyor…" : "Kulübü oluştur"}
        </Button>
      </div>
    </form>
  );
}
