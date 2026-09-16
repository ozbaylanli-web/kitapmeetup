import { Home, Users, HeartHandshake, CalendarDays, MessageCircle } from "lucide-react";

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
  { href: "/eslesmeler", label: "Eşleşmeler", icon: HeartHandshake },
  { href: "/mesajlar", label: "Mesajlar", icon: MessageCircle },
  { href: "/kulupler", label: "Kulüpler", icon: Users },
  { href: "/etkinlikler", label: "Etkinlikler", icon: CalendarDays },
] as const;

// Masaüstü (website) görünümünde istenen sıralama mobil (app) görünümünden
// farklı: Ana Sayfa, Kulüpler, Etkinlikler, Eşleşmeler, Mesajlar. Mobil
// alt navigasyon NAV_ITEMS'in kendi sırasını kullanmaya devam eder.
export const NAV_ORDER_DESKTOP = ["/", "/kulupler", "/etkinlikler", "/eslesmeler", "/mesajlar"] as const;
