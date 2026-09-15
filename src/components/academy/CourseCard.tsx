import Link from "next/link";
import { BookOpen, Users, CalendarDays } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { formatShortDate } from "@/lib/utils";
import type { CourseSummary } from "@/lib/types";

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link href={`/akademi/${course.slug}`} className="paper-card flex flex-col gap-3 p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <Pill color={course.color}>{course.level}</Pill>
        <span className="text-xs text-[var(--ink-muted)]">{course.cadence}</span>
      </div>
      <div>
        <h3 className="font-serif text-lg font-semibold text-[var(--ink)]">{course.title}</h3>
        {course.subtitle && <p className="text-sm text-[var(--ink-muted)]">{course.subtitle}</p>}
      </div>
      <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">{course.description}</p>
      {course.nextSessionAt && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--orange-700)]">
          <CalendarDays size={13} /> Sıradaki buluşma: {formatShortDate(course.nextSessionAt)}
        </p>
      )}
      <div className="mt-auto flex items-center gap-4 border-t border-[var(--line)] pt-3 text-xs text-[var(--ink-muted)]">
        <span className="flex items-center gap-1">
          <BookOpen size={12} /> {course.lessonCount} ders
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} /> {course.enrolledCount} kayıtlı
        </span>
        {course.isEnrolled && <Pill>Kayıtlısın</Pill>}
      </div>
    </Link>
  );
}
