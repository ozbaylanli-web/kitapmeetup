import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Pill({
  children,
  color,
  className,
}: {
  children: ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("tag-pill", className)}
      style={
        color
          ? { backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`, color }
          : { backgroundColor: "var(--paper-sunken)", color: "var(--ink-soft)" }
      }
    >
      {children}
    </span>
  );
}
