"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cihaz destekliyorsa yerel paylaşım sayfasını (Web Share API) açar —
 * telefonda WhatsApp/Instagram DM/Mesajlar arasından seçilebilir. Desteklenmiyorsa
 * (çoğu masaüstü tarayıcı) linki panoya kopyalar. Kitapmeetup'ı "website olarak
 * da yayınlanabilir" hedefiyle organik yayılmasını kolaylaştıran küçük bir dokunuş.
 */
export function ShareButton({
  title,
  text,
  url: urlProp,
  className,
  label = "Paylaş",
}: {
  title: string;
  text?: string;
  /** Verilmezse geçerli sayfanın linki paylaşılır. */
  url?: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = urlProp ?? (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // kullanıcı paylaşım sayfasını iptal etti — sessizce geç
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // panoya erişim yoksa sessizce geç
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition-colors hover:bg-[var(--paper-sunken)]",
        className
      )}
    >
      {copied ? <Check size={13} className="text-[var(--success)]" /> : <Share2 size={13} />}
      {copied ? "Link kopyalandı" : label}
    </button>
  );
}
