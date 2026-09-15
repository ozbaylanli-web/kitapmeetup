import Link from "next/link";
import { Flame, MapPin, CalendarDays, Users } from "lucide-react";
import { VENUE_KIND_META } from "@/lib/venueKinds";
import { getVenueOfTheWeek } from "@/lib/data/venues";

/**
 * Editöryel bir seçim değil — o hafta gerçekten etkinlik düzenlenen ya da
 * "buradayım" denen en hareketli mekan, dinamik olarak hesaplanıp gösterilir.
 * Hiç hareket yoksa (ör. yeni bir topluluk) hiçbir şey render etmez.
 */
export async function VenueOfTheWeekCard() {
  const result = await getVenueOfTheWeek();
  if (!result) return null;

  const { venue, eventCount, checkinCount } = result;
  const kindMeta = VENUE_KIND_META[venue.kind];

  return (
    <Link
      href={`/mekanlar/${venue.slug}`}
      className="mb-4 flex items-center gap-3 rounded-2xl border border-dashed border-[var(--gold-500)]/50 bg-gradient-to-br from-[var(--gold-300)]/25 to-transparent p-3.5 transition-transform hover:-translate-y-0.5 sm:p-4"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--gold-300)]/40 text-[var(--gold-600)]">
        <Flame size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--gold-600)]">🔥 Haftanın Mekanı</p>
        <p className="truncate font-serif text-base font-semibold text-[var(--ink)]">
          {kindMeta.emoji} {venue.name}
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--ink-muted)]">
          <span className="flex items-center gap-1">
            <MapPin size={11} /> {venue.district}
          </span>
          {eventCount > 0 && (
            <span className="flex items-center gap-1">
              <CalendarDays size={11} /> {eventCount} etkinlik
            </span>
          )}
          {checkinCount > 0 && (
            <span className="flex items-center gap-1">
              <Users size={11} /> {checkinCount} kişi buradaydı
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
