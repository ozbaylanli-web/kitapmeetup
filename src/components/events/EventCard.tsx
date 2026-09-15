import Link from "next/link";
import { CalendarDays, MapPin, Video, Users } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { formatEventDate, isPastDate, isLiveNow } from "@/lib/utils";
import type { EventSummary } from "@/lib/types";

export function EventCard({ event }: { event: EventSummary }) {
  const isPast = isPastDate(event.startsAt);
  const isLive = isLiveNow(event.startsAt, event.endsAt);

  return (
    <Link
      href={`/etkinlikler/${event.slug}`}
      className={`paper-card flex gap-4 p-4 transition-transform hover:-translate-y-0.5 sm:p-5 ${isLive ? "ring-2 ring-[var(--danger)]/40" : ""}`}
    >
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--orange-50)] py-2 text-[var(--orange-700)]">
        <CalendarDays size={18} />
        <span className="mt-1 text-[11px] font-semibold">
          {new Date(event.startsAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" })}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          {isLive && (
            <Pill color="var(--danger)" className="animate-pulse">
              🔴 Şu an gerçekleşiyor
            </Pill>
          )}
          {isPast && <Pill>Geçmiş</Pill>}
          {event.club && <Pill color={event.club.color}>{event.club.icon} {event.club.name}</Pill>}
        </div>
        <h3 className="truncate font-serif text-lg font-semibold text-[var(--ink)]">{event.title}</h3>
        <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{formatEventDate(event.startsAt)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-muted)]">
          <span className="flex items-center gap-1">
            {event.isOnline ? <Video size={12} /> : <MapPin size={12} />}
            {event.isOnline ? "Online" : event.locationName ?? "Konum belirtilmedi"}
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} /> {event.goingCount} gidiyor
          </span>
        </div>
      </div>
    </Link>
  );
}
