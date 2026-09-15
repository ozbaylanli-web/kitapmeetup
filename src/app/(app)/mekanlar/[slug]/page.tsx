import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, ExternalLink, CalendarDays, Users } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckinButton } from "@/components/venues/CheckinButton";
import { VenueNoteForm } from "@/components/venues/VenueNoteForm";
import { getVenueBySlug } from "@/lib/data/venues";
import { getCurrentUser } from "@/lib/data/auth";
import { VENUE_KIND_META } from "@/lib/venueKinds";
import { formatEventDate } from "@/lib/utils";

export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const venue = await getVenueBySlug(slug);
  if (!venue) notFound();

  const currentUser = await getCurrentUser();
  const kindMeta = VENUE_KIND_META[venue.kind];

  return (
    <div>
      <div className="paper-card mb-6 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 flex items-center gap-1 text-xs text-[var(--ink-muted)]">
              <MapPin size={12} /> {venue.district}
            </p>
            <h1 className="font-serif text-2xl font-semibold text-[var(--ink)]">
              {kindMeta.emoji} {venue.name}
            </h1>
          </div>
          {venue.avgRating != null && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--gold-300)]/40 px-2.5 py-1.5 text-sm font-semibold text-[var(--gold-600)]">
              <Star size={14} fill="currentColor" /> {venue.avgRating}
              <span className="font-normal text-[var(--ink-muted)]">({venue.noteCount})</span>
            </span>
          )}
        </div>

        {venue.description && <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{venue.description}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Pill>
            {kindMeta.emoji} {kindMeta.label}
          </Pill>
          <span className="text-xs text-[var(--ink-muted)]">rehbere ekleyen {venue.addedBy.fullName}</span>
        </div>

        {venue.mapsUrl && (
          <a
            href={venue.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--orange-600)] hover:underline"
          >
            <ExternalLink size={14} /> Google Maps&apos;te aç
          </a>
        )}

        <div className="mt-4 border-t border-[var(--line)] pt-4">
          {currentUser ? (
            <CheckinButton venueId={venue.id} />
          ) : (
            <p className="text-xs text-[var(--ink-muted)]">Buradayım demek için giriş yapmalısın.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Notlar ve puanlar</h2>

          {currentUser && <VenueNoteForm venueId={venue.id} myNote={venue.myNote ?? null} />}

          {venue.notes.length === 0 ? (
            <EmptyState emoji="📝" title="Henüz not yok" description="Bu mekan hakkında ilk notu sen bırak." />
          ) : (
            <div className="space-y-3">
              {venue.notes.map((n) => (
                <div key={n.id} className="paper-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/profil/${n.author.username}`} className="flex items-center gap-2">
                      <Avatar name={n.author.fullName} color={n.author.avatarColor} url={n.author.avatarUrl} size={26} />
                      <span className="text-sm font-medium text-[var(--ink)]">{n.author.fullName}</span>
                    </Link>
                    {n.rating != null && (
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-[var(--gold-600)]">
                        <Star size={12} fill="currentColor" /> {n.rating}
                      </span>
                    )}
                  </div>
                  {n.body && <p className="mt-2 text-sm text-[var(--ink-soft)]">{n.body}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {venue.activeCheckins.length > 0 && (
            <div className="paper-card p-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
                <Users size={15} className="text-[var(--success)]" /> Şu an burada
              </h3>
              <div className="space-y-2.5">
                {venue.activeCheckins.map((c) => (
                  <Link key={c.id} href={`/profil/${c.user.username}`} className="flex items-center gap-2">
                    <Avatar name={c.user.fullName} color={c.user.avatarColor} url={c.user.avatarUrl} size={26} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[var(--ink)]">{c.user.fullName}</p>
                      {c.note && <p className="truncate text-[11px] text-[var(--ink-muted)]">{c.note}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="paper-card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
              <CalendarDays size={15} /> Buradaki etkinlikler
            </h3>
            {venue.upcomingEvents.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">Şu an planlanan etkinlik yok.</p>
            ) : (
              <div className="space-y-2.5">
                {venue.upcomingEvents.slice(0, 5).map((e) => (
                  <Link key={e.id} href={`/etkinlikler/${e.slug}`} className="block rounded-lg px-2 py-1.5 hover:bg-[var(--paper-sunken)]">
                    <p className="text-xs font-semibold text-[var(--ink)]">{e.title}</p>
                    <p className="text-[11px] text-[var(--ink-muted)]">{formatEventDate(e.startsAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
