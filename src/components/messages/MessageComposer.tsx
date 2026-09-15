"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessageAction } from "@/lib/actions/messages";
import { Button } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";

const initialState = { ok: true as const };

export function MessageComposer({ recipientUsername }: { recipientUsername: string }) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && state.ok) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <div>
      <form ref={formRef} action={formAction} className="flex items-end gap-2">
        <input type="hidden" name="recipientUsername" value={recipientUsername} />
        <textarea
          name="body"
          required
          rows={1}
          placeholder="Bir mesaj yaz…"
          className="flex-1 resize-none rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm outline-none focus:border-[var(--orange-400)]"
        />
        <Button type="submit" disabled={pending} className="shrink-0">
          Gönder
        </Button>
      </form>
      <div className="mt-1.5 text-xs">
        {state.demo && <DemoNote />}
        {"error" in state && state.error && <span className="text-[var(--danger)]">{state.error}</span>}
      </div>
    </div>
  );
}
