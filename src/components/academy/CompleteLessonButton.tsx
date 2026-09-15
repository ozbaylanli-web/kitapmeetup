"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { completeLessonAction } from "@/lib/actions/academy";
import { buttonVariants } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";

export function CompleteLessonButton({
  lessonId,
  initialCompleted,
  label = "Dersi tamamladım",
  completedLabel = "Tamamlandı",
}: {
  lessonId: string;
  initialCompleted: boolean;
  label?: string;
  completedLabel?: string;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (completed) return;
    setCompleted(true);
    setDemo(false);
    ambientEngine.playPop();

    startTransition(async () => {
      const result = await completeLessonAction({ ok: true }, lessonId);
      if (!result.ok) {
        setCompleted(false);
        if (result.demo) setDemo(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={pending || completed}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: completed ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={buttonVariants(completed ? "secondary" : "primary", "sm")}
      >
        {completed ? (
          <>
            <CheckCircle2 size={14} /> {completedLabel}
          </>
        ) : (
          <>
            <Circle size={14} /> {label}
          </>
        )}
      </motion.button>
      {demo && <DemoNote />}
    </div>
  );
}
