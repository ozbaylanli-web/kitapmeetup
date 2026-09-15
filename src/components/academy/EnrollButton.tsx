"use client";

import { useState, useTransition } from "react";
import { GraduationCap, Check } from "lucide-react";
import { enrollAction } from "@/lib/actions/academy";
import { buttonVariants } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";

export function EnrollButton({ courseId, initialEnrolled }: { courseId: string; initialEnrolled: boolean }) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (enrolled) return;
    setEnrolled(true);
    setDemo(false);

    startTransition(async () => {
      const result = await enrollAction({ ok: true }, courseId);
      if (!result.ok) {
        setEnrolled(false);
        if (result.demo) setDemo(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={handleClick} disabled={pending || enrolled} className={buttonVariants(enrolled ? "secondary" : "primary", "sm")}>
        {enrolled ? (
          <>
            <Check size={14} /> Kayıtlısın
          </>
        ) : (
          <>
            <GraduationCap size={14} /> Derse kaydol
          </>
        )}
      </button>
      {demo && <DemoNote />}
    </div>
  );
}
