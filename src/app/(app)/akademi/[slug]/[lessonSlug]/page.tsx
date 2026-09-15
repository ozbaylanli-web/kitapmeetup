import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight, Clock, CalendarDays, CalendarPlus, MapPin, Video, Users } from "lucide-react";
import { CompleteLessonButton } from "@/components/academy/CompleteLessonButton";
import { LessonRsvpButtons } from "@/components/academy/LessonRsvpButtons";
import { getCourseBySlug } from "@/lib/data/academy";
import { getCurrentUser } from "@/lib/data/auth";
import { formatEventDate, isPastDate } from "@/lib/utils";

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonSlug: string }> }) {
  const { slug, lessonSlug } = await params;
  const [course, currentUser] = await Promise.all([getCourseBySlug(slug), getCurrentUser()]);
  if (!course) notFound();

  const index = course.lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) notFound();
  const lesson = course.lessons[index];
  const prev = course.lessons[index - 1];
  const next = course.lessons[index + 1];
  const isMeetup = Boolean(lesson.startsAt);
  const isPast = isMeetup && isPastDate(lesson.startsAt!);

  return (
    <div>
      <Link href={`/akademi/${course.slug}`} className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
        <ChevronLeft size={16} /> {course.title}
      </Link>

      <div className="paper-card p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--orange-600)]">
          Ders {index + 1} / {course.lessons.length}
          {isPast && " · Geçmiş buluşma"}
        </p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-[var(--ink)] sm:text-3xl">{lesson.title}</h1>
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-muted)]">
          <Clock size={12} /> {lesson.durationMinutes} dk
        </p>

        {isMeetup && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--ink-soft)]">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} /> {formatEventDate(lesson.startsAt!)}
            </span>
            <span className="flex items-center gap-1.5">
              {lesson.isOnline ? <Video size={15} /> : <MapPin size={15} />}
              {lesson.isOnline ? "Online buluşma" : lesson.locationName ?? "Konum belirtilmedi"}
            </span>
            {lesson.capacity ? (
              <span className="flex items-center gap-1.5">
                <Users size={15} /> {lesson.goingCount}/{lesson.capacity} kontenjan
              </span>
            ) : null}
          </div>
        )}

        <div className="prose-academy mt-5 text-sm leading-relaxed text-[var(--ink)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </div>

        {isMeetup && (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            {lesson.isOnline && lesson.locationUrl && (
              <a href={lesson.locationUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--orange-600)] hover:underline">
                Katılım linkini aç →
              </a>
            )}
            <a
              href={`/api/akademi/${course.slug}/${lesson.slug}/ics`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <CalendarPlus size={15} /> Takvime ekle
            </a>
          </div>
        )}

        {currentUser && (
          <div className="mt-6 space-y-3 border-t border-[var(--line)] pt-4">
            {isMeetup && (
              <LessonRsvpButtons
                lessonId={lesson.id}
                initialStatus={lesson.myRsvp ?? null}
                initialGoing={lesson.goingCount ?? 0}
                initialInterested={lesson.interestedCount ?? 0}
              />
            )}
            <CompleteLessonButton
              lessonId={lesson.id}
              initialCompleted={Boolean(lesson.completed)}
              label={isMeetup ? "Katıldım" : "Dersi tamamladım"}
              completedLabel={isMeetup ? "Katıldın" : "Tamamlandı"}
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {prev ? (
          <Link href={`/akademi/${course.slug}/${prev.slug}`} className="paper-card flex-1 p-3 text-sm text-[var(--ink-soft)] hover:-translate-y-0.5 transition-transform">
            <span className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
              <ChevronLeft size={12} /> Önceki
            </span>
            <span className="line-clamp-1 font-medium text-[var(--ink)]">{prev.title}</span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link href={`/akademi/${course.slug}/${next.slug}`} className="paper-card flex-1 p-3 text-right text-sm text-[var(--ink-soft)] hover:-translate-y-0.5 transition-transform">
            <span className="flex items-center justify-end gap-1 text-xs text-[var(--ink-muted)]">
              Sonraki <ChevronRight size={12} />
            </span>
            <span className="line-clamp-1 font-medium text-[var(--ink)]">{next.title}</span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}
