import { getEventBySlug } from "@/lib/data/events";
import { buildIcsEvent } from "@/lib/ics";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const event = await getEventBySlug(slug);
  if (!event) return new Response("Etkinlik bulunamadı", { status: 404 });

  const ics = buildIcsEvent({
    uid: event.id,
    title: event.title,
    description: event.description || null,
    location: event.isOnline ? event.locationUrl ?? "Online etkinlik" : event.locationName ?? null,
    url: event.locationUrl ?? null,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
