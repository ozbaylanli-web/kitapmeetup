import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { getCommunityReadingNow } from "@/lib/data/shelf";

export async function WhosReadingNow() {
  const items = await getCommunityReadingNow(12);
  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Şu an ne okunuyor</p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map(({ author, book }, i) => (
          <Link
            href={`/profil/${author.username}`}
            key={`${author.id}-${book.id}-${i}`}
            className="paper-card flex w-40 shrink-0 flex-col items-start gap-2 p-3 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <Avatar name={author.fullName} color={author.avatarColor} url={author.avatarUrl} size={24} />
              <span className="truncate text-xs font-semibold text-[var(--ink)]">{author.fullName}</span>
            </div>
            <div className="flex w-full items-center gap-2">
              <span className="h-8 w-2 shrink-0 rounded-sm" style={{ backgroundColor: book.spineColor }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[var(--ink)]">{book.title}</p>
                <p className="truncate text-[11px] text-[var(--ink-muted)]">{book.author}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
