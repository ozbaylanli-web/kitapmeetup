import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Yayınevi hesaplarını her yerde aynı şekilde işaretleyen küçük rozet. */
export function PublisherBadge({ className }: { className?: string }) {
  return (
    <span className={cn("tag-pill bg-[var(--gold-300)]/40 text-[var(--gold-600)]", className)}>
      <Building2 size={11} /> Yayınevi
    </span>
  );
}
