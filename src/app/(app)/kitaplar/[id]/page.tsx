import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Users, BookOpen } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { PostCard } from "@/components/feed/PostCard";
import { getBookById } from "@/lib/data/books";
import { getCurrentUser } from "@/lib/data/auth";
import { formatEventDate, slugify } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = { reading: "okuyor", read: "okudu", want: "okumak istiyor" };

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [book, currentUser] = await Promise.all([getBookById(id), getCurrentUser()]);
  if (!book) notFound();

  return (
    <div>
      <div className="paper-card mb-6 flex gap-4 p-5 sm:p-6">
        <span className="h-24 w-8 shrink-0 rounded-sm shadow-sm" style={{ backgroundColor: book.spineColor }} />
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold text-[var(--ink)]">{book.title}</h1>
          <Link href={`/yazarlar/${slugify(book.author)}`} className="text-sm font-medium text-[var(--orange-600)] hover:underline">
            {book.author}
          </Link>
          {book.genre && (
            <div className="mt-2">
              <Pill>{book.genre}</Pill>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[var(--ink)]">Bu kitapla ilgili paylaşımlar</h2>
          {book.posts.length === 0 ? (
            <EmptyState emoji="🕊️" title="Henüz paylaşım yok" description="Bu kitapla ilgili ilk paylaşımı sen yap." />
          ) : (
            <div className="space-y-3">
              {book.posts.map((p) => (
                <PostCard key={p.id} post={p} isAdmin={currentUser?.isAdmin ?? false} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="paper-card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
              <BookOpen size={15} /> Kim okuyor / okumuş
            </h3>
            {book.readers.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">Henüz kimse rafına eklemedi.</p>
            ) : (
              <div className="space-y-2.5">
                {book.readers.slice(0, 12).map((r) => (
                  <Link key={r.author.id} href={`/profil/${r.author.username}`} className="flex items-center gap-2">
                    <Avatar name={r.author.fullName} color={r.author.avatarColor} url={r.author.avatarUrl} size={26} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-[var(--ink)]">{r.author.fullName}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-[var(--ink-muted)]">{STATUS_LABEL[r.status] ?? r.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="paper-card p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-[var(--ink)]">
              <CalendarDays size={15} /> Bu kitapla ilgili etkinlikler
            </h3>
            {book.events.length === 0 ? (
              <p className="text-xs text-[var(--ink-muted)]">Şu an planlanan etkinlik yok.</p>
            ) : (
              <div className="space-y-2.5">
                {book.events.slice(0, 5).map((e) => (
                  <Link key={e.id} href={`/etkinlikler/${e.slug}`} className="block rounded-lg px-2 py-1.5 hover:bg-[var(--paper-sunken)]">
                    <p className="text-xs font-semibold text-[var(--ink)]">{e.title}</p>
                    <p className="flex items-center gap-1 text-[11px] text-[var(--ink-muted)]">
                      <Users size={10} /> {formatEventDate(e.startsAt)}
                    </p>
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
