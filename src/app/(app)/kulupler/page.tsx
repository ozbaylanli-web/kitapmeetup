import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClubCard } from "@/components/clubs/ClubCard";
import { buttonVariants } from "@/components/ui/Button";
import { getClubs } from "@/lib/data/clubs";

export default async function ClubsPage() {
  const clubs = await getClubs();

  return (
    <div>
      <PageHeader
        eyebrow="Topluluk"
        title="Kulüpler"
        description="Felsefeden bilimkurguya, ilgi alanına göre derinleşen alt topluluklar."
        actions={
          <Link href="/kulupler/yeni" className={buttonVariants("primary", "sm")}>
            <Plus size={14} /> Yeni kulüp
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </div>
  );
}
