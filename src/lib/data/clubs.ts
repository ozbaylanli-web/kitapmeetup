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

  // clubs ve club_members birbirine bağımlı değil — paralel çekiyoruz.
  const [{ data: clubs }, { data: members }] = await Promise.all([
    supabase.from("clubs").select("*").order("created_at", { ascending: true }),
    supabase.from("club_members").select("club_id"),
  ]);
  if (!clubs) return [];

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

  // Aşağıdaki 5 sorgu birbirinden bağımsız (hepsi sadece `club` satırına
  // ihtiyaç duyuyor) — teker teker beklemek yerine paralel çekiyoruz.
  const [{ data: memberRows }, { data: threadRows }, creatorRow, bookRowForPin, venueRowForHome] = await Promise.all([
    supabase.from("club_members").select("user_id").eq("club_id", club.id),
    supabase.from("club_read_threads").select("*").eq("club_id", club.id).order("created_at", { ascending: false }),
    club.created_by ? supabase.from("profiles").select("*").eq("id", club.created_by).maybeSingle().then((r) => r.data) : Promise.resolve(null),
    club.current_book_id ? supabase.from("books").select("*").eq("id", club.current_book_id).maybeSingle().then((r) => r.data) : Promise.resolve(null),
    club.home_venue_id ? supabase.from("venues").select("*").eq("id", club.home_venue_id).maybeSingle().then((r) => r.data) : Promise.resolve(null),
  ]);

  const memberIds = (memberRows ?? []).map((m) => m.user_id);
  const threadIds = (threadRows ?? []).map((t) => t.id);

  // Bu ikinci dalga da kendi içinde bağımsız — memberIds/threadIds hazır
  // olduğu an hepsi birden gidiyor.
  const [authorMap, shelfRowsResult, threadAuthorMap, { data: threadCommentRows }] = await Promise.all([
    fetchAuthorsByIds(supabase, memberIds),
    memberIds.length
      ? supabase.from("shelf_entries").select("book_id").in("user_id", memberIds).eq("status", "reading").limit(6)
      : Promise.resolve({ data: [] as { book_id: string }[] }),
    fetchAuthorsByIds(supabase, (threadRows ?? []).map((t) => t.created_by).filter((id): id is string => Boolean(id))),
    threadIds.length
      ? supabase.from("comments").select("target_id").eq("target_type", "read_thread").in("target_id", threadIds)
      : Promise.resolve({ data: [] as { target_id: string }[] }),
  ]);
  const shelfRows = shelfRowsResult.data;
  const bookMap = await fetchBooksByIds(supabase, (shelfRows ?? []).map((s) => s.book_id));

  const createdBy = creatorRow ? mapAuthor(creatorRow) : DEMO_USER;
  const pinnedBook = bookRowForPin ? mapBook(bookRowForPin) : null;
  const homeVenue = venueRowForHome
    ? {
        id: venueRowForHome.id,
        slug: venueRowForHome.slug,
        name: venueRowForHome.name,
        district: venueRowForHome.district,
        kind: venueRowForHome.kind,
        description: venueRowForHome.description,
        mapsUrl: venueRowForHome.maps_url,
        avgRating: null,
        noteCount: 0,
        activeCheckinCount: 0,
      }
    : null;

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
