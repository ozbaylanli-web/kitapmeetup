import type { VenueKind } from "@/lib/types";

export const VENUE_KIND_META: Record<VenueKind, { label: string; emoji: string }> = {
  kitapci: { label: "Kitapçı", emoji: "📚" },
  kitap_kafe: { label: "Kitap Kafe", emoji: "☕" },
  okuma_dostu_kafe: { label: "Okumaya Uygun Kafe", emoji: "🪑" },
};

export const VENUE_KIND_OPTIONS: { value: VenueKind; label: string }[] = [
  { value: "kitap_kafe", label: "☕ Kitap Kafe" },
  { value: "kitapci", label: "📚 Kitapçı" },
  { value: "okuma_dostu_kafe", label: "🪑 Okumaya Uygun Kafe" },
];

export const ISTANBUL_DISTRICTS = [
  "Kadıköy",
  "Beyoğlu",
  "Beşiktaş",
  "Şişli",
  "Üsküdar",
  "Fatih",
  "Bakırköy",
  "Kartal",
  "Maltepe",
  "Ataşehir",
  "Sarıyer",
  "Moda",
  "Cihangir",
  "Karaköy",
];
