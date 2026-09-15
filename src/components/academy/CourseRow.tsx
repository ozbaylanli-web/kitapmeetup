import Link from "next/link";
import { GraduationCap, BookOpen, Users, CalendarDays } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import type { CourseSummary } from "@/lib/types";

/**
 * Akademi derslerini Etkinlikler listesindeki EventCard ile aynı satır
 * biçiminde gösterir — "Akademi", Etkinlikler içinde özel bir eğitim türü
 * olarak yer alsın diye kasıtlı olarak aynı görsel dil kullanılıyor.
 * Bir sonraki ders buluşması varsa (haftalık/aylık kurslar), tıpkı bir
 * etkinlik gibi tarih rozeti gösterir.
 */
export function CourseRow({ course }: { course: CourseSummary }) {
  return (
    <Link
      href={`/akademi/${course.slug}`}
      className="paper-card flex gap-4 p-4 transition-transform hover:-translate-y-0.5 sm:p-5"
    >
      {course.nextSessionAt ? (
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--orange-50)] py-2 text-[var(--orange-700)]">
          <CalendarDays size={16} />
          <span className="mt-1 text-[11px] font-semibold">
            {new Date(course.nextSessionAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
          </span>
        </div>
      ) : (
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--orange-50)] py-2 text-center text-[var(--orange-700)]">
          <GraduationCap size={18} />
          <span className="mt-1 text-[10px] font-semibold leading-tight">{course.cadence}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <Pill color={course.color}>🎓 Eğitim</Pill>
          <Pill>{course.level}</Pill>
          {course.isEnrolled && <Pill>Kayıtlısın</Pill>}
        </div>
        <h3 className="truncate font-serif text-lg font-semibold text-[var(--ink)]">{course.title}</h3>
        {course.subtitle && <p className="mt-0.5 truncate text-xs text-[var(--ink-muted)]">{course.subtitle}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)]">
          <span className="flex items-center gap-1">
            <BookOpen size={12} /> {course.lessonCount} ders
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {course.enrolledCount} kayıtlı
          </span>
        </div>
      </div>
    </Link>
  );
}
