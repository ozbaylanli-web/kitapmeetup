"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";
import { setHomeVenueAction } from "@/lib/actions/clubs";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { VENUE_KIND_META } from "@/lib/venueKinds";
import type { VenueSummary } from "@/lib/types";

/** Kulübün sabit buluşma mekanını gösterir; yönetici/moderatör rehberden bir mekan seçip değiştirebilir. */
export function ClubVenueSection({
  clubId,
  homeVenue,
  venues,
  canManage,
}: {
  clubId: string;
  homeVenue: VenueSummary | null | undefined;
  venues: VenueSummary[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    const formData = new FormData(e.currentTarget);
    formData.set("clubId", clubId);
    startTransition(async () => {
      const result = await setHomeVenueAction({ ok: true }, formData);
      if (result.ok) {
        setEditing(false);
        router.refresh();
      } else if (result.demo) setDemo(true);
    });
  }

  if (!canManage && !homeVenue) return null;

  return (
    <div className="paper-card p-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <MapPin size={15} className="text-[var(--orange-600)]" /> Sabit Mekan
      </h3>

      {!editing && homeVenue && (
        <Link href={`/mekanlar/${homeVenue.slug}`} className="flex items-center justify-between gap-2 rounded-lg bg-[var(--paper-sunken)] px-3 py-2 hover:bg-[var(--line)]">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--ink)]">
              {VENUE_KIND_META[homeVenue.kind].emoji} {homeVenue.name}
            </p>
            <p className="text-xs text-[var(--ink-muted)]">{homeVenue.district}</p>
          </div>
          <ExternalLink size={13} className="shrink-0 text-[var(--ink-muted)]" />
        </Link>
      )}
      {!editing && !homeVenue && <p className="text-xs text-[var(--ink-muted)]">Henüz sabit bir mekan seçilmedi.</p>}

      {canManage && !editing && (
        <button type="button" onClick={() => setEditing(true)} className="mt-2 text-xs font-semibold text-[var(--orange-600)] hover:underline">
          {homeVenue ? "Değiştir" : "Mekan seç"}
        </button>
      )}

      {editing && (
        <form onSubmit={submit} className="mt-2 space-y-2">
          <select
            name="venueId"
            defaultValue={homeVenue?.id ?? ""}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
          >
            <option value="">Seçili değil</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {v.district}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Vazgeç
            </Button>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "Kaydediliyor…" : "Kaydet"}
            </Button>
          </div>
          {demo && <DemoNote />}
        </form>
      )}
    </div>
  );
}
