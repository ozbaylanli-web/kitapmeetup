"use client";

import { useState, useTransition } from "react";
import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";
import { rsvpLessonAction } from "@/lib/actions/academy";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import { cn } from "@/lib/utils";
import type { RsvpStatus } from "@/lib/types";

/** Etkinliklerdeki RsvpButtons ile aynı desen — Akademi dersleri artık gerçek buluşmalar olduğu için. */
export function LessonRsvpButtons({
  lessonId,
  initialStatus,
  initialGoing,
  initialInterested,
}: {
  lessonId: string;
  initialStatus: RsvpStatus | null;
  initialGoing: number;
  initialInterested: number;
}) {
  const [status, setStatus] = useState<RsvpStatus | null>(initialStatus);
  const [going, setGoing] = useState(initialGoing);
  const [interested, setInterested] = useState(initialInterested);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(next: RsvpStatus) {
    if (pending) return;
    const prevStatus = status;
    const prevGoing = going;
    const prevInterested = interested;

    setGoing((g) => g + (next === "going" ? 1 : 0) - (prevStatus === "going" ? 1 : 0));
    setInterested((i) => i + (next === "interested" ? 1 : 0) - (prevStatus === "interested" ? 1 : 0));
    setStatus(next);
    setDemo(false);
    ambientEngine.playPop();

    startTransition(async () => {
      const result = await rsvpLessonAction({ ok: true }, { lessonId, status: next });
      if (!result.ok) {
        setStatus(prevStatus);
        setGoing(prevGoing);
        setInterested(prevInterested);
        if (result.demo) setDemo(true);
      }
    });
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <motion.button
          type="button"
          onClick={() => pick("going")}
          disabled={pending}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: status === "going" ? [1, 1.07, 1] : 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
            status === "going" ? "bg-[var(--orange-500)] text-white" : "bg-[var(--paper-sunken)] text-[var(--ink-soft)] hover:bg-[var(--line)]"
          )}
        >
          <Check size={14} /> Gidiyorum <span className="opacity-80">· {going}</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => pick("interested")}
          disabled={pending}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: status === "interested" ? [1, 1.07, 1] : 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
            status === "interested"
              ? "bg-[var(--orange-100)] text-[var(--orange-700)]"
              : "bg-[var(--paper-sunken)] text-[var(--ink-soft)] hover:bg-[var(--line)]"
          )}
        >
          <Star size={14} /> İlgileniyorum <span className="opacity-80">· {interested}</span>
        </motion.button>
      </div>
      {demo && <DemoNote />}
    </div>
  );
}
