"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { addToShelfAction } from "@/lib/actions/shelf";
import { Button, buttonVariants } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { StarRatingInput } from "@/components/profile/StarRatingInput";

const initialState = { ok: true as const };

export function ShelfForm() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("reading");
  const [rating, setRating] = useState(0);
  const [state, formAction, pending] = useActionState(addToShelfAction, initialState);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonVariants("outline", "sm")}>
        <Plus size={14} /> Rafa kitap ekle
      </button>
    );
  }

  return (
    <form action={formAction} className="paper-card space-y-3 p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="title"
          required
          placeholder="Kitap adı"
          className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
        />
        <input
          name="author"
          placeholder="Yazar (opsiyonel)"
          className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink-soft)] outline-none focus:border-[var(--orange-400)]"
        >
          <option value="reading">Şu an okuyorum</option>
          <option value="read">Okudum</option>
          <option value="want">Okumak istiyorum</option>
        </select>
        <input
          name="note"
          placeholder="Kısa not (opsiyonel)"
          className="min-w-40 flex-1 rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      </div>

      {status === "read" && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[var(--ink-muted)]">Puanın:</span>
          <StarRatingInput value={rating} onChange={setRating} />
          <input type="hidden" name="rating" value={rating} />
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {state.demo && <DemoNote />}
          {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Ekleniyor…" : "Ekle"}
          </Button>
        </div>
      </div>
    </form>
  );
}
