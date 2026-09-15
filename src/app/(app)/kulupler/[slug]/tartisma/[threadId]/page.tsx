import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ThreadCommentForm } from "@/components/clubs/ThreadCommentForm";
import { getReadThread, getThreadComments } from "@/lib/data/clubReads";
import { getCurrentUser } from "@/lib/data/auth";
import { timeAgo } from "@/lib/utils";

export default async function ReadThreadPage({ params }: { params: Promise<{ slug: string; threadId: string }> }) {
  const { slug, threadId } = await params;
  const thread = await getReadThread(threadId);
  if (!thread || thread.club.slug !== slug) notFound();

  const [comments, currentUser] = await Promise.all([getThreadComments(threadId), getCurrentUser()]);

  return (
    <div>
      <Link href={`/kulupler/${slug}`} className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
        <ChevronLeft size={16} /> {thread.club.icon} {thread.club.name}
      </Link>

      <div className="paper-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--orange-600)]">Bölüm Tartışması</p>
        <h1 className="mt-1 font-serif text-xl font-semibold text-[var(--ink)] sm:text-2xl">{thread.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
          <Avatar name={thread.createdBy.fullName} color={thread.createdBy.avatarColor} url={thread.createdBy.avatarUrl} size={18} />
          {thread.createdBy.fullName} açtı · {timeAgo(thread.createdAt)}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {comments.length === 0 && (
          <p className="paper-card p-4 text-center text-sm text-[var(--ink-muted)]">Henüz yorum yok — ilk düşünceyi sen paylaş.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5">
            <Avatar name={c.author.fullName} color={c.author.avatarColor} url={c.author.avatarUrl} size={30} />
            <div className="min-w-0 flex-1 rounded-xl bg-[var(--paper-sunken)] px-3.5 py-2.5">
              <p className="text-xs font-semibold text-[var(--ink)]">
                {c.author.fullName} <span className="ml-1 font-normal text-[var(--ink-muted)]">{timeAgo(c.createdAt)}</span>
              </p>
              <p className="text-sm text-[var(--ink-soft)]">{c.body}</p>
            </div>
          </div>
        ))}
      </div>

      {currentUser && (
        <div className="mt-4">
          <ThreadCommentForm threadId={threadId} />
        </div>
      )}
    </div>
  );
}
