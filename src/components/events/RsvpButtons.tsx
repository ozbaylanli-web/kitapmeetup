"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { rsvpAction } from "@/lib/actions/events";
import { DemoNote } from "@/components/ui/DemoNote";
import { EventRegistrationForm } from "./EventRegistrationForm";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import { cn } from "@/lib/utils";
import type { RegistrationField, RsvpStatus } from "@/lib/types";

export function RsvpButtons({
  eventId,
  initialStatus,
  initialGoing,
  initialInterested,
  registrationFields = [],
  initialAnswers = {},
}: {
  eventId: string;
  initialStatus: RsvpStatus | null;
  initialGoing: number;
  initialInterested: number;
  /** Organizatörün tanımladığı kayıt soruları — varsa "Gidiyorum" önce bu formu açar. */
  registrationFields?: RegistrationField[];
  initialAnswers?: Record<string, string>;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<RsvpStatus | null>(initialStatus);
  const [going, setGoing] = useState(initialGoing);
  const [interested, setInterested] = useState(initialInterested);
  const [demo, setDemo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  function pick(next: RsvpStatus) {
    if (pending) return;

    // Kayıt soruları varsa ve "Gidiyorum" seçiliyorsa, önce formu doldurtuyoruz —
    // RSVP + yanıtlar + onay e-postası tek adımda completeEventRegistrationAction'da.
    if (next === "going" && registrationFields.length > 0 && status !== "going") {
      setShowForm(true);
      return;
    }

    const prevStatus = status;
    const prevGoing = going;
    const prevInterested = interested;

    // iyimser güncelleme
    setGoing((g) => g + (next === "going" ? 1 : 0) - (prevStatus === "going" ? 1 : 0));
    setInterested((i) => i + (next === "interested" ? 1 : 0) - (prevStatus === "interested" ? 1 : 0));
    setStatus(next);
    setDemo(false);
    ambientEngine.playPop();

    startTransition(async () => {
      const result = await rsvpAction({ ok: true }, { eventId, status: next });
      if (!result.ok) {
        setStatus(prevStatus);
        setGoing(prevGoing);
        setInterested(prevInterested);
        if (result.demo) setDemo(true);
      }
    });
  }

  function handleRegistrationDone() {
    ambientEngine.playPop();
    setShowForm(false);
    setGoing((g) => g + (status === "going" ? 0 : 1));
    setInterested((i) => i - (status === "interested" ? 1 : 0));
    setStatus("going");
    router.refresh();
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
        {status === "going" && registrationFields.length > 0 && !showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 text-xs font-semibold text-[var(--orange-600)] hover:underline"
          >
            <Pencil size={11} /> Kayıt bilgilerini düzenle
          </button>
        )}
      </div>
      {demo && <DemoNote />}

      {showForm && (
        <EventRegistrationForm
          eventId={eventId}
          fields={registrationFields}
          initialAnswers={initialAnswers}
          onDone={handleRegistrationDone}
        />
      )}
    </div>
  );
}
