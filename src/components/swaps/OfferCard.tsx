"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { acceptOfferAction, declineOfferAction } from "@/lib/actions/swaps";
import { Avatar } from "@/components/ui/Avatar";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import { timeAgo, cn } from "@/lib/utils";
import type { SwapOffer } from "@/lib/types";

const STATUS_META: Record<SwapOffer["status"], { label: string; className: string }> = {
  pending: { label: "Bekliyor", className: "bg-[var(--paper-sunken)] text-[var(--ink-soft)]" },
  accepted: { label: "Kabul edildi 🎉", className: "bg-[var(--success)]/15 text-[var(--success)]" },
  declined: { label: "Reddedildi", className: "bg-[var(--danger)]/10 text-[var(--danger)]" },
};

export function OfferCard({ offer, canManage, hideBook = false }: { offer: SwapOffer; canManage: boolean; hideBook?: boolean }) {
  const router = useRouter();
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function respond(action: typeof acceptOfferAction) {
    setDemo(false);
    startTransition(async () => {
      const result = await action({ ok: true }, offer.id);
      if (result.ok) {
        ambientEngine.playPop();
        router.refresh();
      } else if (result.demo) setDemo(true);
    });
  }

  const meta = STATUS_META[offer.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="paper-card flex items-start gap-3 p-4"
    >
      <Link href={`/profil/${offer.offerer.username}`} className="shrink-0">
        <Avatar name={offer.offerer.fullName} color={offer.offerer.avatarColor} url={offer.offerer.avatarUrl} size={36} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/profil/${offer.offerer.username}`} className="text-sm font-semibold text-[var(--ink)] hover:underline">
            {offer.offerer.fullName}
          </Link>
          <span className="text-xs text-[var(--ink-muted)]">· {timeAgo(offer.createdAt)}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", meta.className)}>{meta.label}</span>
        </div>

        {!hideBook && (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-[var(--paper-sunken)] px-2.5 py-1.5">
            <span className="h-7 w-1.5 shrink-0 rounded-sm" style={{ backgroundColor: offer.book.spineColor }} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--ink)]">{offer.book.title}</p>
              <p className="truncate text-[11px] text-[var(--ink-muted)]">{offer.book.author}</p>
            </div>
          </div>
        )}

        {offer.message && <p className="mt-2 text-sm text-[var(--ink-soft)]">{offer.message}</p>}

        {canManage && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {offer.status === "pending" && (
              <>
                <button
                  type="button"
                  onClick={() => respond(acceptOfferAction)}
                  disabled={pending}
                  className="flex items-center gap-1 rounded-full bg-[var(--success)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  <Check size={12} /> Kabul et
                </button>
                <button
                  type="button"
                  onClick={() => respond(declineOfferAction)}
                  disabled={pending}
                  className="flex items-center gap-1 rounded-full bg-[var(--paper-sunken)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] hover:bg-[var(--line)]"
                >
                  <X size={12} /> Reddet
                </button>
              </>
            )}
            <Link
              href={`/mesajlar/${offer.offerer.username}`}
              className="flex items-center gap-1 rounded-full border border-[var(--line-strong)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] hover:bg-[var(--paper-sunken)]"
            >
              <MessageCircle size={12} /> Mesaj at, pazarlık et
            </Link>
          </div>
        )}
        {demo && <DemoNote />}
      </div>
    </motion.div>
  );
}
