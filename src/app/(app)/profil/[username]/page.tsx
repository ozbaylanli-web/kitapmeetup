import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonVariants } from "@/components/ui/Button";
import { VisualShelf } from "@/components/profile/VisualShelf";
import { BadgeList } from "@/components/profile/BadgeList";
import { ShelfForm } from "@/components/profile/ShelfForm";
import { PostCard } from "@/components/feed/PostCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { ClubCard } from "@/components/clubs/ClubCard";
import { ShareButton } from "@/components/ui/ShareButton";
import { PublisherBadge } from "@/components/ui/PublisherBadge";
import { ReadingGoalCard } from "@/components/profile/ReadingGoalCard";
import { FollowButton } from "@/components/profile/FollowButton";
import { getProfileByUsername, isFollowing } from "@/lib/data/profiles";
import { getCurrentUser } from "@/lib/data/auth";
import { getBookMatches } from "@/lib/data/matches";
import { getReadingGoal } from "@/lib/data/readingGoals";
import { getBadgeStatuses } from "@/lib/badges";
import { calculateAge, describeMatch } from "@/lib/utils";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [profile, currentUser] = await Promise.all([getProfileByUsername(username), getCurrentUser()]);
  if (!profile) notFound();

  const isOwnProfile = currentUser?.username === profile.author.username;
  const alreadyFollowing = !isOwnProfile && currentUser ? await isFollowing(profile.author.id) : false;
  const badges = getBadgeStatuses(profile);
  const sharedBooks = !isOwnProfile && currentUser
    ? (await getBookMatches()).find((m) => m.user.username === username)?.sharedBooks ?? []
    : [];
  const currentYear = new Date().getFullYear();
  const readingGoal = await getReadingGoal(profile.author.id, profile.author.username, currentYear);

  return (
    <div className="space-y-6">
      <div className="paper-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-start gap-4">
          <Avatar name={profile.author.fullName} color={profile.author.avatarColor} url={profile.author.avatarUrl} size={64} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-[var(--ink)]">{profile.author.fullName}</h1>
              {profile.author.accountKind === "publisher" && <PublisherBadge />}
            </div>
            <p className="text-sm text-[var(--ink-muted)]">@{profile.author.username}</p>
            {profile.author.accountKind === "publisher" && profile.author.publisherWebsite && (
              <a
                href={profile.author.publisherWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[var(--orange-600)] hover:underline"
              >
                {profile.author.publisherWebsite}
              </a>
            )}
            {(profile.author.city || profile.author.birthDate || profile.author.gender) && (
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--ink-muted)]">
                {profile.author.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {profile.author.city}
                  </span>
                )}
                {profile.author.birthDate && <span>{calculateAge(profile.author.birthDate)} yaşında</span>}
                {profile.author.gender && <span>{profile.author.gender}</span>}
              </p>
            )}
            {profile.author.bio && <p className="mt-2 max-w-lg text-sm text-[var(--ink-soft)]">{profile.author.bio}</p>}
            <div className="mt-3 flex gap-4 text-sm">
              <span>
                <strong className="text-[var(--ink)]">{profile.followerCount}</strong>{" "}
                <span className="text-[var(--ink-muted)]">takipçi</span>
              </span>
              <span>
                <strong className="text-[var(--ink)]">{profile.followingCount}</strong>{" "}
                <span className="text-[var(--ink-muted)]">takip</span>
              </span>
            </div>
            {!isOwnProfile && currentUser && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <FollowButton targetId={profile.author.id} username={username} initialFollowing={alreadyFollowing} />
                <Link href={`/mesajlar/${username}`} className={buttonVariants("secondary", "sm")}>
                  <MessageCircle size={13} /> Mesaj gönder
                </Link>
              </div>
            )}
          </div>
          </div>
          <ShareButton title={`${profile.author.fullName} — Kitapmeetup`} text="Kitapmeetup'taki profilime göz at" className="shrink-0" />
        </div>

        {sharedBooks.length > 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] p-3">
            <p className="mb-1.5 text-xs font-semibold text-[var(--orange-700)]">
              📚 Kitap eşleşmenizin var — {sharedBooks.length} ortak kitap
            </p>
            <div className="flex flex-wrap gap-1.5">
              {sharedBooks.map((sb) => (
                <span key={sb.book.id} className="tag-pill bg-white text-[var(--ink-soft)]" title={describeMatch(sb.myStatus, sb.theirStatus)}>
                  {sb.book.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ReadingGoalCard goal={readingGoal} year={currentYear} isOwnProfile={isOwnProfile} />

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Rozetler</h2>
        <div className="paper-card p-4">
          <BadgeList badges={badges} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Ne Okuyorum</h2>
          {isOwnProfile && (
            <div className="flex flex-wrap gap-2">
              <Link href="/kitaplar" className={buttonVariants("outline", "sm")}>
                Kataloğdan seç
              </Link>
              <ShelfForm />
            </div>
          )}
        </div>
        <VisualShelf shelf={profile.shelf} editable={isOwnProfile} />
      </section>

      {profile.clubs.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Kulüpler</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.clubs.map((c) => (
              <ClubCard key={c.id} club={c} />
            ))}
          </div>
        </section>
      )}

      {profile.blogPosts.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Blog yazıları</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {profile.blogPosts.map((b) => (
              <BlogCard key={b.id} post={b} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Gönderiler</h2>
        {profile.posts.length === 0 ? (
          <EmptyState emoji="🕊️" title="Henüz gönderi yok" />
        ) : (
          <div className="space-y-3">
            {profile.posts.map((p) => (
              <PostCard key={p.id} post={p} isAdmin={currentUser?.isAdmin ?? false} />
            ))}
          </div>
        )}
      </section>

      {isOwnProfile && (
        <p className="text-center text-xs text-[var(--ink-muted)]">
          Profilini düzenlemek ister misin? <Link href="/ayarlar" className="font-semibold text-[var(--orange-600)] hover:underline">Ayarlar</Link>
        </p>
      )}
    </div>
  );
}
