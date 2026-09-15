import Link from "next/link";
import { Quote, HelpCircle, ImageIcon, MessageCircle, BookOpen, Repeat, Search, ArrowRight, CalendarDays, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { PublisherBadge } from "@/components/ui/PublisherBadge";
import { LikeButton } from "./LikeButton";
import { CommentsSection } from "./CommentsSection";
import { PostInstagramButton } from "./PostInstagramButton";
import type { FeedPost } from "@/lib/types";
import { timeAgo, formatEventDate } from "@/lib/utils";

const TYPE_META: Record<FeedPost["type"], { icon: typeof Quote; label: string }> = {
  text: { icon: MessageCircle, label: "Sohbet" },
  quote: { icon: Quote, label: "Alıntı" },
  photo: { icon: ImageIcon, label: "Kitap fotoğrafı" },
  question: { icon: HelpCircle, label: "Soru" },
  takas: { icon: Repeat, label: "Kitap Takası" },
  takas_arama: { icon: Search, label: "Kitap Arıyor" },
  etkinlik: { icon: CalendarDays, label: "Yeni Etkinlik" },
  kulup: { icon: Users, label: "Yeni Kulüp" },
};

/** Instagram'a paylaşmaya değer, "gerçek" içerik sayılan türler (sistem duyuruları/takas ilanları hariç). */
const INSTAGRAM_ELIGIBLE_TYPES: FeedPost["type"][] = ["text", "quote", "photo", "question"];

export function PostCard({ post, isAdmin = false }: { post: FeedPost; isAdmin?: boolean }) {
  const meta = TYPE_META[post.type];
  const TypeIcon = meta.icon;
  const isSwap = post.type === "takas" || post.type === "takas_arama";
  const isSeeking = post.type === "takas_arama";

  return (
    <article className="paper-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Link href={`/profil/${post.author.username}`}>
          <Avatar name={post.author.fullName} color={post.author.avatarColor} url={post.author.avatarUrl} size={40} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link href={`/profil/${post.author.username}`} className="font-semibold text-[var(--ink)] hover:underline">
              {post.author.fullName}
            </Link>
            <span className="text-xs text-[var(--ink-muted)]">@{post.author.username}</span>
            {post.author.accountKind === "publisher" && <PublisherBadge />}
            <span className="text-xs text-[var(--ink-muted)]">· {timeAgo(post.createdAt)}</span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Pill>
              <TypeIcon size={12} />
              {meta.label}
            </Pill>
            {post.club && (
              <Link href={`/kulupler/${post.club.slug}`}>
                <Pill color={post.club.color}>
                  {post.club.icon} {post.club.name}
                </Pill>
              </Link>
            )}
          </div>

          {post.body && (
            <p
              className={
                post.type === "quote"
                  ? "mt-3 font-serif text-lg italic leading-snug text-[var(--ink)]"
                  : "mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--ink)]"
              }
            >
              {post.body}
            </p>
          )}

          {post.book && isSwap && (
            <Link
              href={`/kitaplar/${post.book.id}`}
              className="mt-3 flex items-center gap-2.5 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3 py-2.5 hover:bg-[var(--orange-100)]"
            >
              <span className="h-9 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: post.book.spineColor }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--orange-600)]">
                  {isSeeking ? "Aranan kitap" : "Takas edilecek kitap"}
                </p>
                <p className="truncate text-sm font-semibold text-[var(--ink)]">{post.book.title}</p>
                <p className="truncate text-xs text-[var(--ink-muted)]">{post.book.author}</p>
              </div>
            </Link>
          )}
          {post.counterBook && isSeeking && (
            <div className="mt-1.5 flex items-center gap-2 pl-1 text-xs text-[var(--ink-muted)]">
              <Repeat size={12} className="shrink-0 text-[var(--orange-600)]" />
              Karşılığında verebilir: <span className="font-medium text-[var(--ink-soft)]">{post.counterBook.title}</span>
            </div>
          )}
          {post.event && post.type === "etkinlik" && (
            <Link
              href={`/etkinlikler/${post.event.slug}`}
              className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-dashed border-[var(--orange-300)] bg-[var(--orange-50)] px-3.5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-serif text-base font-semibold text-[var(--ink)]">{post.event.title}</p>
                <p className="text-xs text-[var(--ink-muted)]">{formatEventDate(post.event.startsAt)}</p>
              </div>
              <ArrowRight size={16} className="shrink-0 text-[var(--orange-600)]" />
            </Link>
          )}

          {post.club && post.type === "kulup" && (
            <Link
              href={`/kulupler/${post.club.slug}`}
              className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[var(--orange-500)] px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--orange-600)]"
            >
              <span>Kulübe git</span>
              <ArrowRight size={14} />
            </Link>
          )}

          {post.book && !isSwap && (
            <Link href={`/kitaplar/${post.book.id}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
              <BookOpen size={14} />
              <span>
                {post.book.title} <span className="opacity-70">— {post.book.author}</span>
              </span>
            </Link>
          )}

          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt="Paylaşılan fotoğraf" className="mt-3 max-h-96 w-full rounded-xl object-cover" />
          ) : post.photoColor ? (
            <div
              className="mt-3 flex h-40 w-full items-center justify-center rounded-xl text-white"
              style={{ background: `linear-gradient(160deg, ${post.photoColor}, var(--ink))` }}
            >
              <ImageIcon size={28} className="opacity-80" />
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[var(--line)] pt-2.5">
            <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
            <CommentsSection postId={post.id} initialCount={post.commentCount} />
            {isAdmin && INSTAGRAM_ELIGIBLE_TYPES.includes(post.type) && <PostInstagramButton postId={post.id} />}
          </div>

          {isSwap && (
            <Link
              href={`/takas/${post.id}`}
              className="mt-2.5 flex items-center justify-between gap-2 rounded-xl bg-[var(--orange-500)] px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--orange-600)]"
            >
              <span>
                {post.myOfferStatus
                  ? isSeeking
                    ? "Haber verdin, durumu gör"
                    : "Teklifini gördün mü?"
                  : (post.offerCount ?? 0) > 0
                    ? isSeeking
                      ? `${post.offerCount} kişide var`
                      : `${post.offerCount} teklif geldi`
                    : isSeeking
                      ? "Bende var, ilk sen söyle"
                      : "İlk teklifi sen yap"}
              </span>
              <span className="flex items-center gap-1">
                {isSeeking ? "Bende var" : "Teklif yap"} <ArrowRight size={14} />
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
