"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createCommentAction } from "@/lib/actions/posts";
import { DemoNote } from "@/components/ui/DemoNote";
import { buttonVariants } from "@/components/ui/Button";

export function ThreadCommentForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setDemo(false);
    setError(null);

    const formData = new FormData();
    formData.set("targetType", "read_thread");
    formData.set("targetId", threadId);
    formData.set("body", text.trim());

    startTransition(async () => {
      const result = await createCommentAction({ ok: true }, formData);
      if (result.ok) {
        setText("");
        router.refresh();
      } else if (result.demo) setDemo(true);
      else if (result.error) setError(result.error);
    });
  }

  return (
    <div>
      <form onSubmit={submit} className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Bu bölüm hakkında ne düşünüyorsun?"
          className="flex-1 rounded-full border border-[var(--line-strong)] bg-[var(--paper-elevated)] px-3.5 py-2 text-sm outline-none focus:border-[var(--orange-400)]"
        />
        <button type="submit" disabled={pending} className={buttonVariants("secondary", "sm")}>
          Gönder
        </button>
      </form>
      {demo && <DemoNote />}
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
