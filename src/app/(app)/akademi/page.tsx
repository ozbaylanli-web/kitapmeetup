import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CourseCard } from "@/components/academy/CourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCourses } from "@/lib/data/academy";

export default async function AcademyPage() {
  const courses = await getCourses();

  return (
    <div>
      <Link href="/etkinlikler" className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]">
        <ChevronLeft size={16} /> Etkinlikler
      </Link>
      <PageHeader
        eyebrow="Akademi"
        title="Kitapmeetup Akademi"
        description={`Haftalık ya da aylık ritimde ilerleyen, "Evrim 101" gibi meraklısına açık temel eğitimler. Dersler Etkinlikler sayfasında da listelenir.`}
      />
      {courses.length === 0 ? (
        <EmptyState emoji="🎓" title="Henüz ders yok" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
