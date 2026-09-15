import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { BLOG_POSTS, DEMO_USER, getBlogPostBySlug as getFixtureBlogPostBySlug } from "@/lib/fixtures";
import type { BlogPostDetail, BlogPostSummary } from "@/lib/types";
import { fetchAuthorsByIds } from "./mappers";

function estimateReadMinutes(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  if (!hasSupabaseEnv()) return BLOG_POSTS;
  const supabase = await createClient();
  if (!supabase) return BLOG_POSTS;

  const { data: rows } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (!rows) return [];

  const authorMap = await fetchAuthorsByIds(supabase, rows.map((r) => r.author_id));

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    color: r.color,
    tags: r.tags,
    author: authorMap.get(r.author_id) ?? DEMO_USER,
    publishedAt: r.published_at,
    readMinutes: estimateReadMinutes(r.body),
  }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostDetail | null> {
  if (!hasSupabaseEnv()) return getFixtureBlogPostBySlug(slug);
  const supabase = await createClient();
  if (!supabase) return getFixtureBlogPostBySlug(slug);

  const { data: row } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (!row) return null;

  const authorMap = await fetchAuthorsByIds(supabase, [row.author_id]);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    color: row.color,
    tags: row.tags,
    author: authorMap.get(row.author_id) ?? DEMO_USER,
    publishedAt: row.published_at,
    readMinutes: estimateReadMinutes(row.body),
    body: row.body,
  };
}
