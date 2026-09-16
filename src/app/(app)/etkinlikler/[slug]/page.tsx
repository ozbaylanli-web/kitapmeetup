import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Video, Users, CalendarDays, CalendarPlus, ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { RsvpButtons } from "@/components/events/RsvpButtons";
import { RegistrationFieldsEditor } from "@/components/events/RegistrationFieldsEditor";
import { RegistrantsDashboard } from "@/components/events/RegistrantsDashboard";
import { InstagramPublishButton } from "@/components/events/InstagramPublishButton";
import { EventGoingNudge } from "@/components/matches/EventGoingNudge";
import { CoverUploader } from "@/components/ui/CoverUploader";
import { ShareButton } from "@/components/ui/ShareButton";
import { VENUE_KIND_META } from "@/lib/venueKinds";
import { getEventBySlug } from "@/lib/data/events";
import { getCurrentUser } from "@/lib/data/auth";
import { getMatchedAttendeesForEvent } from "@/lib/data/matches";
import { canManageEvent, getRegistrationFields, getMyRegistrationAnswers, getEventRegistrants } from "@/lib/data/registrations";
import { getInstagramPostRecord } from "@/lib/data/instagram";
import { setEventCoverAction } from "@/lib/actions/events";
import { formatEventDate, cn } from "@/lib/utils";

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, currentUser] = await Promise.all([getEventBySlug(slug), getCurrentUser()]);
  if (!event) notFound();

  const [matchedAttendees, registrationFields, myAnswers, canManage] = await Promise.all([
    currentUser ? getMatchedAttendeesForEvent(event.id) : Promise.resolve([]),
    getRegistrationFields(event.id),
    currentUser ? getMyRegistrationAnswers(event.id) : Promise.resolve({}),
    canManageEvent(event),
  ]);
  const registrants = canManage ? await getEventRegistrants(event.id) : [];
  const instagramRecord = currentUser?.isAdmin ? await getInstagramPostRecord("event", event.id) : null;

  return (
    <div>
      <div className="paper-card overflow-hidden">
        <div
          className={cn("relative flex h-32 items-end justify-between gap-3 p-5 text-white sm:h-40", !event.coverUrl && "sunset-gradient")}
          style={event.coverUrl ? { backgroundImage: `url(${event.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {event.coverUrl && <div className="absolute inset-0 bg-black/25" />}
          <div className="relative min-w-0">
            {event.club && (
              <span className="tag-pill mb-2 bg-white/20 text-white">
                {event.club.icon} {event.club.name}
              </span>
            )}
            <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{event.title}</h1>
          </div>
          {canManage && (
            <div className="relative shrink-0">
              <CoverUploader action={setEventCoverAction} idFieldName="eventId" idValue={event.id} hasCover={Boolean(event.coverUrl)} />
            </div>
          )}
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap gap-4 text-sm text-[var(--ink-soft)]">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={15} /> {formatEventDate(event.startsAt)}
            </span>
            <span className="flex items-center gap-1.5">
              {event.isOnline ? <Video size={15} /> : <MapPin size={15} />}
              {event.isOnline ? "Online etkinlik" : event.locationName ?? "Konum belirtilmedi"}
            </span>
            {event.capacity && (
              <span className="flex items-center gap-1.5">
                <Users size={15} /> {event.goingCount}/{event.capacity} kontenjan
              </span>
            )}
          </div>

          {event.description && <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink)]">{event.description}</p>}

          {event.venue && (
            <Link
              href={`/mekanlar/${event.venue.slug}`}
              className="flex items-center justify-between gap-2 rounded-xl bg-[var(--paper-sunken)] px-3.5 py-3 hover:bg-[var(--line)]"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--ink)]">
                  {VENUE_KIND_META[event.venue.kind].emoji} {event.venue.name}
                </p>
                <p className="text-xs text-[var(--ink-muted)]">{event.venue.district} · rehberdeki mekan sayfasına git</p>
              </div>
              <ExternalLink size={14} className="shrink-0 text-[var(--ink-muted)]" />
            </Link>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {event.isOnline && event.locationUrl && (
              <a href={event.locationUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--orange-600)] hover:underline">
                Katılım linkini aç →
              </a>
            )}
            <a
              href={`/api/etkinlikler/${event.slug}/ics`}
              className="flex items-center gap-1.5 text-sm font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)]"
            >
              <CalendarPlus size={15} /> Takvime ekle
            </a>
            <ShareButton
              title={event.title}
              text={`${formatEventDate(event.startsAt)} · ${event.isOnline ? "Online" : (event.locationName ?? "Kitapmeetup")}`}
              url={`/etkinlikler/${event.slug}`}
              imageCardUrl={`/api/instagram/kart?eyebrow=${encodeURIComponent(event.club ? `${event.club.icon} ${event.club.name}` : "Etkinlik")}&title=${encodeURIComponent(event.title)}&subtitle=${encodeURIComponent(formatEventDate(event.startsAt))}`}
              label="Paylaş"
            />
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--line)] pt-4 text-sm text-[var(--ink-muted)]">
            <span>Oluşturan:</span>
            <Link href={`/profil/${event.createdBy.username}`} className="flex items-center gap-1.5 font-medium text-[var(--ink)] hover:underline">
              <Avatar name={event.createdBy.fullName} color={event.createdBy.avatarColor} url={event.createdBy.avatarUrl} size={20} />
              {event.createdBy.fullName}
            </Link>
          </div>

          {matchedAttendees.length > 0 && <EventGoingNudge attendees={matchedAttendees} />}

          {currentUser && (
            <div className="border-t border-[var(--line)] pt-4">
              <RsvpButtons
                eventId={event.id}
                initialStatus={event.myRsvp ?? null}
                initialGoing={event.goingCount}
                initialInterested={event.interestedCount}
                registrationFields={registrationFields}
                initialAnswers={myAnswers}
              />
            </div>
          )}
        </div>
      </div>

      {canManage && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <RegistrationFieldsEditor eventId={event.id} initialFields={registrationFields} />
          <RegistrantsDashboard registrants={registrants} />
        </div>
      )}

      {currentUser?.isAdmin && (
        <div className="mt-4">
          <InstagramPublishButton eventId={event.id} initialRecord={instagramRecord} />
        </div>
      )}
    </div>
  );
}
