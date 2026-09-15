import { Home, Users, Users2, CalendarDays, MessageCircle } from "lucide-react";

// Blog ve Akademi kaldırılmadı — ikisi de hâlâ var ve çalışıyor, sadece ana
// navigasyondan çıkarıldı:
//   - Blog → Ana Akış'a gömüldü (kısa paylaşımlarla aynı kronolojik akışta).
//   - Akademi → Etkinlikler'e gömüldü (dersler, "🎓 Eğitim" etiketiyle aynı
//     listede özel bir etkinlik türü gibi görünüyor).
// Mesajlar (DM) — eşleşmeler, kitap pazarlığı ve etkinlik soruları için
// doğrudan mesajlaşmaya ihtiyaç doğdu; nav'a bilinçli olarak tam ortaya
// eklendi (5 sekme, Mesajlar merkezde).
export const NAV_ITEMS = [
  { href: "/", label: "Ana Akış", icon: Home },
  { href: "/eslesmeler", label: "Eşleşmeler", icon: Users2 },
  { href: "/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/kulupler", label: "Kulüpler", icon: Users },
  { href: "/etkinlikler", label: "Etkinlikler", icon: CalendarDays },
] as const;
