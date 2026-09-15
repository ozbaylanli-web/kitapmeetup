import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronLeft, Clock, MapPin, Video } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { EnrollButton } from "@/components/academy/EnrollButton";
import { getCourseBySlug } from "@/lib/data/academy";
import { getCurrentUser } from "@/lib/data/auth";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [course, currentUser] = await Promise.all([getCourseBySlug(slug), getCurrentUser()]);
  if (!course) notFound();

  const completedCount = course.lessons.filter((l) => l.completed).length;
  const progressPct = course.lessons.length ? Math.round((completedCount / course.lessons.length) * 100) : 0;

  return (
    <div>
      <Link href="/etkinlikler" className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
        <ChevronLeft size={16} /> Etkinlikler
      </Link>
      <div className="paper-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Pill color={course.color}>{course.level}</Pill>
          <Pill>{course.cadence}</Pill>
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold text-[var(--ink)] sm:text-3xl">{course.title}</h1>
        {course.subtitle && <p className="mt-1 text-[var(--ink-muted)]">{course.subtitle}</p>}
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">{course.description}</p>

        <div className="mt-4">{currentUser && <EnrollButton courseId={course.id} initialEnrolled={Boolean(course.isEnrolled)} />}</div>

        {course.isEnrolled && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs text-[var(--ink-muted)]">
              <span>İlerlemen</span>
              <span>
                {completedCount}/{course.lessons.length} ders
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--paper-sunken)]">
              <div className="h-full rounded-full bg-[var(--orange-500)] transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="mb-1 font-serif text-lg font-semibold text-[var(--ink)]">Dersler</h2>
        {course.lessons.map((lesson, i) => (
          <Link
            key={lesson.id}
            href={`/akademi/${course.slug}/${lesson.slug}`}
            className="paper-card flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
          >
            {lesson.completed ? (
              <CheckCircle2 size={20} className="shrink-0 text-[var(--success)]" />
            ) : (
              <Circle size={20} className="shrink-0 text-[var(--ink-muted)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--ink-muted)]">Ders {i + 1}</p>
              <p className="truncate font-medium text-[var(--ink)]">{lesson.title}</p>
              {lesson.startsAt && (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--ink-muted)]">
                  {lesson.isOnline ? <Video size={11} /> : <MapPin size={11} />}
                  {lesson.isOnline ? "Online" : lesson.locationName ?? "Buluşma"}
                </p>
              )}
            </div>
            {lesson.startsAt ? (
              <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-[var(--orange-50)] py-1.5 text-[var(--orange-700)]">
                <span className="text-[11px] font-semibold leading-tight">
                  {new Date(lesson.startsAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
                </span>
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1 text-xs text-[var(--ink-muted)]">
                <Clock size={12} /> {lesson.durationMinutes} dk
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
