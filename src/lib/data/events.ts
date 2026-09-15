import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { DEMO_USER, EVENTS, getEventBySlug as getFixtureEventBySlug } from "@/lib/fixtures";
import type { ClubSummary, EventSummary, RsvpStatus, VenueSummary } from "@/lib/types";
import { fetchAuthorsByIds } from "./mappers";
import { getCurrentUser } from "./auth";

export async function getEvents(): Promise<EventSummary[]> {
  if (!hasSupabaseEnv()) return EVENTS;
  const supabase = await createClient();
  if (!supabase) return EVENTS;

  const { data: eventRows } = await supabase.from("events").select("*").order("starts_at", { ascending: true });
  const rows = eventRows ?? [];
  if (rows.length === 0) return [];

  const authorMap = await fetchAuthorsByIds(supabase, rows.map((r) => r.created_by).filter((id): id is string => Boolean(id)));

  const clubIds = Array.from(new Set(rows.map((r) => r.club_id).filter((id): id is string => Boolean(id))));
  const { data: clubRows } = clubIds.length ? await supabase.from("clubs").select("*").in("id", clubIds) : { data: [] };
  const clubMap = new Map<string, ClubSummary>(
    (clubRows ?? []).map((c) => [
      c.id,
      { id: c.id, slug: c.slug, name: c.name, icon: c.icon, color: c.color, description: c.description, memberCount: 0 },
    ])
  );

  const venueIds = Array.from(new Set(rows.map((r) => r.venue_id).filter((id): id is string => Boolean(id))));
  const { data: venueRows } = venueIds.length ? await supabase.from("venues").select("*").in("id", venueIds) : { data: [] };
  const venueMap = new Map<string, VenueSummary>(
    (venueRows ?? []).map((v) => [
      v.id,
      { id: v.id, slug: v.slug, name: v.name, district: v.district, kind: v.kind, description: v.description, mapsUrl: v.maps_url, avgRating: null, noteCount: 0, activeCheckinCount: 0 },
    ])
  );

  const eventIds = rows.map((r) => r.id);
  const { data: rsvpRows } = eventIds.length ? await supabase.from("event_rsvps").select("*").in("event_id", eventIds) : { data: [] };
  const going = new Map<string, number>();
  const interested = new Map<string, number>();
  const currentUser = await getCurrentUser();
  const myRsvpMap = new Map<string, RsvpStatus>();
  (rsvpRows ?? []).forEach((r) => {
    if (r.status === "going") going.set(r.event_id, (going.get(r.event_id) ?? 0) + 1);
    if (r.status === "interested") interested.set(r.event_id, (interested.get(r.event_id) ?? 0) + 1);
    if (currentUser && r.user_id === currentUser.id) myRsvpMap.set(r.event_id, r.status);
  });

  return rows.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    description: e.description,
    club: e.club_id ? clubMap.get(e.club_id) ?? null : null,
    locationName: e.location_name,
    locationUrl: e.location_url,
    isOnline: e.is_online,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    capacity: e.capacity,
    goingCount: going.get(e.id) ?? 0,
    interestedCount: interested.get(e.id) ?? 0,
    createdBy: (e.created_by && authorMap.get(e.created_by)) || DEMO_USER,
    myRsvp: myRsvpMap.get(e.id) ?? null,
    venue: e.venue_id ? venueMap.get(e.venue_id) ?? null : null,
  }));
}

export async function getEventBySlug(slug: string): Promise<EventSummary | null> {
  if (!hasSupabaseEnv()) return getFixtureEventBySlug(slug);
  const events = await getEvents();
  return events.find((e) => e.slug === slug) ?? null;
}
