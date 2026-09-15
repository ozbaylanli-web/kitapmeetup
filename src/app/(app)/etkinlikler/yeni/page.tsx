import { PageHeader } from "@/components/ui/PageHeader";
import { EventForm } from "@/components/events/EventForm";
import { getClubs } from "@/lib/data/clubs";
import { getVenues } from "@/lib/data/venues";

export default async function NewEventPage() {
  const [clubs, venues] = await Promise.all([getClubs(), getVenues()]);
  return (
    <div>
      <PageHeader eyebrow="Etkinlikler" title="Yeni etkinlik oluştur" description="Fiziksel bir buluşma ya da online bir sohbet planla." />
      <EventForm clubs={clubs} venues={venues} />
    </div>
  );
}
