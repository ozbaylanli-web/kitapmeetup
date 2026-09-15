import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventCard } from "@/components/events/EventCard";
import { CourseRow } from "@/components/academy/CourseRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonVariants } from "@/components/ui/Button";
import { getEvents } from "@/lib/data/events";
import { getCourses } from "@/lib/data/academy";
import { isPastDate, isLiveNow } from "@/lib/utils";

export default async function EventsPage() {
  const [events, courses] = await Promise.all([getEvents(), getCourses()]);
  const live = events.filter((e) => isLiveNow(e.startsAt, e.endsAt));
  const liveIds = new Set(live.map((e) => e.id));
  const upcoming = events.filter((e) => !isPastDate(e.startsAt) && !liveIds.has(e.id));
  const past = events.filter((e) => isPastDate(e.startsAt) && !liveIds.has(e.id));

  return (
    <div>
      <PageHeader
        eyebrow="Buluşmalar & Akademi"
        title="Etkinlikler"
        description="Fiziksel ya da online buluşmalar ve kendi hızında ilerleyebileceğin Akademi dersleri, tek yerde."
        actions={
          <>
            <Link href="/mekanlar" className={buttonVariants("outline", "sm")}>
              <MapPin size={14} /> Mekanlar
            </Link>
            <Link href="/etkinlikler/yeni" className={buttonVariants("primary", "sm")}>
              <Plus size={14} /> Etkinlik oluştur
            </Link>
          </>
        }
      />

      {live.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-1.5 font-serif text-lg font-semibold text-[var(--danger)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--danger)]" /> Şu an gerçekleşiyor
          </h2>
          <div className="space-y-3">
            {live.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}

      {courses.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">🎓 Akademi</h2>
          <div className="space-y-3">
            {courses.map((c) => (
              <CourseRow key={c.id} course={c} />
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Yaklaşan etkinlikler</h2>
      {upcoming.length === 0 ? (
        <EmptyState emoji="🗓️" title="Yaklaşan etkinlik yok" description="İlk etkinliği sen oluştur." />
      ) : (
        <div className="space-y-3">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-serif text-lg font-semibold text-[var(--ink)]">Geçmiş etkinlikler</h2>
          <div className="space-y-3 opacity-80">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
