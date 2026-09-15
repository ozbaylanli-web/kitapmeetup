"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { quickAddToShelfAction } from "@/lib/actions/shelf";
import { DemoNote } from "@/components/ui/DemoNote";
import { cn } from "@/lib/utils";
import type { ShelfStatus } from "@/lib/types";

export function QuickAddButton({
  title,
  author,
  status = "read",
  genre,
}: {
  title: string;
  author: string;
  status?: ShelfStatus;
  genre?: string | null;
}) {
  const [added, setAdded] = useState(false);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (added) return;
    setAdded(true);
    setDemo(false);

    startTransition(async () => {
      const result = await quickAddToShelfAction({ ok: true }, { title, author, status, genre });
      if (!result.ok) {
        setAdded(false);
        if (result.demo) setDemo(true);
      }
    });
  }

  const label = status === "read" ? "Okudum" : status === "reading" ? "Okuyorum" : "İstiyorum";

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || added}
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
          added ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-[var(--orange-100)] text-[var(--orange-700)] hover:bg-[var(--orange-200)]"
        )}
      >
        {added ? <Check size={13} /> : <Plus size={13} />}
        {added ? "Eklendi" : label}
      </button>
      {demo && <DemoNote text="Demo modu" />}
    </div>
  );
}
