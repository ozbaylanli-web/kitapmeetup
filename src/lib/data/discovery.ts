import { Sparkles, BookOpen, PenLine, CalendarHeart, type LucideIcon } from "lucide-react";
import { getTodaysPromptDetail } from "./dailyPrompt";
import { searchCatalog } from "./catalog";
import { getEvents } from "./events";
import { slugify, isPastDate } from "@/lib/utils";

export type DailyDiscovery = {
  href: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  cta: string;
  icon: LucideIcon;
};

async function questionVariant(): Promise<DailyDiscovery> {
  const prompt = await getTodaysPromptDetail();
  return {
    href: "/gunun-sorusu",
    eyebrow: "Günün Sorusu",
    title: prompt.question,
    subtitle: null,
    cta: "Günün Sorusuna göz at",
    icon: Sparkles,
  };
}

async function bookVariant(): Promise<DailyDiscovery | null> {
  const books = await searchCatalog();
  if (books.length === 0) return null;
  const book = books[Math.floor(Math.random() * books.length)];
  return {
    href: `/kitaplar/${book.id}`,
    eyebrow: "Günün Kitabı",
    title: book.title,
    subtitle: book.author,
    cta: "Günün Kitabına göz at",
    icon: BookOpen,
  };
}

async function authorVariant(): Promise<DailyDiscovery | null> {
  const books = await searchCatalog();
  if (books.length === 0) return null;
  const book = books[Math.floor(Math.random() * books.length)];
  return {
    href: `/yazarlar/${slugify(book.author)}`,
    eyebrow: "Günün Yazarı",
    title: book.author,
    subtitle: book.title,
    cta: "Günün Yazarına göz at",
    icon: PenLine,
  };
}

async function eventVariant(): Promise<DailyDiscovery | null> {
  const events = await getEvents();
  const upcoming = events.filter((e) => !isPastDate(e.startsAt));
  const pool = upcoming.length ? upcoming : events;
  if (pool.length === 0) return null;
  const event = pool[Math.floor(Math.random() * pool.length)];
  return {
    href: `/etkinlikler/${event.slug}`,
    eyebrow: "Günün Etkinliği",
    title: event.title,
    subtitle: event.locationName ?? (event.isOnline ? "Online etkinlik" : null),
    cta: "Günün Etkinliğine göz at",
    icon: CalendarHeart,
  };
}

const VARIANTS = [questionVariant, bookVariant, authorVariant, eventVariant];

/**
 * Her çağrıda rastgele bir tür seçer (soru/kitap/yazar/etkinlik) - böylece
 * ana akış ve kenar çubuğu farklı ziyaretlerde farklı şeyler önerir. Seçilen
 * türde veri yoksa (ör. henüz etkinlik yok) sırayla bir sonrakini dener,
 * hiçbiri yoksa Günün Sorusu'na düşer (o her zaman bir cevabı vardır).
 */
export async function getDailyDiscovery(): Promise<DailyDiscovery> {
  // `.sort(() => Math.random() - 0.5)` görünüşte bir karıştırma gibi dursa da
  // gerçekte YANLI'dır (orijinal sıraya yakın sonuçlara eğilimlidir) - bunun
  // yerine her türe eşit %25 şans veren, rastgele bir başlangıç noktasından
  // sırayla deneyen bir döngü kullanıyoruz.
  const start = Math.floor(Math.random() * VARIANTS.length);
  for (let i = 0; i < VARIANTS.length; i++) {
    const variant = VARIANTS[(start + i) % VARIANTS.length];
    const result = await variant();
    if (result) return result;
  }
  return questionVariant();
}
