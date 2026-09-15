"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** 1-5 arası tıklanabilir yıldız puanlayıcı — form içinde gizli bir input'la birlikte kullanılır. */
export function StarRatingInput({ value, onChange, size = 18 }: { value: number; onChange: (n: number) => void; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n === value ? 0 : n)}
          aria-label={`${n} yıldız`}
          className="p-0.5 text-[var(--gold-500)] transition-transform hover:scale-110"
        >
          <Star size={size} fill={n <= value ? "currentColor" : "none"} strokeWidth={1.8} className={cn(n > value && "text-[var(--ink-muted)]")} />
        </button>
      ))}
    </div>
  );
}
