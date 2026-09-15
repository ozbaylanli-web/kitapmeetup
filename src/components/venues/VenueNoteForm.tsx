"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addVenueNoteAction } from "@/lib/actions/venues";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { StarRatingInput } from "@/components/profile/StarRatingInput";
import type { VenueNote } from "@/lib/types";

/** Üye başına tek not+puan — daha önce bırakmışsan formu düzenlemek için tekrar gönderirsin. */
export function VenueNoteForm({ venueId, myNote }: { venueId: string; myNote: VenueNote | null }) {
  const router = useRouter();
  const [rating, setRating] = useState(myNote?.rating ?? 0);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("venueId", venueId);
    formData.set("rating", String(rating));
    startTransition(async () => {
      const result = await addVenueNoteAction({ ok: true }, formData);
      if (result.ok) router.refresh();
      else if (result.demo) setDemo(true);
      else if (result.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={submit} className="paper-card space-y-2.5 p-4">
      <p className="text-sm font-semibold text-[var(--ink)]">{myNote ? "Notunu düzenle" : "Puan ver, bir not bırak"}</p>
      <StarRatingInput value={rating} onChange={setRating} />
      <textarea
        name="body"
        rows={2}
        defaultValue={myNote?.body ?? ""}
        placeholder="Wifi, priz, gürültü seviyesi… küçük bir ipucu bırak (opsiyonel)"
        className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
      />
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {demo && <DemoNote />}
          {error && <span className="text-[var(--danger)]">{error}</span>}
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Kaydediliyor…" : myNote ? "Güncelle" : "Paylaş"}
        </Button>
      </div>
    </form>
  );
}
