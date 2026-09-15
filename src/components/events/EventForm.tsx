"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createEventAction } from "@/lib/actions/events";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { VENUE_KIND_META } from "@/lib/venueKinds";
import type { ClubSummary, VenueSummary } from "@/lib/types";

const initialState = { ok: true as const };

export function EventForm({ clubs, venues }: { clubs: ClubSummary[]; venues: VenueSummary[] }) {
  const [state, formAction, pending] = useActionState(createEventAction, initialState);
  const [isOnline, setIsOnline] = useState(false);
  const [venueId, setVenueId] = useState("");
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) {
      router.push("/etkinlikler");
    }
    wasPending.current = pending;
  }, [pending, state, router]);

  return (
    <form action={formAction} className="paper-card space-y-4 p-5">
      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Başlık</label>
        <input
          name="title"
          required
          placeholder="ör. Bilimkurgu Kulübü: Dune Tartışması"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Açıklama</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Neler konuşulacak, kimler gelebilir?"
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Tarih ve saat</label>
          <input
            type="datetime-local"
            name="startsAt"
            required
            className="w-full min-w-0 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />
        </div>
        <div className="min-w-0">
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Kontenjan (opsiyonel)</label>
          <input
            type="number"
            name="capacity"
            min={1}
            placeholder="ör. 20"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />
        </div>
      </div>

      {clubs.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Kulübe bağla (opsiyonel)</label>
          <select
            name="clubId"
            defaultValue=""
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
          >
            <option value="">Genel etkinlik (kulüpsüz)</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isOnline"
          name="isOnline"
          checked={isOnline}
          onChange={(e) => setIsOnline(e.target.checked)}
          className="h-4 w-4 accent-[var(--orange-500)]"
        />
        <label htmlFor="isOnline" className="text-sm text-[var(--ink-soft)]">
          Bu etkinlik online
        </label>
      </div>

      {isOnline ? (
        <div>
          <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Katılım linki</label>
          <input
            name="locationUrl"
            placeholder="https://…"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
          />
        </div>
      ) : (
        <>
          {venues.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Rehberden mekan seç (opsiyonel)</label>
              <select
                name="venueId"
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
              >
                <option value="">Mekan seçme, konumu kendim yazayım</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {VENUE_KIND_META[v.kind].emoji} {v.name} — {v.district}
                  </option>
                ))}
              </select>
            </div>
          )}
          {venueId ? (
            <p className="text-xs text-[var(--ink-muted)]">Konum, seçtiğin mekandan otomatik alınacak.</p>
          ) : (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--ink-soft)]">Konum</label>
              <input
                name="locationName"
                placeholder="ör. Kadıköy, Moda — Sayfa Kahve"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
              />
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">
          {state.demo && <DemoNote />}
          {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Oluşturuluyor…" : "Etkinliği oluştur"}
        </Button>
      </div>
    </form>
  );
}
