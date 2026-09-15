import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import {
  BLOG_POSTS,
  CLUBS,
  EVENTS,
  POSTS,
  REFERRAL_COUNTS,
  SHELVES,
  getAuthorByUsername,
} from "@/lib/fixtures";
import type { ProfileDetail } from "@/lib/types";
import type { Database } from "@/lib/supabase/types";
import { fetchBooksByIds, mapAuthor } from "./mappers";
import { getCurrentUser } from "./auth";

/** Giriş yapan kullanıcı bu profili takip ediyor mu? Önizleme modunda hep false (gerçek takip verisi yok). */
export async function isFollowing(targetId: string): Promise<boolean> {
  if (!hasSupabaseEnv()) return false;

  const supabase = await createClient();
  const currentUser = await getCurrentUser();
  if (!supabase || !currentUser || currentUser.id === targetId) return false;

  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", currentUser.id)
    .eq("following_id", targetId)
    .maybeSingle();
  return Boolean(data);
}

export async function getProfileByUsername(username: string): Promise<ProfileDetail | null> {
  if (!hasSupabaseEnv()) {
    const authorFixture = getAuthorByUsername(username);
    if (!authorFixture) return null;
    return {
      author: authorFixture,
      shelf: SHELVES[authorFixture.username] ?? [],
      posts: POSTS.filter((p) => p.author.username === authorFixture.username),
      blogPosts: BLOG_POSTS.filter((b) => b.author.username === authorFixture.username),
      clubs: CLUBS.filter((c) => c.members.some((m) => m.username === authorFixture.username)),
      events: EVENTS.filter((e) => e.createdBy.username === authorFixture.username),
      followerCount: 12,
      followingCount: 9,
      referralCount: REFERRAL_COUNTS[authorFixture.username] ?? 0,
    };
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: profileRow } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  if (!profileRow) return null;
  const author = mapAuthor(profileRow);

  const { data: shelfRows } = await supabase
    .from("shelf_entries")
    .select("*")
    .eq("user_id", author.id)
    .order("created_at", { ascending: false });
  const bookMap = await fetchBooksByIds(supabase, (shelfRows ?? []).map((s) => s.book_id));
  const shelf = (shelfRows ?? [])
    .map((s) => {
      const book = bookMap.get(s.book_id);
      if (!book) return null;
      return { id: s.id, status: s.status, rating: s.rating, note: s.note, book };
    })
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const { data: postRows } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", author.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const postBookMap = await fetchBooksByIds(supabase, (postRows ?? []).map((p) => p.book_id).filter((id): id is string => Boolean(id)));
  const posts = (postRows ?? []).map((p) => ({
    id: p.id,
    type: p.type,
    body: p.body,
    createdAt: p.created_at,
    author,
    club: null,
    book: p.book_id ? postBookMap.get(p.book_id) ?? null : null,
    imageUrl: p.image_url,
    likeCount: 0,
    commentCount: 0,
    likedByMe: false,
  }));

  const { data: blogRows } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("author_id", author.id)
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  const blogPosts = (blogRows ?? []).map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    summary: b.summary,
    color: b.color,
    tags: b.tags,
    author,
    publishedAt: b.published_at,
    readMinutes: Math.max(1, Math.round(b.body.trim().split(/\s+/).filter(Boolean).length / 180)),
  }));

  const { data: membershipRows } = await supabase.from("club_members").select("club_id").eq("user_id", author.id);
  const clubIds = (membershipRows ?? []).map((m) => m.club_id);
  const { data: clubRows } = clubIds.length
    ? await supabase.from("clubs").select("*").in("id", clubIds)
    : { data: [] as Database["public"]["Tables"]["clubs"]["Row"][] };
  const clubs = (clubRows ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    color: c.color,
    description: c.description,
    memberCount: 0,
  }));

  const { data: eventRows } = await supabase.from("events").select("*").eq("created_by", author.id);
  const events = (eventRows ?? []).map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    club: null,
    locationName: e.location_name,
    locationUrl: e.location_url,
    isOnline: e.is_online,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    capacity: e.capacity,
    goingCount: 0,
    interestedCount: 0,
    createdBy: author,
  }));

  const { count: followerCount } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("following_id", author.id);
  const { count: followingCount } = await supabase
    .from("follows")
    .select("following_id", { count: "exact", head: true })
    .eq("follower_id", author.id);

  const { count: referralCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", author.id);

  return {
    author,
    shelf,
    posts,
    blogPosts,
    clubs,
    events,
    followerCount: followerCount ?? 0,
    followingCount: followingCount ?? 0,
    referralCount: referralCount ?? 0,
  };
}
