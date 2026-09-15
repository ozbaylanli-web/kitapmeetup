import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { VenueCard } from "@/components/venues/VenueCard";
import { VenueForm } from "@/components/venues/VenueForm";
import { getVenues } from "@/lib/data/venues";

export default async function VenuesPage() {
  const venues = await getVenues();

  return (
    <div>
      <PageHeader
        eyebrow="Topluluk rehberi"
        title="Mekanlar"
        description="İstanbul'daki kitapçı, kitap kafe ve okumaya uygun kafeler — topluluğun beraber büyüttüğü bir rehber."
      />

      <div className="mb-5">
        <VenueForm />
      </div>

      {venues.length === 0 ? (
        <EmptyState emoji="📍" title="Henüz mekan yok" description="Rehbere ilk mekanı sen ekle." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}
    </div>
  );
}
