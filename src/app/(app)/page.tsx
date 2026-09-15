import Link from "next/link";
import { PenSquare } from "lucide-react";
import { PostComposer } from "@/components/feed/PostComposer";
import { FeedList } from "@/components/feed/FeedList";
import { TodaysQuestion } from "@/components/feed/TodaysQuestion";
import { WhosReadingNow } from "@/components/feed/WhosReadingNow";
import { MatchesTeaser } from "@/components/matches/MatchesTeaser";
import { VenueOfTheWeekCard } from "@/components/venues/VenueOfTheWeekCard";
import { getCurrentUser } from "@/lib/data/auth";
import { getHomeFeed } from "@/lib/data/feed";
import { getClubs } from "@/lib/data/clubs";

export default async function HomePage() {
  const [currentUser, feedItems, clubs] = await Promise.all([getCurrentUser(), getHomeFeed(), getClubs()]);

  return (
    <div>
      <TodaysQuestion />
      {currentUser && <MatchesTeaser />}
      <WhosReadingNow />
      <VenueOfTheWeekCard />
      {currentUser && <PostComposer currentUser={currentUser} clubs={clubs} />}

      <div className="mb-4 flex items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
        <span>Akış; kısa paylaşımları ve blog yazılarını bir arada gösterir.</span>
        <Link href="/blog/yeni" className="flex shrink-0 items-center gap-1 font-semibold text-[var(--orange-600)] hover:underline">
          <PenSquare size={12} /> Yazı yaz
        </Link>
      </div>

      <FeedList items={feedItems} isAdmin={currentUser?.isAdmin ?? false} />
    </div>
  );
}
