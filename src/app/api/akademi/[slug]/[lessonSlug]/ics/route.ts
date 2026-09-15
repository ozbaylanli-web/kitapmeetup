import { getCourseBySlug } from "@/lib/data/academy";
import { buildIcsEvent } from "@/lib/ics";

export async function GET(_request: Request, context: { params: Promise<{ slug: string; lessonSlug: string }> }) {
  const { slug, lessonSlug } = await context.params;
  const course = await getCourseBySlug(slug);
  const lesson = course?.lessons.find((l) => l.slug === lessonSlug);
  if (!course || !lesson || !lesson.startsAt) return new Response("Ders bulunamadı", { status: 404 });

  const ics = buildIcsEvent({
    uid: lesson.id,
    title: `${course.title}: ${lesson.title}`,
    description: lesson.content || null,
    location: lesson.isOnline ? lesson.locationUrl ?? "Online" : lesson.locationName ?? "",
    url: lesson.locationUrl ?? null,
    startsAt: lesson.startsAt,
    endsAt: lesson.endsAt,
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${lessonSlug}.ics"`,
    },
  });
}
