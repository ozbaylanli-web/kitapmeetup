"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toggleLikeAction } from "@/lib/actions/posts";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";
import { cn } from "@/lib/utils";

export function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));
    setDemo(false);
    if (nextLiked) ambientEngine.playPop();
    else ambientEngine.playUnpop();

    startTransition(async () => {
      const result = await toggleLikeAction({ ok: true }, postId);
      if (!result.ok) {
        setLiked(liked);
        setCount((c) => c + (nextLiked ? -1 : 1));
        if (result.demo) setDemo(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors",
          liked ? "text-[var(--orange-600)]" : "text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)]"
        )}
      >
        <motion.span
          animate={{ scale: liked ? [1, 1.45, 0.95, 1.1, 1] : 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="inline-flex"
        >
          <Heart size={17} strokeWidth={2.2} className={liked ? "fill-[var(--orange-500)] text-[var(--orange-500)]" : ""} />
        </motion.span>
        {count > 0 && <span>{count}</span>}
      </button>
      {demo && <DemoNote />}
    </div>
  );
}
