import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { AUTHORS, CLUBS, EVENTS, EVENT_ATTENDEES, SHELVES } from "@/lib/fixtures";
import type { AuthorSummary, BookMatch, ClubSummary, SharedEvent, ShelfStatus } from "@/lib/types";
import { fetchAuthorsByIds, fetchBooksByIds } from "./mappers";
import { getCurrentUser } from "./auth";

const COUNTABLE_STATUSES: ShelfStatus[] = ["reading", "read"];
const RSVP_STATUSES = ["going", "interested"] as const;

/** Eşleşmeler ne kadar "güçlü" sıralansın — kitap en güçlü sinyal, tür en zayıfı. */
function matchScore(m: BookMatch): number {
  return m.sharedBooks.length * 4 + m.sharedEvents.length * 2.5 + m.sharedClubs.length * 1.5 + m.sharedGenres.length;
}

/** Sayfanın kalabalıklaşmaması için (ör. yüzlerce üyeli bir kulüp) en güçlü eşleşmeleri üstte tutup kırpar. */
const MATCH_LIMIT = 40;

function emptyMatch(user: AuthorSummary): BookMatch {
  return { user, sharedBooks: [], sharedGenres: [], sharedClubs: [], sharedEvents: [], upcomingEventTogether: null };
}

/**
 * İki kullanıcı arasında eşleşme kurar — dört bağımsız sinyalden biri bile
 * yeterlidir: aynı kitabı okumak, aynı TÜRDEN kitap okumak, aynı kulübe
 * kayıtlı olmak, ya da aynı etkinliğe katılmak (gidiyorum/ilgileniyorum).
 */
export async function getBookMatches(): Promise<BookMatch[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  if (!hasSupabaseEnv()) {
    return computeFixtureMatches(currentUser.username);
  }

  const supabase = await createClient();
  if (!supabase) return [];

  // ── 1) Kitap + tür sinyali ────────────────────────────────────────────
  const { data: myShelfRows } = await supabase
    .from("shelf_entries")
    .select("book_id, status")
    .eq("user_id", currentUser.id)
    .in("status", COUNTABLE_STATUSES);
  const myBookIds = (myShelfRows ?? []).map((r) => r.book_id);
  const myStatusMap = new Map((myShelfRows ?? []).map((r) => [r.book_id, r.status]));

  const { data: otherShelfRows } = myBookIds.length
    ? await supabase.from("shelf_entries").select("user_id, book_id, status").in("status", COUNTABLE_STATUSES).neq("user_id", currentUser.id)
    : { data: [] as { user_id: string; book_id: string; status: string }[] };

  const involvedBookIds = Array.from(new Set([...myBookIds, ...(otherShelfRows ?? []).map((r) => r.book_id)]));
  const bookMap = await fetchBooksByIds(supabase, involvedBookIds);
  const myGenres = new Set(myBookIds.map((id) => bookMap.get(id)?.genre).filter((g): g is string => Boolean(g)));

  const sharedBooksByUser = new Map<string, BookMatch["sharedBooks"]>();
  const sharedGenresByUser = new Map<string, Set<string>>();
  const myBookIdSet = new Set(myBookIds);

  for (const row of otherShelfRows ?? []) {
    const book = bookMap.get(row.book_id);
    if (!book) continue;

    if (myBookIdSet.has(row.book_id)) {
      const myStatus = myStatusMap.get(row.book_id);
      if (myStatus) {
        if (!sharedBooksByUser.has(row.user_id)) sharedBooksByUser.set(row.user_id, []);
        sharedBooksByUser.get(row.user_id)!.push({ book, myStatus, theirStatus: row.status as ShelfStatus });
      }
    }

    if (book.genre && myGenres.has(book.genre)) {
      if (!sharedGenresByUser.has(row.user_id)) sharedGenresByUser.set(row.user_id, new Set());
      sharedGenresByUser.get(row.user_id)!.add(book.genre);
    }
  }

  // ── 2) Kulüp sinyali ──────────────────────────────────────────────────
  const { data: myClubRows } = await supabase.from("club_members").select("club_id").eq("user_id", currentUser.id);
  const myClubIds = (myClubRows ?? []).map((r) => r.club_id);

  const { data: otherClubRows } = myClubIds.length
    ? await supabase.from("club_members").select("club_id, user_id").in("club_id", myClubIds).neq("user_id", currentUser.id)
    : { data: [] as { club_id: string; user_id: string }[] };

  const clubIdsToFetch = Array.from(new Set((otherClubRows ?? []).map((r) => r.club_id)));
  const { data: clubRows } = clubIdsToFetch.length ? await supabase.from("clubs").select("*").in("id", clubIdsToFetch) : { data: [] };
  const clubMap = new Map(
    (clubRows ?? []).map((c) => [
      c.id,
      { id: c.id, slug: c.slug, name: c.name, icon: c.icon, color: c.color, description: c.description, memberCount: 0 } as ClubSummary,
    ])
  );

  const sharedClubsByUser = new Map<string, ClubSummary[]>();
  for (const row of otherClubRows ?? []) {
    const club = clubMap.get(row.club_id);
    if (!club) continue;
    if (!sharedClubsByUser.has(row.user_id)) sharedClubsByUser.set(row.user_id, []);
    if (!sharedClubsByUser.get(row.user_id)!.some((c) => c.id === club.id)) sharedClubsByUser.get(row.user_id)!.push(club);
  }

  // ── 3) Etkinlik sinyali (gidiyorum/ilgileniyorum) ────────────────────
  const { data: myEventRows } = await supabase
    .from("event_rsvps")
    .select("event_id")
    .eq("user_id", currentUser.id)
    .in("status", RSVP_STATUSES);
  const myEventIds = (myEventRows ?? []).map((r) => r.event_id);

  const { data: otherEventRows } = myEventIds.length
    ? await supabase
        .from("event_rsvps")
        .select("event_id, user_id")
        .in("event_id", myEventIds)
        .in("status", RSVP_STATUSES)
        .neq("user_id", currentUser.id)
    : { data: [] as { event_id: string; user_id: string }[] };

  const eventIdsToFetch = Array.from(new Set((otherEventRows ?? []).map((r) => r.event_id)));
  const { data: eventRows } = eventIdsToFetch.length ? await supabase.from("events").select("*").in("id", eventIdsToFetch) : { data: [] };
  const eventMap = new Map((eventRows ?? []).map((e) => [e.id, { slug: e.slug, title: e.title, startsAt: e.starts_at } as SharedEvent]));

  const sharedEventsByUser = new Map<string, SharedEvent[]>();
  for (const row of otherEventRows ?? []) {
    const event = eventMap.get(row.event_id);
    if (!event) continue;
    if (!sharedEventsByUser.has(row.user_id)) sharedEventsByUser.set(row.user_id, []);
    if (!sharedEventsByUser.get(row.user_id)!.some((e) => e.slug === event.slug)) sharedEventsByUser.get(row.user_id)!.push(event);
  }

  // ── Birleştir ────────────────────────────────────────────────────────
  const allOtherUserIds = new Set<string>([
    ...sharedBooksByUser.keys(),
    ...sharedGenresByUser.keys(),
    ...sharedClubsByUser.keys(),
    ...sharedEventsByUser.keys(),
  ]);
  if (allOtherUserIds.size === 0) return [];

  const authorMap = await fetchAuthorsByIds(supabase, Array.from(allOtherUserIds));
  const matchesByUser = new Map<string, BookMatch>();
  for (const userId of allOtherUserIds) {
    const author = authorMap.get(userId);
    if (!author) continue;
    const match = emptyMatch(author);
    match.sharedBooks = sharedBooksByUser.get(userId) ?? [];
    match.sharedGenres = Array.from(sharedGenresByUser.get(userId) ?? []);
    match.sharedClubs = sharedClubsByUser.get(userId) ?? [];
    match.sharedEvents = sharedEventsByUser.get(userId) ?? [];
    matchesByUser.set(userId, match);
  }

  const matches = Array.from(matchesByUser.values());
  if (matches.length === 0) return matches;

  // ── "Sen de gelsene?" — eşleştiğin kişinin gittiği, senin henüz demediğin en yakın etkinlik ──
  const { data: myGoingRows } = await supabase.from("event_rsvps").select("event_id").eq("user_id", currentUser.id).eq("status", "going");
  const myGoingEventIds = new Set((myGoingRows ?? []).map((r) => r.event_id));

  const matchUserIds = matches.map((m) => m.user.id);
  const { data: theirGoingRsvps } = await supabase
    .from("event_rsvps")
    .select("event_id, user_id")
    .eq("status", "going")
    .in("user_id", matchUserIds);

  const nudgeEventIds = Array.from(new Set((theirGoingRsvps ?? []).map((r) => r.event_id)));
  const { data: nudgeEventRows } = nudgeEventIds.length
    ? await supabase.from("events").select("*").in("id", nudgeEventIds).gte("starts_at", new Date().toISOString())
    : { data: [] };
  const nudgeEventsById = new Map((nudgeEventRows ?? []).map((e) => [e.id, e]));

  for (const match of matches) {
    const candidates = (theirGoingRsvps ?? [])
      .filter((r) => r.user_id === match.user.id)
      .map((r) => nudgeEventsById.get(r.event_id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e))
      .filter((e) => !myGoingEventIds.has(e.id) && e.created_by !== currentUser.id)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    if (candidates[0]) {
      match.upcomingEventTogether = { slug: candidates[0].slug, title: candidates[0].title, startsAt: candidates[0].starts_at };
    }
  }

  matches.sort((a, b) => matchScore(b) - matchScore(a));
  return matches.slice(0, MATCH_LIMIT);
}

/** Bu etkinliğe "gidiyorum" diyen, aynı zamanda senin eşleşmen olan kullanıcılar. */
export async function getMatchedAttendeesForEvent(eventId: string): Promise<AuthorSummary[]> {
  const matches = await getBookMatches();
  if (matches.length === 0) return [];
  const matchByUserId = new Map(matches.map((m) => [m.user.id, m.user]));

  if (!hasSupabaseEnv()) {
    const attendeeUsernames = EVENT_ATTENDEES[eventId] ?? [];
    return matches.filter((m) => attendeeUsernames.includes(m.user.username)).map((m) => m.user);
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase
    .from("event_rsvps")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("status", "going")
    .in("user_id", Array.from(matchByUserId.keys()));

  return (rows ?? [])
    .map((r) => matchByUserId.get(r.user_id))
    .filter((a): a is AuthorSummary => Boolean(a));
}

function computeFixtureMatches(username: string): BookMatch[] {
  const myShelf = SHELVES[username] ?? [];
  const myCountable = myShelf.filter((s) => COUNTABLE_STATUSES.includes(s.status));
  const myGenres = new Set(myCountable.map((s) => s.book.genre).filter((g): g is string => Boolean(g)));
  const myClubSlugs = new Set(CLUBS.filter((c) => c.members.some((m) => m.username === username)).map((c) => c.slug));
  const myEventIds = new Set(EVENTS.filter((e) => (EVENT_ATTENDEES[e.id] ?? []).includes(username)).map((e) => e.id));

  const matchesByUser = new Map<string, BookMatch>();

  for (const [otherUsername, author] of Object.entries(AUTHORS)) {
    if (otherUsername === username) continue;
    const match = emptyMatch(author);

    const theirShelf = SHELVES[otherUsername] ?? [];
    const theirCountable = theirShelf.filter((s) => COUNTABLE_STATUSES.includes(s.status));
    for (const mine of myCountable) {
      const theirs = theirCountable.find((s) => s.book.id === mine.book.id);
      if (theirs) match.sharedBooks.push({ book: mine.book, myStatus: mine.status, theirStatus: theirs.status });
    }
    const genreOverlap = new Set(
      theirCountable
        .map((s) => s.book.genre)
        .filter((g): g is string => Boolean(g))
        .filter((g) => myGenres.has(g))
    );
    match.sharedGenres = Array.from(genreOverlap);

    match.sharedClubs = CLUBS.filter((c) => myClubSlugs.has(c.slug) && c.members.some((m) => m.username === otherUsername));

    match.sharedEvents = EVENTS.filter((e) => myEventIds.has(e.id) && (EVENT_ATTENDEES[e.id] ?? []).includes(otherUsername)).map((e) => ({
      slug: e.slug,
      title: e.title,
      startsAt: e.startsAt,
    }));

    if (match.sharedBooks.length || match.sharedGenres.length || match.sharedClubs.length || match.sharedEvents.length) {
      matchesByUser.set(otherUsername, match);
    }
  }

  const matches = Array.from(matchesByUser.values());
  const now = Date.now();

  for (const match of matches) {
    const candidates = EVENTS.filter((e) => new Date(e.startsAt).getTime() >= now)
      .filter((e) => e.createdBy.username !== username)
      .filter((e) => (EVENT_ATTENDEES[e.id] ?? []).includes(match.user.username))
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

    if (candidates[0]) {
      match.upcomingEventTogether = { slug: candidates[0].slug, title: candidates[0].title, startsAt: candidates[0].startsAt };
    }
  }

  matches.sort((a, b) => matchScore(b) - matchScore(a));
  return matches.slice(0, MATCH_LIMIT);
}
