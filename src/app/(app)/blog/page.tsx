import Link from "next/link";
import { PenSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogCard } from "@/components/blog/BlogCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonVariants } from "@/components/ui/Button";
import { getBlogPosts } from "@/lib/data/blog";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div>
      <PageHeader
        eyebrow="Yazılar"
        title="Blog"
        description="Kitaplar, okuma alışkanlıkları ve topluluğun aklından geçenler üzerine uzun yazılar. Bu yazılar Ana Akış'ta da görünür — burası hepsinin arşivi."
        actions={
          <Link href="/blog/yeni" className={buttonVariants("primary", "sm")}>
            <PenSquare size={14} /> Yazı yaz
          </Link>
        }
      />
      {posts.length === 0 ? (
        <EmptyState emoji="🖋️" title="Henüz yazı yok" description="İlk yazıyı sen paylaş." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
