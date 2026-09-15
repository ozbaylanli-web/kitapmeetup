"use client";

import { useState, useTransition } from "react";
import { Camera, Check } from "lucide-react";
import { publishPostToInstagramAction } from "@/lib/actions/instagram";
import { DemoNote } from "@/components/ui/DemoNote";
import { cn } from "@/lib/utils";

/** Sadece yöneticilere görünen küçük ikon buton — gönderiyi topluluğun ortak Instagram hesabında paylaşır. */
export function PostInstagramButton({ postId }: { postId: string }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function publish() {
    if (pending || state === "done") return;
    setDemo(false);
    setError(null);
    startTransition(async () => {
      const result = await publishPostToInstagramAction({ ok: true }, postId);
      if (result.ok) setState("done");
      else if (result.demo) setDemo(true);
      else if (result.error) {
        setState("error");
        setError(result.error);
      }
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={publish}
        disabled={pending}
        title="Instagram'da paylaş"
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors",
          state === "done" ? "text-[var(--success)]" : "text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]"
        )}
      >
        {state === "done" ? <Check size={14} /> : <Camera size={14} />}
        {pending ? "Paylaşılıyor…" : state === "done" ? "Paylaşıldı" : "Instagram"}
      </button>
      {(demo || error) && (
        <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-lg border border-[var(--line)] bg-[var(--paper-elevated)] p-2 text-xs shadow-md">
          {demo && <DemoNote />}
          {error && <span className="text-[var(--danger)]">{error}</span>}
        </div>
      )}
    </div>
  );
}
