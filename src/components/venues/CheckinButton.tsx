"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { checkinAction } from "@/lib/actions/venues";
import { buttonVariants } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";

/** "Şu an buradayım" — hafif bir check-in; hem sosyal bir işaret hem de "Haftanın Mekanı" hesabını besler. */
export function CheckinButton({ venueId }: { venueId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [demo, setDemo] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemo(false);
    const formData = new FormData();
    formData.set("venueId", venueId);
    formData.set("note", note);
    startTransition(async () => {
      const result = await checkinAction({ ok: true }, formData);
      if (result.ok) {
        ambientEngine.playPop();
        setDone(true);
        setNote("");
        router.refresh();
        setTimeout(() => setDone(false), 3000);
      } else if (result.demo) setDemo(true);
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ne okuyorsun? (opsiyonel)"
        className="min-w-40 flex-1 rounded-full border border-[var(--line-strong)] bg-[var(--paper)] px-3.5 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
      />
      <button type="submit" disabled={pending} className={buttonVariants(done ? "secondary" : "primary", "sm")}>
        <MapPin size={13} /> {done ? "Haber verdin!" : pending ? "Gönderiliyor…" : "Şu an buradayım"}
      </button>
      {demo && <DemoNote />}
    </form>
  );
}
