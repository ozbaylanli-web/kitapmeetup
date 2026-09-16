import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, CalendarDays } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { JoinClubButton } from "@/components/clubs/JoinClubButton";
import { BookRoulette } from "@/components/clubs/BookRoulette";
import { ClubReadingSection } from "@/components/clubs/ClubReadingSection";
import { ClubVenueSection } from "@/components/clubs/ClubVenueSection";
import { PostCard } from "@/components/feed/PostCard";
import { PublisherBadge } from "@/components/ui/PublisherBadge";
import { CoverUploader } from "@/components/ui/CoverUploader";
import { getClubBySlug, isClubMember, getMyClubRole } from "@/lib/data/clubs";
import { setClubCoverAction } from "@/lib/actions/clubs";
import { getFeedPosts } from "@/lib/data/feed";
import { getEvents } from "@/lib/data/events";
import { getVenues } from "@/lib/data/venues";
import { getCurrentUser } from "@/lib/data/auth";
import { formatEventDate, isPastDate } from "@/lib/utils";

export default async function ClubDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);
  if (!club) notFound();

  const [posts, events, venues, currentUser, memberStatus, myRole] = await Promise.all([
    getFeedPosts({ clubId: club.id }),
    getEvents(),
    getVenues(),
    getCurrentUser(),
    isClubMember(club.id),
    getMyClubRole(club.id),
  ]);
  const canManageReading = myRole === "owner" || myRole === "moderator";
  const clubEvents = events.filter((e) => e.club?.id === club.id && !isPastDate(e.startsAt));

  return (
    <div>
      <div className="paper-card mb-6 overflow-hidden">
        {(club.coverUrl || canManageReading) && (
          <div
            className="relative flex h-28 items-start justify-end p-3 sm:h-36"
            style={
              club.coverUrl
                ? { backgroundImage: `url(${club.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: `linear-gradient(135deg, color-mix(in srgb, ${club.color} 30%, transparent), transparent)` }
            }
          >
            {canManageReading && (
              <CoverUploader action={setClubCoverAction} idFieldName="clubId" idValue={club.id} hasCover={Boolean(club.coverUrl)} />
            )}
          </div>
        )}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                style={{ backgroundColor: `color-mix(in srgb, ${club.color} 18%, transparent)` }}
              >
                {club.icon}
              </span>
              <div>
                <h1 className="font-serif text-2xl font-semibold text-[var(--ink)]">{club.name}</h1>
                <p className="flex flex-wrap items-center gap-1 text-xs text-[var(--ink-muted)]">
                  <Users size={12} /> {club.memberCount} üye · kurucu {club.createdBy.fullName}
                  {club.createdBy.accountKind === "publisher" && <PublisherBadge />}
                </p>
              </div>
            </div>
            {currentUser && <JoinClubButton clubId={club.id} initialMember={memberStatus} />}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">{club.description}</p>

          {club.members.length > 0 && (
            <div className="mt-4 flex -space-x-2">
              {club.members.slice(0, 8).map((m) => (
                <Link key={m.id} href={`/profil/${m.username}`}>
                  <Avatar
                    name={m.fullName}
                    color={m.avatarColor}
                    url={m.avatarUrl}
                    size={30}
                    className="ring-2 ring-[var(--paper-elevated)]"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Kulüp akışı</h2>
          {posts.length === 0 ? (
            <EmptyState emoji="🗨️" title="Henüz gönderi yok" description="Bu kulüpte ilk paylaşımı sen yap." />
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} isAdmin={currentUser?.isAdmin ?? false} />)
          )}
        </div>

        <div className="space-y-4">
          <ClubReadingSection
            clubId={club.id}
            clubSlug={club.slug}
            pinnedBook={club.pinnedBook}
            pinnedBookNote={club.pinnedBookNote}
            readThreads={club.readThreads}
            canManage={canManageReading}
            canPost={memberStatus}
          />

          {club.currentBooks.length > 0 && <BookRoulette books={club.currentBooks} />}

          <ClubVenueSection clubId={club.id} homeVenue={club.homeVenue} venues={venues} canManage={canManageReading} />

          <div className="paper-card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
              <CalendarDays size={15} /> Yaklaşan etkinlikler
            </h3>
            {clubEvents.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">Şu an planlanan etkinlik yok.</p>
            ) : (
              <div className="space-y-2.5">
                {clubEvents.slice(0, 3).map((e) => (
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
