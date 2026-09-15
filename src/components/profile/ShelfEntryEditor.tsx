"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { updateShelfEntryAction, removeShelfEntryAction } from "@/lib/actions/shelf";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { StarRatingInput } from "@/components/profile/StarRatingInput";
import type { ShelfItem, ShelfStatus } from "@/lib/types";

/** Rafta zaten olan bir kitabın durumunu/puanını/notunu düzenlemek için küçük satır içi form. */
export function ShelfEntryEditor({ item, onClose }: { item: ShelfItem; onClose: () => void }) {
  const router = useRouter();
  const [status, setStatus] = useState<ShelfStatus>(item.status);
  const [rating, setRating] = useState(item.rating ?? 0);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateShelfEntryAction({ ok: true }, formData);
      if (result.ok) {
        router.refresh();
        onClose();
      } else if (result.demo) {
        setDemo(true);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeShelfEntryAction({ ok: true }, item.id);
      if (result.ok) {
        router.refresh();
        onClose();
      } else if (result.demo) {
        setDemo(true);
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="paper-card mt-2 space-y-3 p-4">
      <input type="hidden" name="entryId" value={item.id} />
      <p className="text-sm font-semibold text-[var(--ink)]">
        {item.book.title} <span className="font-normal text-[var(--ink-muted)]">— {item.book.author}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShelfStatus)}
          className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
        >
          <option value="reading">Şu an okuyorum</option>
          <option value="read">Okudum</option>
          <option value="want">Okumak istiyorum</option>
        </select>
        {status === "read" && (
          <div className="flex items-center gap-2">
            <StarRatingInput value={rating} onChange={setRating} />
            <input type="hidden" name="rating" value={rating} />
          </div>
        )}
      </div>

      <textarea
        name="note"
        defaultValue={item.note ?? ""}
        placeholder="Kısa not (opsiyonel)"
        rows={2}
        className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
      />

      <div className="flex items-center justify-between">
        <div className="text-xs">
          {demo && <DemoNote />}
          {error && <span className="text-[var(--danger)]">{error}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRemove}
            disabled={pending}
            className="flex items-center gap-1 text-xs font-medium text-[var(--danger)] hover:underline"
          >
            <Trash2 size={13} /> Rafdan kaldır
          </button>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Vazgeç
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </div>
    </form>
  );
}
