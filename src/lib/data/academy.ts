import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { COURSES, getCourseBySlug as getFixtureCourseBySlug } from "@/lib/fixtures";
import type { CourseDetail, CourseSummary, RsvpStatus } from "@/lib/types";
import { getCurrentUser } from "./auth";

export async function getCourses(): Promise<CourseSummary[]> {
  if (!hasSupabaseEnv()) return COURSES;
  const supabase = await createClient();
  if (!supabase) return COURSES;

  const { data: courseRows } = await supabase
    .from("academy_courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: true });
  if (!courseRows) return [];

  // Bu 3 sorgu birbirinden bağımsız — paralel çekiyoruz.
  const [{ data: lessonRows }, { data: enrollRows }, currentUser] = await Promise.all([
    supabase.from("academy_lessons").select("course_id, starts_at"),
    supabase.from("academy_enrollments").select("course_id, user_id"),
    getCurrentUser(),
  ]);

  const lessonCounts = new Map<string, number>();
  const nextSessionByCourse = new Map<string, string>();
  const now = Date.now();
  (lessonRows ?? []).forEach((l) => {
    lessonCounts.set(l.course_id, (lessonCounts.get(l.course_id) ?? 0) + 1);
    if (l.starts_at && new Date(l.starts_at).getTime() >= now) {
      const current = nextSessionByCourse.get(l.course_id);
      if (!current || new Date(l.starts_at).getTime() < new Date(current).getTime()) {
        nextSessionByCourse.set(l.course_id, l.starts_at);
      }
    }
  });

  const enrollCounts = new Map<string, number>();
  const myEnrollments = new Set<string>();
  (enrollRows ?? []).forEach((e) => {
    enrollCounts.set(e.course_id, (enrollCounts.get(e.course_id) ?? 0) + 1);
    if (currentUser && e.user_id === currentUser.id) myEnrollments.add(e.course_id);
  });

  return courseRows.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    level: c.level,
    cadence: c.cadence,
    color: c.color,
    lessonCount: lessonCounts.get(c.id) ?? 0,
    enrolledCount: enrollCounts.get(c.id) ?? 0,
    isEnrolled: myEnrollments.has(c.id),
    nextSessionAt: nextSessionByCourse.get(c.id) ?? null,
  }));
}

export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  if (!hasSupabaseEnv()) return getFixtureCourseBySlug(slug);
  const supabase = await createClient();
  if (!supabase) return getFixtureCourseBySlug(slug);

  const { data: course } = await supabase.from("academy_courses").select("*").eq("slug", slug).maybeSingle();
  if (!course) return null;

  const [{ data: lessonRows }, { data: enrollRows }, currentUser] = await Promise.all([
    supabase.from("academy_lessons").select("*").eq("course_id", course.id).order("order_index", { ascending: true }),
    supabase.from("academy_enrollments").select("user_id").eq("course_id", course.id),
    getCurrentUser(),
  ]);
  const isEnrolled = Boolean(currentUser && (enrollRows ?? []).some((e) => e.user_id === currentUser.id));

  const lessonIds = (lessonRows ?? []).map((l) => l.id);

  const [progressRows, { data: rsvpRows }] = await Promise.all([
    currentUser && lessonIds.length
      ? supabase.from("academy_lesson_progress").select("lesson_id").eq("user_id", currentUser.id).in("lesson_id", lessonIds).then((r) => r.data)
      : Promise.resolve(null),
    lessonIds.length
      ? supabase.from("academy_lesson_rsvps").select("*").in("lesson_id", lessonIds)
      : Promise.resolve({ data: [] as { lesson_id: string; user_id: string; status: RsvpStatus }[] }),
  ]);
  const completedLessonIds = new Set((progressRows ?? []).map((p) => p.lesson_id));
  const going = new Map<string, number>();
  const interested = new Map<string, number>();
  const myRsvpMap = new Map<string, RsvpStatus>();
  (rsvpRows ?? []).forEach((r) => {
    if (r.status === "going") going.set(r.lesson_id, (going.get(r.lesson_id) ?? 0) + 1);
    if (r.status === "interested") interested.set(r.lesson_id, (interested.get(r.lesson_id) ?? 0) + 1);
    if (currentUser && r.user_id === currentUser.id) myRsvpMap.set(r.lesson_id, r.status);
  });

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    level: course.level,
    cadence: course.cadence,
    color: course.color,
    lessonCount: lessonRows?.length ?? 0,
    enrolledCount: (enrollRows ?? []).length,
    isEnrolled,
    lessons: (lessonRows ?? []).map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      orderIndex: l.order_index,
      durationMinutes: l.duration_minutes,
      content: l.content,
      completed: completedLessonIds.has(l.id),
      startsAt: l.starts_at,
      endsAt: l.ends_at,
      isOnline: l.is_online,
      locationName: l.location_name,
      locationUrl: l.location_url,
      capacity: l.capacity,
      goingCount: going.get(l.id) ?? 0,
      interestedCount: interested.get(l.id) ?? 0,
      myRsvp: myRsvpMap.get(l.id) ?? null,
    })),
  };
}
