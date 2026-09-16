"use client";

import { useActionState, useRef } from "react";
import { Camera } from "lucide-react";
import { checkUploadSize } from "@/lib/uploads";
import type { ActionResult } from "@/lib/types";

const initialState = { ok: true as const };

/**
 * Kulüp/etkinlik yöneticisine gösterilen küçük "kapak fotoğrafı ekle/değiştir"
 * butonu — dosya seçilir seçilmez otomatik yüklenir (ayrı bir form akışı yok).
 */
export function CoverUploader({
  action,
  idFieldName,
  idValue,
  hasCover,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  idFieldName: string;
  idValue: string;
  hasCover: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = checkUploadSize(file);
    if (err) {
      e.target.value = "";
      alert(err);
      return;
    }
    formRef.current?.requestSubmit();
  }

  return (
    <form ref={formRef} action={formAction} className="inline-block">
      <input type="hidden" name={idFieldName} value={idValue} />
      <label
        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/40"
        title={hasCover ? "Kapak fotoğrafını değiştir" : "Kapak fotoğrafı ekle"}
      >
        <Camera size={13} />
        {pending ? "Yükleniyor…" : hasCover ? "Kapağı değiştir" : "Kapak ekle"}
        <input type="file" name="cover" accept="image/*" className="hidden" onChange={onFileChange} disabled={pending} />
      </label>
      {"error" in state && state.error && <p className="mt-1 text-xs text-[var(--danger)]">{state.error}</p>}
    </form>
  );
}
