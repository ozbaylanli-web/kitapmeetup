import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { formatShortDate } from "@/lib/utils";
import type { BlogPostSummary } from "@/lib/types";

export function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`} className="paper-card flex flex-col overflow-hidden transition-transform hover:-translate-y-0.5">
      <div className="h-2.5 w-full" style={{ background: `linear-gradient(90deg, ${post.color}, var(--orange-500))` }} />
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <Pill key={tag}>{tag}</Pill>
          ))}
        </div>
        <h3 className="font-serif text-lg font-semibold leading-snug text-[var(--ink)]">{post.title}</h3>
        {post.summary && <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">{post.summary}</p>}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-[var(--ink-muted)]">
          <Avatar name={post.author.fullName} color={post.author.avatarColor} url={post.author.avatarUrl} size={22} />
          <span className="font-medium text-[var(--ink-soft)]">{post.author.fullName}</span>
          <span>· {formatShortDate(post.publishedAt)}</span>
          <span>· {post.readMinutes} dk</span>
        </div>
      </div>
    </Link>
  );
}
