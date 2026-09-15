"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { joinClubAction, leaveClubAction } from "@/lib/actions/clubs";
import { buttonVariants } from "@/components/ui/Button";
import { DemoNote } from "@/components/ui/DemoNote";
import { ambientEngine } from "@/lib/audio/ambientEngine";

export function JoinClubButton({ clubId, initialMember }: { clubId: string; initialMember: boolean }) {
  const [member, setMember] = useState(initialMember);
  const [demo, setDemo] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const next = !member;
    setMember(next);
    setDemo(false);
    if (next) ambientEngine.playPop();
    else ambientEngine.playUnpop();

    startTransition(async () => {
      const result = await (next ? joinClubAction({ ok: true }, clubId) : leaveClubAction({ ok: true }, clubId));
      if (!result.ok) {
        setMember(!next);
        if (result.demo) setDemo(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={pending}
        whileTap={{ scale: 0.94 }}
        animate={{ scale: member ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={buttonVariants(member ? "secondary" : "primary", "sm")}
      >
        {member ? (
          <>
            <Check size={14} /> Üyesin
          </>
        ) : (
          <>
            <Plus size={14} /> Kulübe katıl
          </>
        )}
      </motion.button>
      {demo && <DemoNote />}
    </div>
  );
}
