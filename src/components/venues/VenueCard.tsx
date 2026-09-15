import Link from "next/link";
import { Star, MapPin, Users } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { VENUE_KIND_META } from "@/lib/venueKinds";
import type { VenueSummary } from "@/lib/types";

export function VenueCard({ venue }: { venue: VenueSummary }) {
  const kindMeta = VENUE_KIND_META[venue.kind];

  return (
    <Link href={`/mekanlar/${venue.slug}`} className="paper-card flex flex-col gap-2.5 p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-lg font-semibold text-[var(--ink)]">{venue.name}</h3>
          <p className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
            <MapPin size={12} /> {venue.district}
          </p>
        </div>
        {venue.avgRating != null && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--gold-300)]/40 px-2 py-1 text-xs font-semibold text-[var(--gold-600)]">
            <Star size={12} fill="currentColor" /> {venue.avgRating}
          </span>
        )}
      </div>

      <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">{venue.description}</p>

      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <Pill>
          {kindMeta.emoji} {kindMeta.label}
        </Pill>
        {venue.activeCheckinCount > 0 && (
          <Pill className="bg-[var(--success)]/15 text-[var(--success)]">
            <Users size={11} /> {venue.activeCheckinCount} kişi burada
          </Pill>
        )}
      </div>
    </Link>
  );
}
