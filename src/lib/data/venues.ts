import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { VENUES, DEMO_USER, getVenueBySlug as getFixtureVenueBySlug, computeFixtureVenueOfWeek } from "@/lib/fixtures";
import type { VenueSummary, VenueDetail, VenueOfTheWeek, VenueNote, VenueCheckin } from "@/lib/types";
import { fetchAuthorsByIds } from "./mappers";
import { getCurrentUser } from "./auth";
import { getEvents } from "./events";

/** "Şu an buradayım" — bu pencere içindeki check-in'ler "aktif" sayılır. */
const ACTIVE_CHECKIN_WINDOW_MS = 4 * 60 * 60 * 1000;

export async function getVenues(): Promise<VenueSummary[]> {
  if (!hasSupabaseEnv()) return VENUES;

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase.from("venues").select("*").order("created_at", { ascending: true });
  if (!rows || rows.length === 0) return [];

  const venueIds = rows.map((v) => v.id);
  const { data: noteRows } = await supabase.from("venue_notes").select("venue_id, rating").in("venue_id", venueIds);
  const ratingSum = new Map<string, number>();
  const ratingCount = new Map<string, number>();
  const noteCount = new Map<string, number>();
  (noteRows ?? []).forEach((n) => {
    noteCount.set(n.venue_id, (noteCount.get(n.venue_id) ?? 0) + 1);
    if (n.rating) {
      ratingSum.set(n.venue_id, (ratingSum.get(n.venue_id) ?? 0) + n.rating);
      ratingCount.set(n.venue_id, (ratingCount.get(n.venue_id) ?? 0) + 1);
    }
  });

  const activeSince = new Date(Date.now() - ACTIVE_CHECKIN_WINDOW_MS).toISOString();
  const { data: checkinRows } = await supabase.from("venue_checkins").select("venue_id").in("venue_id", venueIds).gte("created_at", activeSince);
  const activeCounts = new Map<string, number>();
  (checkinRows ?? []).forEach((c) => activeCounts.set(c.venue_id, (activeCounts.get(c.venue_id) ?? 0) + 1));

  return rows.map((v) => ({
    id: v.id,
    slug: v.slug,
    name: v.name,
    district: v.district,
    kind: v.kind,
    description: v.description,
    mapsUrl: v.maps_url,
    avgRating: ratingCount.get(v.id) ? Math.round((ratingSum.get(v.id)! / ratingCount.get(v.id)!) * 10) / 10 : null,
    noteCount: noteCount.get(v.id) ?? 0,
    activeCheckinCount: activeCounts.get(v.id) ?? 0,
  }));
}

export async function getVenueBySlug(slug: string): Promise<VenueDetail | null> {
  if (!hasSupabaseEnv()) return getFixtureVenueBySlug(slug);

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: v } = await supabase.from("venues").select("*").eq("slug", slug).maybeSingle();
  if (!v) return null;

  const currentUser = await getCurrentUser();

  const { data: noteRows } = await supabase.from("venue_notes").select("*").eq("venue_id", v.id).order("created_at", { ascending: false });
  const activeSince = new Date(Date.now() - ACTIVE_CHECKIN_WINDOW_MS).toISOString();
  const { data: checkinRows } = await supabase
    .from("venue_checkins")
    .select("*")
    .eq("venue_id", v.id)
    .gte("created_at", activeSince)
    .order("created_at", { ascending: false });

  const authorIds = [
    ...(noteRows ?? []).map((n) => n.author_id),
    ...(checkinRows ?? []).map((c) => c.user_id),
    ...(v.added_by ? [v.added_by] : []),
  ];
  const authorMap = await fetchAuthorsByIds(supabase, authorIds);

  const notes: VenueNote[] = (noteRows ?? []).map((n) => ({
    id: n.id,
    author: authorMap.get(n.author_id) ?? DEMO_USER,
    rating: n.rating,
    body: n.body,
    createdAt: n.created_at,
  }));
  const ratings = notes.map((n) => n.rating).filter((r): r is number => Boolean(r));
  const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;
  const myNote = currentUser ? notes.find((n) => n.author.id === currentUser.id) ?? null : null;

  const activeCheckins: VenueCheckin[] = (checkinRows ?? []).map((c) => ({
    id: c.id,
    user: authorMap.get(c.user_id) ?? DEMO_USER,
    note: c.note,
    createdAt: c.created_at,
  }));

  const allEvents = await getEvents();
  const upcomingEvents = allEvents.filter((e) => e.venue?.id === v.id && new Date(e.startsAt).getTime() >= Date.now());

  return {
    id: v.id,
    slug: v.slug,
    name: v.name,
    district: v.district,
    kind: v.kind,
    description: v.description,
    mapsUrl: v.maps_url,
    avgRating,
    noteCount: notes.length,
    activeCheckinCount: activeCheckins.length,
    addedBy: (v.added_by && authorMap.get(v.added_by)) || DEMO_USER,
    notes,
    activeCheckins,
    myNote,
    upcomingEvents,
  };
}

/**
 * "Haftanın Mekanı" — editöryel bir seçim DEĞİL: son 7 gün içindeki
 * check-in'lerden ve bu hafta gerçekleşen/gerçekleşecek etkinliklerden
 * dinamik olarak hesaplanır. Hiç hareket yoksa null döner (uydurma popülerlik yok).
 */
export async function getVenueOfTheWeek(): Promise<VenueOfTheWeek | null> {
  if (!hasSupabaseEnv()) return computeFixtureVenueOfWeek();

  const supabase = await createClient();
  if (!supabase) return null;

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString();

  const [{ data: eventRows }, { data: checkinRows }] = await Promise.all([
    supabase.from("events").select("venue_id").not("venue_id", "is", null).gte("starts_at", weekAgo).lte("starts_at", weekAhead),
    supabase.from("venue_checkins").select("venue_id").gte("created_at", weekAgo),
  ]);

  const scores = new Map<string, { events: number; checkins: number }>();
  (eventRows ?? []).forEach((e) => {
    if (!e.venue_id) return;
    const s = scores.get(e.venue_id) ?? { events: 0, checkins: 0 };
    s.events += 1;
    scores.set(e.venue_id, s);
  });
  (checkinRows ?? []).forEach((c) => {
    const s = scores.get(c.venue_id) ?? { events: 0, checkins: 0 };
    s.checkins += 1;
    scores.set(c.venue_id, s);
  });

  let bestId: string | null = null;
  let bestScore = 0;
  let bestBreakdown = { events: 0, checkins: 0 };
  scores.forEach((s, id) => {
    const score = s.events * 3 + s.checkins;
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
      bestBreakdown = s;
    }
  });
  if (!bestId) return null;

  const venues = await getVenues();
  const venue = venues.find((v) => v.id === bestId);
  if (!venue) return null;

  return { venue, eventCount: bestBreakdown.events, checkinCount: bestBreakdown.checkins };
}
