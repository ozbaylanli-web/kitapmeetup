import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchesView } from "@/components/matches/MatchesView";
import { getBookMatches } from "@/lib/data/matches";

export default async function MatchesPage() {
  const matches = await getBookMatches();

  return (
    <div>
      <PageHeader
        eyebrow="Ortak noktan olanlar"
        title="Eşleşmelerin"
        description="Aynı kitabı okuyanlar, aynı türden kitaplara bayılanlar, aynı kulübe kayıtlı olanlar ya da aynı etkinliğe katılanlarla eşleş. Profillerine bak, sohbet başlat, birlikte gel."
      />
      {matches.length === 0 ? (
        <EmptyState
          emoji="🔭"
          title="Henüz eşleşme yok"
          description="Rafına bir kitap ekle, bir kulübe katıl ya da bir etkinliğe gidiyorum de — eşleşmeler kendiliğinden belirir."
        />
      ) : (
        <MatchesView matches={matches} />
      )}
    </div>
  );
}
