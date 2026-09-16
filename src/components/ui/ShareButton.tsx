"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cihaz destekliyorsa yerel paylaşım sayfasını (Web Share API) açar —
 * telefonda WhatsApp/Instagram DM/Mesajlar arasından seçilebilir. Desteklenmiyorsa
 * (çoğu masaüstü tarayıcı) linki panoya kopyalar. Kitapmeetup'ı "website olarak
 * da yayınlanabilir" hedefiyle organik yayılmasını kolaylaştıran küçük bir dokunuş.
 *
 * `imageCardUrl` verilirse (ör. /api/instagram/kart?...) önce görseli dosya
 * olarak paylaşmayı dener — telefonlarda bu, yerel paylaşım penceresinde
 * Instagram Hikaye/Gönderi'yi de bir seçenek olarak çıkarır. Dosya paylaşımı
 * desteklenmiyorsa/başarısız olursa sessizce normal link paylaşımına düşer.
 */
export function ShareButton({
  title,
  text,
  url: urlProp,
  className,
  label = "Paylaş",
  imageCardUrl,
}: {
  title: string;
  text?: string;
  /** Verilmezse geçerli sayfanın linki paylaşılır. */
  url?: string;
  className?: string;
  label?: string;
  /** Verilirse önce bu görseli dosya olarak paylaşmayı dener (bkz. yukarıdaki not). */
  imageCardUrl?: string;
}) {
  const [state, setState] = useState<"idle" | "sharing" | "copied">("idle");

  async function handleShare() {
    if (state === "sharing") return;
    // urlProp göreli bir yol olarak verilmiş olabilir (ör. "/etkinlikler/x") -
    // mevcut origin'e göre mutlak hale getiriyoruz; zaten mutlaksa değişmeden kalır.
    const url = urlProp
      ? typeof window !== "undefined"
        ? new URL(urlProp, window.location.origin).toString()
        : urlProp
      : typeof window !== "undefined"
        ? window.location.href
        : "";
    setState("sharing");

    if (imageCardUrl && typeof navigator !== "undefined") {
      const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
      try {
        const res = await fetch(imageCardUrl);
        const blob = await res.blob();
        const file = new File([blob], "kitapmeetup.png", { type: blob.type || "image/png" });
        if (nav.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title, text, url });
          setState("idle");
          return;
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          setState("idle");
          return;
        }
        // Kart üretimi/dosya paylaşımı başarısız oldu — aşağıdaki normal akışa düş.
      }
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setState("idle");
        return;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          setState("idle");
          return;
        }
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={state === "sharing"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-sunken)]",
        className
      )}
    >
      {state === "copied" ? <Check size={13} className="text-[var(--success)]" /> : <Share2 size={13} />}
      {state === "sharing" ? "Hazırlanıyor…" : state === "copied" ? "Link kopyalandı" : label}
    </button>
  );
}
