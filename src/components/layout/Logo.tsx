"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 shrink-0">
      <motion.span
        whileHover={{ rotate: -10, scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="sunset-gradient flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm"
      >
        <BookOpen size={18} strokeWidth={2.4} />
      </motion.span>
      {withWordmark && (
        <span className="font-serif text-lg font-semibold tracking-tight text-[var(--ink)]">
          Kitapmeetup
        </span>
      )}
    </Link>
  );
}
