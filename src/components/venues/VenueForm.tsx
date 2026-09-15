"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { createVenueAction } from "@/lib/actions/venues";
import { Button, buttonVariants } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { VENUE_KIND_OPTIONS, ISTANBUL_DISTRICTS } from "@/lib/venueKinds";

const initialState = { ok: true as const };

const inputClass = "w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]";

/** Topluluğun beraber büyüttüğü mekan rehberine yeni bir yer eklemek için — herkes ekleyebilir. */
export function VenueForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createVenueAction, initialState);
  const router = useRouter();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) {
      setOpen(false);
      router.refresh();
    }
    wasPending.current = pending;
  }, [pending, state, router]);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonVariants("outline", "sm")}>
        <Plus size={14} /> Mekan ekle
      </button>
    );
  }

  return (
    <form action={formAction} className="paper-card space-y-3 p-4 sm:p-5">
      <p className="text-sm font-semibold text-[var(--ink)]">Rehbere yeni bir mekan ekle</p>

      <input name="name" required placeholder="Mekan adı" className={inputClass} />

      <div className="grid grid-cols-2 gap-2">
        <input name="district" required list="districts" placeholder="İlçe / semt" className={inputClass} />
        <datalist id="districts">
          {ISTANBUL_DISTRICTS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
        <select name="kind" defaultValue="kitap_kafe" className={inputClass}>
          {VENUE_KIND_OPTIONS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <textarea name="description" rows={2} placeholder="Kısa bir açıklama (opsiyonel)" className={`${inputClass} resize-none`} />
      <input name="mapsUrl" placeholder="Google Maps linki (opsiyonel)" className={inputClass} />

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">
          {state.demo && <DemoNote />}
          {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Vazgeç
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Ekleniyor…" : "Mekanı ekle"}
          </Button>
        </div>
      </div>
    </form>
  );
}
