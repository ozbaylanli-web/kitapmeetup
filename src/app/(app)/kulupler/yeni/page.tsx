import { PageHeader } from "@/components/ui/PageHeader";
import { ClubForm } from "@/components/clubs/ClubForm";

export default function NewClubPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Kulüpler"
        title="Yeni kulüp oluştur"
        description="Kendi ilgi alanın etrafında bir alt topluluk başlat — felsefe, şiir, korku, deneme… seçim senin."
      />
      <ClubForm />
    </div>
  );
}
