import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Repeat, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfferForm } from "@/components/swaps/OfferForm";
import { OfferCard } from "@/components/swaps/OfferCard";
import { getPostById } from "@/lib/data/feed";
import { getSwapOffers } from "@/lib/data/swaps";
import { getCurrentUser } from "@/lib/data/auth";
import { timeAgo } from "@/lib/utils";

export default async function SwapListingPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const [post, currentUser] = await Promise.all([getPostById(postId), getCurrentUser()]);
  const isSwap = post?.type === "takas" || post?.type === "takas_arama";
  if (!post || !isSwap || !post.book) notFound();
  const isSeeking = post.type === "takas_arama";

  const offers = await getSwapOffers(postId);
  const isOwner = currentUser?.username === post.author.username;
  const myOffer = currentUser ? offers.find((o) => o.offerer.username === currentUser.username) : null;

  return (
    <div>
      <Link href="/" className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
        <ChevronLeft size={16} /> Ana Akış
      </Link>

      <div className="paper-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Link href={`/profil/${post.author.username}`}>
            <Avatar name={post.author.fullName} color={post.author.avatarColor} url={post.author.avatarUrl} size={40} />
          </Link>
          <div className="min-w-0">
            <Link href={`/profil/${post.author.username}`} className="font-semibold text-[var(--ink)] hover:underline">
              {post.author.fullName}
            </Link>
            <p className="text-xs text-[var(--ink-muted)]">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <Pill className="mt-3">
          {isSeeking ? <Search size={12} /> : <Repeat size={12} />}
          {isSeeking ? "Kitap Arıyor" : "Kitap Takası"}
        </Pill>

        <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3.5 py-3">
          <span className="h-12 w-3 shrink-0 rounded-sm" style={{ backgroundColor: post.book.spineColor }} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--orange-600)]">{isSeeking ? "Aranan kitap" : "Takas edilecek kitap"}</p>
            <p className="truncate font-serif text-base font-semibold text-[var(--ink)]">{post.book.title}</p>
            <p className="truncate text-xs text-[var(--ink-muted)]">{post.book.author}</p>
          </div>
        </div>

        {post.counterBook && (
          <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-[var(--paper-sunken)] px-3 py-2">
            <Repeat size={14} className="shrink-0 text-[var(--orange-600)]" />
            <p className="text-xs text-[var(--ink-soft)]">
              Karşılığında verebilir: <span className="font-semibold text-[var(--ink)]">{post.counterBook.title}</span>{" "}
              <span className="text-[var(--ink-muted)]">— {post.counterBook.author}</span>
            </p>
          </div>
        )}

        {post.body && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{post.body}</p>}
      </div>

      {currentUser && !isOwner && !myOffer && (
        <div className="mt-4">
          <OfferForm postId={post.id} listingType={post.type} />
        </div>
      )}
      {myOffer && !isOwner && (
        <p className="mt-4 text-center text-xs text-[var(--ink-muted)]">
          {isSeeking ? "Bu ilana “bende var” dedin" : `“${myOffer.book.title}” ile teklif yaptın`} — aşağıdan durumunu takip edebilirsin.
        </p>
      )}

      <section className="mt-6">
        <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">{isSeeking ? `Haber verenler (${offers.length})` : `Teklifler (${offers.length})`}</h2>
        {offers.length === 0 ? (
          <EmptyState
            emoji={isSeeking ? "🔍" : "🔄"}
            title={isSeeking ? "Henüz kimse haber vermedi" : "Henüz teklif yok"}
            description={isSeeking ? "Bu kitap sende varsa ilk haber veren sen ol." : "Bu ilana ilk teklifi sen yapabilirsin."}
          />
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} canManage={isOwner} hideBook={isSeeking} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
