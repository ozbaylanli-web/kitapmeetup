import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { COMMENTS, DEMO_USER, POSTS } from "@/lib/fixtures";
import type { CommentItem, FeedItem, FeedPost, PostType } from "@/lib/types";
import { fetchAuthorsByIds, fetchBooksByIds, mapComment } from "./mappers";
import { getCurrentUser } from "./auth";
import { getBlogPosts } from "./blog";

/** "Kitap Takası"nın iki yönü de — elimde var (takas) ve arıyorum (takas_arama) — aynı teklif/yanıt mekanizmasını paylaşır. */
function isSwapType(type: PostType): boolean {
  return type === "takas" || type === "takas_arama";
}

export async function getFeedPosts(opts?: { clubId?: string; bookIds?: string[] }): Promise<FeedPost[]> {
  if (!hasSupabaseEnv()) {
    let posts = opts?.clubId ? POSTS.filter((p) => p.club?.id === opts.clubId) : POSTS;
    if (opts?.bookIds?.length) {
      const ids = new Set(opts.bookIds);
      posts = posts.filter((p) => (p.book && ids.has(p.book.id)) || (p.counterBook && ids.has(p.counterBook.id)));
    }
    return posts;
  }

  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
  if (opts?.clubId) query = query.eq("club_id", opts.clubId);
  if (opts?.bookIds?.length) {
    const orClause = opts.bookIds.flatMap((id) => [`book_id.eq.${id}`, `counter_book_id.eq.${id}`]).join(",");
    query = query.or(orClause);
  }
  const { data: postRows } = await query;
  if (!postRows || postRows.length === 0) return [];

  const clubIds = Array.from(new Set(postRows.map((p) => p.club_id).filter((id): id is string => Boolean(id))));
  const eventIds = Array.from(new Set(postRows.map((p) => p.event_id).filter((id): id is string => Boolean(id))));
  const postIds = postRows.map((p) => p.id);
  const swapPostIds = postRows.filter((p) => isSwapType(p.type)).map((p) => p.id);

  // Aşağıdaki 8 sorgu birbirinden bağımsız (hepsi sadece `postRows`tan türetiliyor)
  // — teker teker beklemek yerine tek seferde paralel çekiyoruz.
  const [authorMap, bookMap, { data: clubRows }, { data: eventRows }, { data: likeRows }, currentUser, { data: commentRows }, { data: offerRows }] =
    await Promise.all([
      fetchAuthorsByIds(supabase, postRows.map((p) => p.author_id)),
      fetchBooksByIds(
        supabase,
        postRows.flatMap((p) => [p.book_id, p.counter_book_id]).filter((id): id is string => Boolean(id))
      ),
      clubIds.length
        ? supabase.from("clubs").select("*").in("id", clubIds)
        : Promise.resolve({ data: [] as { id: string; slug: string; name: string; icon: string; color: string; description: string }[] }),
      eventIds.length
        ? supabase.from("events").select("id, slug, title, starts_at").in("id", eventIds)
        : Promise.resolve({ data: [] as { id: string; slug: string; title: string; starts_at: string }[] }),
      supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds),
      getCurrentUser(),
      supabase.from("comments").select("target_id").eq("target_type", "post").in("target_id", postIds),
      swapPostIds.length
        ? supabase.from("swap_offers").select("post_id, offerer_id, status").in("post_id", swapPostIds)
        : Promise.resolve({ data: [] as { post_id: string; offerer_id: string; status: string }[] }),
    ]);

  const clubMap = new Map(
    (clubRows ?? []).map((c) => [c.id, { id: c.id, slug: c.slug, name: c.name, icon: c.icon, color: c.color, description: c.description, memberCount: 0 }])
  );
  const eventMap = new Map((eventRows ?? []).map((e) => [e.id, { slug: e.slug, title: e.title, startsAt: e.starts_at }]));

  const likeCounts = new Map<string, number>();
  const myLikes = new Set<string>();
  (likeRows ?? []).forEach((l) => {
    likeCounts.set(l.post_id, (likeCounts.get(l.post_id) ?? 0) + 1);
    if (currentUser && l.user_id === currentUser.id) myLikes.add(l.post_id);
  });

  const commentCounts = new Map<string, number>();
  (commentRows ?? []).forEach((c) => commentCounts.set(c.target_id, (commentCounts.get(c.target_id) ?? 0) + 1));

  const offerCounts = new Map<string, number>();
  const myOfferStatus = new Map<string, string>();
  (offerRows ?? []).forEach((o) => {
    offerCounts.set(o.post_id, (offerCounts.get(o.post_id) ?? 0) + 1);
    if (currentUser && o.offerer_id === currentUser.id) myOfferStatus.set(o.post_id, o.status);
  });

  return postRows.map((p) => ({
    id: p.id,
    type: p.type,
    body: p.body,
    createdAt: p.created_at,
    author: authorMap.get(p.author_id) ?? DEMO_USER,
    club: p.club_id ? clubMap.get(p.club_id) ?? null : null,
    book: p.book_id ? bookMap.get(p.book_id) ?? null : null,
    counterBook: p.counter_book_id ? bookMap.get(p.counter_book_id) ?? null : null,
    imageUrl: p.image_url,
    likeCount: likeCounts.get(p.id) ?? 0,
    commentCount: commentCounts.get(p.id) ?? 0,
    likedByMe: myLikes.has(p.id),
    offerCount: isSwapType(p.type) ? offerCounts.get(p.id) ?? 0 : undefined,
    myOfferStatus: isSwapType(p.type) ? (myOfferStatus.get(p.id) as FeedPost["myOfferStatus"]) ?? null : undefined,
    event: p.event_id ? eventMap.get(p.event_id) ?? null : null,
  }));
}

/** Tek bir gönderi — takas ilanı detay sayfası (`/takas/[postId]`) için. */
export async function getPostById(postId: string): Promise<FeedPost | null> {
  if (!hasSupabaseEnv()) return POSTS.find((p) => p.id === postId) ?? null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: p } = await supabase.from("posts").select("*").eq("id", postId).maybeSingle();
  if (!p) return null;

  const currentUser = await getCurrentUser();
  const bookIds = [p.book_id, p.counter_book_id].filter((id): id is string => Boolean(id));
  const [authorMap, bookMap] = await Promise.all([
    fetchAuthorsByIds(supabase, [p.author_id]),
    bookIds.length ? fetchBooksByIds(supabase, bookIds) : Promise.resolve(new Map()),
  ]);
  const club = p.club_id ? (await supabase.from("clubs").select("*").eq("id", p.club_id).maybeSingle()).data : null;
  const event = p.event_id
    ? (await supabase.from("events").select("slug, title, starts_at").eq("id", p.event_id).maybeSingle()).data
    : null;

  const { count: likeCount } = await supabase.from("post_likes").select("user_id", { count: "exact", head: true }).eq("post_id", p.id);
  const likedByMe = Boolean(
    currentUser && (await supabase.from("post_likes").select("user_id").eq("post_id", p.id).eq("user_id", currentUser.id).maybeSingle()).data
  );
  const { count: commentCount } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("target_type", "post")
    .eq("target_id", p.id);

  let offerCount: number | undefined;
  let myOfferStatus: FeedPost["myOfferStatus"];
  if (isSwapType(p.type)) {
    const { data: offerRows } = await supabase.from("swap_offers").select("offerer_id, status").eq("post_id", p.id);
    offerCount = offerRows?.length ?? 0;
    myOfferStatus = currentUser ? ((offerRows ?? []).find((o) => o.offerer_id === currentUser.id)?.status as FeedPost["myOfferStatus"]) ?? null : null;
  }

  return {
    id: p.id,
    type: p.type,
    body: p.body,
    createdAt: p.created_at,
    author: authorMap.get(p.author_id) ?? DEMO_USER,
    club: club ? { id: club.id, slug: club.slug, name: club.name, icon: club.icon, color: club.color, description: club.description, memberCount: 0 } : null,
    book: p.book_id ? bookMap.get(p.book_id) ?? null : null,
    counterBook: p.counter_book_id ? bookMap.get(p.counter_book_id) ?? null : null,
    imageUrl: p.image_url,
    likeCount: likeCount ?? 0,
    commentCount: commentCount ?? 0,
    likedByMe,
    offerCount,
    myOfferStatus,
    event: event ? { slug: event.slug, title: event.title, startsAt: event.starts_at } : null,
  };
}

export async function getPostComments(postId: string): Promise<CommentItem[]> {
  if (!hasSupabaseEnv()) return COMMENTS[postId] ?? [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase
    .from("comments")
    .select("*")
    .eq("target_type", "post")
    .eq("target_id", postId)
    .order("created_at", { ascending: true });
  if (!rows) return [];

  const authorMap = await fetchAuthorsByIds(supabase, rows.map((r) => r.author_id));
  return rows.map((r) => mapComment(r, authorMap.get(r.author_id) ?? DEMO_USER));
}

/**
 * Ana Akış için: kısa gönderiler + blog yazıları, tek kronolojik listede.
 * Ayrı bir "Blog" sekmesi yerine, uzun yazılar akışın doğal bir parçası olur.
 */
export async function getHomeFeed(): Promise<FeedItem[]> {
  const [posts, blogPosts] = await Promise.all([getFeedPosts(), getBlogPosts()]);

  const items: FeedItem[] = [
    ...posts.map((post): FeedItem => ({ kind: "post", sortAt: post.createdAt, post })),
    ...blogPosts.map((blogPost): FeedItem => ({ kind: "blog", sortAt: blogPost.publishedAt, blogPost })),
  ];

  items.sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime());
  return items;
}
