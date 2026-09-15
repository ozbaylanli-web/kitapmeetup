"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, ExternalLink, RotateCcw } from "lucide-react";
import { publishEventToInstagramAction } from "@/lib/actions/instagram";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import type { InstagramPostRecord } from "@/lib/types";

/** Sadece yöneticilere görünür — etkinliği topluluğun ortak Instagram hesabında paylaşır. */
export function InstagramPublishButton({ eventId, initialRecord }: { eventId: string; initialRecord: InstagramPostRecord | null }) {
  const router = useRouter();
  const [record, setRecord] = useState(initialRecord);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function publish() {
    setDemo(false);
    setError(null);
    startTransition(async () => {
      const result = await publishEventToInstagramAction({ ok: true }, eventId);
      if (result.ok) {
        router.refresh();
        setRecord({ status: "published", permalink: null, error: null, createdAt: new Date().toISOString() });
      } else if (result.demo) setDemo(true);
      else if (result.error) setError(result.error);
    });
  }

  return (
    <div className="paper-card p-4">
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
        <Camera size={15} /> Instagram
      </h3>

      {record?.status === "published" && (
        <p className="mb-2 flex items-center gap-1 text-xs text-[var(--success)]">
          Paylaşıldı
          {record.permalink && (
            <a href={record.permalink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 font-semibold hover:underline">
              , gör <ExternalLink size={11} />
            </a>
          )}
        </p>
      )}
      {record?.status === "failed" && <p className="mb-2 text-xs text-[var(--danger)]">Son deneme başarısız: {record.error}</p>}

      <Button type="button" variant={record?.status === "published" ? "secondary" : "primary"} size="sm" disabled={pending} onClick={publish}>
        {record?.status === "published" ? <RotateCcw size={13} /> : <Camera size={13} />}
        {pending ? "Paylaşılıyor…" : record?.status === "published" ? "Tekrar paylaş" : "Instagram'da paylaş"}
      </Button>

      <div className="mt-2 text-xs">
        {demo && <DemoNote />}
        {error && <span className="text-[var(--danger)]">{error}</span>}
      </div>
    </div>
  );
}
