"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Repeat, Search } from "lucide-react";
import { makeOfferAction } from "@/lib/actions/swaps";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import type { PostType } from "@/lib/types";

const inputClass =
  "w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]";

/**
 * "takas" (elimde var) ilanlarında kendi kitabınla teklif yaparsın; "takas_arama"
 * (arıyorum) ilanlarında aranan kitap zaten belli — sadece "bende var" dersin.
 */
export function OfferForm({ postId, listingType }: { postId: string; listingType: PostType }) {
  const router = useRouter();
  const isSeeking = listingType === "takas_arama";
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("postId", postId);
    startTransition(async () => {
      const result = await makeOfferAction({ ok: true }, formData);
      if (result.ok) {
        ambientEngine.playPop();
        setSent(true);
        router.refresh();
      } else if (result.demo) setDemo(true);
      else if (result.error) setError(result.error);
    });
  }

  if (sent) {
    return (
      <p className="paper-card p-4 text-sm font-medium text-[var(--success)]">
        {isSeeking ? "🎉 Haber verdin — ilan sahibi seninle iletişime geçecek." : "🎉 Teklifin gönderildi — ilan sahibi değerlendirecek."}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="paper-card space-y-3 p-4 sm:p-5">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        {isSeeking ? <Search size={15} className="text-[var(--orange-600)]" /> : <Repeat size={15} className="text-[var(--orange-600)]" />}
        {isSeeking ? "Bu kitap bende var" : "Kitabınla teklif yap"}
      </p>
      {!isSeeking && (
        <div className="grid gap-2 sm:grid-cols-2">
          <input name="title" required placeholder="Teklif ettiğin kitap" className={inputClass} />
          <input name="author" placeholder="Yazar (opsiyonel)" className={inputClass} />
        </div>
      )}
      <textarea
        name="message"
        rows={2}
        placeholder={isSeeking ? "Durumu, nasıl ulaşabileceğini yaz (opsiyonel)" : "Kısa bir not (opsiyonel)"}
        className={`${inputClass} resize-none`}
      />
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {demo && <DemoNote />}
          {error && <span className="text-[var(--danger)]">{error}</span>}
        </div>
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Gönderiliyor…" : isSeeking ? "Bende var, haber ver" : "Teklifi gönder"}
        </Button>
      </div>
    </form>
  );
}
