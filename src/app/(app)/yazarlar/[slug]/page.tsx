import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarDays, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { PostCard } from "@/components/feed/PostCard";
import { getAuthorPage } from "@/lib/data/books";
import { getCurrentUser } from "@/lib/data/auth";
import { formatEventDate } from "@/lib/utils";

export default async function AuthorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [author, currentUser] = await Promise.all([getAuthorPage(slug), getCurrentUser()]);
  if (!author) notFound();

  return (
    <div>
      <PageHeader eyebrow="Yazar" title={author.name} description={`${author.books.length} kitap · Kitapmeetup topluluğundaki iz.`} />

      <section className="mb-6">
        <h2 className="mb-3 flex items-center gap-1.5 font-serif text-lg font-semibold text-[var(--ink)]">
          <BookOpen size={16} /> Kitapları
        </h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {author.books.map((b) => (
            <Link key={b.id} href={`/kitaplar/${b.id}`} className="paper-card flex items-center gap-3 p-3 transition-transform hover:-translate-y-0.5">
              <span className="h-9 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: b.spineColor }} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--ink)]">{b.title}</p>
                {b.genre && <p className="truncate text-xs text-[var(--ink-muted)]">{b.genre}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {author.events.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-1.5 font-serif text-lg font-semibold text-[var(--ink)]">
            <CalendarDays size={16} /> Bu yazarla ilgili etkinlikler
          </h2>
          <div className="space-y-2.5">
            {author.events.slice(0, 6).map((e) => (
              <Link key={e.id} href={`/etkinlikler/${e.slug}`} className="paper-card block p-3.5 transition-transform hover:-translate-y-0.5">
                <p className="text-sm font-semibold text-[var(--ink)]">{e.title}</p>
                <p className="text-xs text-[var(--ink-muted)]">{formatEventDate(e.startsAt)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Paylaşımlar</h2>
        {author.posts.length === 0 ? (
          <EmptyState emoji="🕊️" title="Henüz paylaşım yok" description="Bu yazarın kitaplarıyla ilgili ilk paylaşımı sen yap." />
        ) : (
          <div className="space-y-3">
            {author.posts.map((p) => (
              <PostCard key={p.id} post={p} isAdmin={currentUser?.isAdmin ?? false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
