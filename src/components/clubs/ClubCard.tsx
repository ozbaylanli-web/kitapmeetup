import Link from "next/link";
import { Users } from "lucide-react";
import type { ClubSummary } from "@/lib/types";

export function ClubCard({ club }: { club: ClubSummary }) {
  return (
    <Link href={`/kulupler/${club.slug}`} className="paper-card flex flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl"
          style={{ backgroundColor: `color-mix(in srgb, ${club.color} 18%, transparent)` }}
        >
          {club.icon}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg font-semibold text-[var(--ink)]">{club.name}</h3>
          <p className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
            <Users size={12} /> {club.memberCount} üye
          </p>
        </div>
      </div>
      <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">{club.description}</p>
    </Link>
  );
}
