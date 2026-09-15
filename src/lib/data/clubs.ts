import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { CLUBS, DEMO_USER, getClubBySlug as getFixtureClubBySlug } from "@/lib/fixtures";
import type { ClubDetail, ClubSummary, ReadThreadSummary } from "@/lib/types";
import type { ClubRole } from "@/lib/supabase/types";
import { fetchAuthorsByIds, fetchBooksByIds, mapAuthor, mapBook } from "./mappers";
import { getCurrentUser } from "./auth";

export async function getClubs(): Promise<ClubSummary[]> {
  if (!hasSupabaseEnv()) return CLUBS;
  const supabase = await createClient();
  if (!supabase) return CLUBS;

  const { data: clubs } = await supabase.from("clubs").select("*").order("created_at", { ascending: true });
  if (!clubs) return [];

  const { data: members } = await supabase.from("club_members").select("club_id");
  const counts = new Map<string, number>();
  (members ?? []).forEach((m) => counts.set(m.club_id, (counts.get(m.club_id) ?? 0) + 1));

  return clubs.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    icon: c.icon,
    color: c.color,
    description: c.description,
    memberCount: counts.get(c.id) ?? 0,
  }));
}

export async function getClubBySlug(slug: string): Promise<ClubDetail | null> {
  if (!hasSupabaseEnv()) return getFixtureClubBySlug(slug);
  const supabase = await createClient();
  if (!supabase) return getFixtureClubBySlug(slug);

  const { data: club } = await supabase.from("clubs").select("*").eq("slug", slug).maybeSingle();
  if (!club) return null;

  const { data: memberRows } = await supabase.from("club_members").select("user_id").eq("club_id", club.id);
  const memberIds = (memberRows ?? []).map((m) => m.user_id);
  const authorMap = await fetchAuthorsByIds(supabase, memberIds);

  const { data: shelfRows } = memberIds.length
    ? await supabase
        .from("shelf_entries")
        .select("book_id")
        .in("user_id", memberIds)
        .eq("status", "reading")
        .limit(6)
    : { data: [] as { book_id: string }[] };
  const bookMap = await fetchBooksByIds(supabase, (shelfRows ?? []).map((s) => s.book_id));

  let createdBy = DEMO_USER;
  if (club.created_by) {
    const { data: creatorRow } = await supabase.from("profiles").select("*").eq("id", club.created_by).maybeSingle();
    if (creatorRow) createdBy = mapAuthor(creatorRow);
  }

  let pinnedBook = null;
  if (club.current_book_id) {
    const { data: bookRow } = await supabase.from("books").select("*").eq("id", club.current_book_id).maybeSingle();
    if (bookRow) pinnedBook = mapBook(bookRow);
  }

  let homeVenue = null;
  if (club.home_venue_id) {
    const { data: venueRow } = await supabase.from("venues").select("*").eq("id", club.home_venue_id).maybeSingle();
    if (venueRow) {
      homeVenue = {
        id: venueRow.id,
        slug: venueRow.slug,
        name: venueRow.name,
        district: venueRow.district,
        kind: venueRow.kind,
        description: venueRow.description,
        mapsUrl: venueRow.maps_url,
        avgRating: null,
        noteCount: 0,
        activeCheckinCount: 0,
      };
    }
  }

  const { data: threadRows } = await supabase
    .from("club_read_threads")
    .select("*")
    .eq("club_id", club.id)
    .order("created_at", { ascending: false });
  const threadAuthorMap = await fetchAuthorsByIds(supabase, (threadRows ?? []).map((t) => t.created_by).filter((id): id is string => Boolean(id)));
  const threadIds = (threadRows ?? []).map((t) => t.id);
  const { data: threadCommentRows } = threadIds.length
    ? await supabase.from("comments").select("target_id").eq("target_type", "read_thread").in("target_id", threadIds)
    : { data: [] as { target_id: string }[] };
  const commentCounts = new Map<string, number>();
  (threadCommentRows ?? []).forEach((c) => commentCounts.set(c.target_id, (commentCounts.get(c.target_id) ?? 0) + 1));

  const readThreads: ReadThreadSummary[] = (threadRows ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    createdAt: t.created_at,
    createdBy: (t.created_by && threadAuthorMap.get(t.created_by)) || DEMO_USER,
    commentCount: commentCounts.get(t.id) ?? 0,
  }));

  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    icon: club.icon,
    color: club.color,
    description: club.description,
    memberCount: memberIds.length,
    members: Array.from(authorMap.values()),
    currentBooks: Array.from(bookMap.values()),
    createdBy,
    pinnedBook,
    pinnedBookNote: club.current_book_note,
    pinnedBookSetAt: club.current_book_set_at,
    readThreads,
    homeVenue,
  };
}

/** Giriş yapan kullanıcının bu kulüpteki rolü (yoksa null) — "şu an okunan kitabı" değiştirme yetkisi bunun için kontrol edilir. */
export async function getMyClubRole(clubId: string): Promise<ClubRole | null> {
  if (!hasSupabaseEnv()) return "owner"; // önizleme modunda demo kullanıcı her kulübün "yöneticisi" gibi davranır
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;
  const { data } = await supabase
    .from("club_members")
    .select("role")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();
  return data?.role ?? null;
}

export async function isClubMember(clubId: string): Promise<boolean> {
  if (!hasSupabaseEnv()) return true; // demo modunda "üye gibi" davran
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return false;
  const { data } = await supabase
    .from("club_members")
    .select("user_id")
    .eq("club_id", clubId)
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data);
}
