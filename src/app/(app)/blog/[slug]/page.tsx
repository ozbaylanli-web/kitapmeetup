import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Pill } from "@/components/ui/Pill";
import { ShareButton } from "@/components/ui/ShareButton";
import { getBlogPostBySlug } from "@/lib/data/blog";
import { formatShortDate } from "@/lib/utils";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <div>
      <Link href="/blog" className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
        <ChevronLeft size={16} /> Tüm yazılar
      </Link>

      <article className="paper-card p-5 sm:p-8">
        <div className="h-2 w-full rounded-full" style={{ background: `linear-gradient(90deg, ${post.color}, var(--orange-500))` }} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Pill key={tag}>{tag}</Pill>
            ))}
          </div>
          <ShareButton title={post.title} text={post.summary ?? undefined} />
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-tight text-[var(--ink)] sm:text-3xl">{post.title}</h1>

        <Link href={`/profil/${post.author.username}`} className="mt-4 flex items-center gap-2.5 text-sm">
          <Avatar name={post.author.fullName} color={post.author.avatarColor} url={post.author.avatarUrl} size={32} />
          <div>
            <p className="font-semibold text-[var(--ink)]">{post.author.fullName}</p>
            <p className="text-xs text-[var(--ink-muted)]">
              {formatShortDate(post.publishedAt)} · {post.readMinutes} dk okuma
            </p>
          </div>
        </Link>

        <div className="prose-academy mt-6 text-[15px] leading-relaxed text-[var(--ink)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
