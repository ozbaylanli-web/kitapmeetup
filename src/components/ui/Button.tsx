import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export function buttonVariants(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap",
    {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    }[size],
    {
      primary: "bg-[var(--orange-500)] text-white hover:bg-[var(--orange-600)] shadow-sm",
      secondary: "bg-[var(--paper-sunken)] text-[var(--ink)] hover:bg-[var(--line)]",
      outline: "border border-[var(--line-strong)] text-[var(--ink)] hover:bg-[var(--paper-sunken)]",
      ghost: "text-[var(--ink-soft)] hover:bg-[var(--paper-sunken)]",
      danger: "bg-[var(--danger)] text-white hover:opacity-90",
    }[variant],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonVariants(variant, size, className)} {...props} />;
}
