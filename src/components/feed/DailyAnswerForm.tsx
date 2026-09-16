"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import { submitPromptAnswerAction } from "@/lib/actions/dailyPrompt";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { checkUploadSize } from "@/lib/uploads";
import type { DailyPromptAnswer } from "@/lib/types";

const initialState = { ok: true as const };

/** Günün sorusuna cevap verme/düzenleme formu — üye başına tek cevap, fotoğraf isteğe bağlı. */
export function DailyAnswerForm({ promptId, myAnswer }: { promptId: string; myAnswer: DailyPromptAnswer | null | undefined }) {
  const [state, formAction, pending] = useActionState(submitPromptAnswerAction, initialState);
  const [fileError, setFileError] = useState<string | null>(null);
  const router = useRouter();
  const wasPending = useRef(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return setFileError(null);
    const err = checkUploadSize(file);
    setFileError(err);
    if (err) e.target.value = "";
  }

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) router.refresh();
    wasPending.current = pending;
  }, [pending, state, router]);

  return (
    <form action={formAction} className="paper-card space-y-2.5 p-4">
      <p className="text-sm font-semibold text-[var(--ink)]">{myAnswer ? "Cevabını düzenle" : "Sen ne düşünüyorsun?"}</p>
      <input type="hidden" name="promptId" value={promptId} />
      <textarea
        name="body"
        rows={3}
        defaultValue={myAnswer?.body ?? ""}
        placeholder="Cevabını yaz…"
        className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
      />
      {myAnswer?.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={myAnswer.imageUrl} alt="Mevcut fotoğrafın" className="h-28 rounded-xl object-cover" />
      )}
      <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink-muted)]">
        <ImageIcon size={14} />
        {myAnswer?.imageUrl ? "Fotoğrafı değiştir (opsiyonel)" : "Fotoğraf ekle (opsiyonel)"}
        <input type="file" name="image" accept="image/*" className="hidden" onChange={onFileChange} />
      </label>
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {fileError && <span className="text-[var(--danger)]">{fileError}</span>}
          {state.demo && <DemoNote />}
          {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Kaydediliyor…" : myAnswer ? "Güncelle" : "Paylaş"}
        </Button>
      </div>
    </form>
  );
}
