"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { switchAccountKindAction } from "@/lib/actions/profile";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import type { AuthorSummary } from "@/lib/types";

/** Ayarlar sayfasında hesap türünü (okuyucu ⇄ yayınevi) değiştirme bölümü. */
export function PublisherAccountSection({ currentUser }: { currentUser: AuthorSummary }) {
  const router = useRouter();
  const isPublisher = currentUser.accountKind === "publisher";
  const [website, setWebsite] = useState(currentUser.publisherWebsite ?? "");
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(kind: "reader" | "publisher") {
    setDemo(false);
    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("website", website);
    startTransition(async () => {
      const result = await switchAccountKindAction({ ok: true }, formData);
      if (result.ok) router.refresh();
      else if (result.demo) setDemo(true);
    });
  }

  return (
    <div className="paper-card space-y-3 p-5">
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <Building2 size={15} /> Hesap türü
      </h3>
      <p className="text-xs text-[var(--ink-muted)]">
        {isPublisher
          ? "Şu an bir yayınevi hesabısın — paylaşımların, kurduğun kulüpler ve profilin \"Yayınevi\" rozetiyle görünür."
          : "Bir yayınevini mi temsil ediyorsun? Yayınevi hesabına geçersen aynı şekilde paylaşım yapar, kulüp kurar ve okuyucularla mesajlaşırsın — sadece kimliğin \"Yayınevi\" rozetiyle işaretlenir."}
      </p>

      {!isPublisher && (
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Yayınevi web sitesi (opsiyonel)"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs">{demo && <DemoNote />}</div>
        {isPublisher ? (
          <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => submit("reader")}>
            {pending ? "Kaydediliyor…" : "Okuyucu hesabına dön"}
          </Button>
        ) : (
          <Button type="button" size="sm" disabled={pending} onClick={() => submit("publisher")}>
            {pending ? "Kaydediliyor…" : "Yayınevi hesabına geç"}
          </Button>
        )}
      </div>
    </div>
  );
}
