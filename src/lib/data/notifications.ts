import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUser } from "./auth";
import { getBookMatches } from "./matches";
import { fetchAuthorsByIds } from "./mappers";

export type NotificationKind = "follow" | "club_event" | "match" | "followed_post";

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  href: string;
  text: string;
  createdAt: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  avatarName?: string;
}

const PER_SOURCE_LIMIT = 8;
const TOTAL_LIMIT = 15;

/**
 * Bildirimler kalıcı bir tabloda tutulmuyor — dört mevcut kaynaktan (takip,
 * kulüp etkinlik duyuruları, eşleşmeler, takip edilenlerin gönderileri)
 * anlık olarak toplanıp tarihe göre sıralanır. "Okundu" durumu istemci
 * tarafında (localStorage, bkz. NotificationBell) tutulur — bu yüzden yeni
 * bir migration/tablo gerekmedi.
 */
export async function getNotificationItems(): Promise<NotificationItem[]> {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  if (!supabase) return [];
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const [{ data: followerRows }, { data: myClubRows }, { data: followingRows }, matches] = await Promise.all([
    supabase
      .from("follows")
      .select("follower_id, created_at")
      .eq("following_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(PER_SOURCE_LIMIT),
    supabase.from("club_members").select("club_id").eq("user_id", currentUser.id),
    supabase.from("follows").select("following_id").eq("follower_id", currentUser.id),
    getBookMatches(),
  ]);

  const myClubIds = (myClubRows ?? []).map((r) => r.club_id);
  const followingIds = (followingRows ?? []).map((r) => r.following_id);
  const followerIds = (followerRows ?? []).map((r) => r.follower_id);

  const [{ data: clubEventPosts }, { data: followedPosts }, authorMap] = await Promise.all([
    myClubIds.length
      ? supabase
          .from("posts")
          .select("id, club_id, event_id, created_at")
          .eq("type", "etkinlik")
          .in("club_id", myClubIds)
          .order("created_at", { ascending: false })
          .limit(PER_SOURCE_LIMIT)
      : Promise.resolve({ data: [] as { id: string; club_id: string | null; event_id: string | null; created_at: string }[] }),
    followingIds.length
      ? supabase
          .from("posts")
          .select("id, author_id, type, body, created_at")
          .in("author_id", followingIds)
          .in("type", ["text", "quote", "photo", "question", "takas", "takas_arama"])
          .order("created_at", { ascending: false })
          .limit(PER_SOURCE_LIMIT)
      : Promise.resolve({ data: [] as { id: string; author_id: string; type: string; body: string | null; created_at: string }[] }),
    fetchAuthorsByIds(supabase, [...followerIds, ...followingIds]),
  ]);

  const eventIds = (clubEventPosts ?? []).map((p) => p.event_id).filter((id): id is string => Boolean(id));
  const clubIds = (clubEventPosts ?? []).map((p) => p.club_id).filter((id): id is string => Boolean(id));
  const [{ data: eventRows }, { data: clubRows }] = await Promise.all([
    eventIds.length ? supabase.from("events").select("id, slug, title").in("id", eventIds) : Promise.resolve({ data: [] as { id: string; slug: string; title: string }[] }),
    clubIds.length ? supabase.from("clubs").select("id, name, icon").in("id", clubIds) : Promise.resolve({ data: [] as { id: string; name: string; icon: string }[] }),
  ]);
  const eventMap = new Map((eventRows ?? []).map((e) => [e.id, e]));
  const clubMap = new Map((clubRows ?? []).map((c) => [c.id, c]));

  const items: NotificationItem[] = [];

  (followerRows ?? []).forEach((row) => {
    const author = authorMap.get(row.follower_id);
    if (!author) return;
    items.push({
      id: `follow-${row.follower_id}`,
      kind: "follow",
      href: `/profil/${author.username}`,
      text: `${author.fullName} seni takip etmeye başladı`,
      createdAt: row.created_at,
      avatarUrl: author.avatarUrl,
      avatarColor: author.avatarColor,
      avatarName: author.fullName,
    });
  });

  (clubEventPosts ?? []).forEach((p) => {
    const event = p.event_id ? eventMap.get(p.event_id) : null;
    const club = p.club_id ? clubMap.get(p.club_id) : null;
    if (!event || !club) return;
    items.push({
      id: `club-event-${p.id}`,
      kind: "club_event",
      href: `/etkinlikler/${event.slug}`,
      text: `${club.icon} ${club.name}: ${event.title}`,
      createdAt: p.created_at,
    });
  });

  (followedPosts ?? []).forEach((p) => {
    const author = authorMap.get(p.author_id);
    if (!author) return;
    items.push({
      id: `followed-post-${p.id}`,
      kind: "followed_post",
      href: "/",
      text: `${author.fullName} yeni bir paylaşım yaptı`,
      createdAt: p.created_at,
      avatarUrl: author.avatarUrl,
      avatarColor: author.avatarColor,
      avatarName: author.fullName,
    });
  });

  if (matches.length > 0) {
    items.push({
      id: "matches-summary",
      kind: "match",
      href: "/eslesmeler",
      text: `${matches.length} eşleşmen var — ortak kitap, tür, kulüp ya da etkinlikleriniz var`,
      createdAt: new Date().toISOString(),
    });
  }

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, TOTAL_LIMIT);
}
