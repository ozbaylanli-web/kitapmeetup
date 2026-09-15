import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import type { ShelfStatus } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: tr });
}

export function formatEventDate(iso: string): string {
  return format(new Date(iso), "d MMMM yyyy, EEEE — HH:mm", { locale: tr });
}

export function formatShortDate(iso: string): string {
  return format(new Date(iso), "d MMMM yyyy", { locale: tr });
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  const replaced = input.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => map[ch] ?? ch);
  return replaced
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Bir ISO tarihinin geçmişte kalıp kalmadığını söyler.
 * Sunucu bileşenlerinde istek anında (request-time) hesaplanması kasıtlıdır;
 * bu yüzden react-hooks/purity kuralını burada, tek yerde susturuyoruz.
 */
export function isPastDate(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

/** Bitiş saati belirtilmemiş etkinlikler için varsayılan süre — "şu an gerçekleşiyor mu" hesabında kullanılır. */
const DEFAULT_EVENT_DURATION_MS = 2 * 60 * 60 * 1000;

/** Şu anda gerçekleşmekte olan bir etkinlik mi (başlamış ama bitmemiş)? */
export function isLiveNow(startsAt: string, endsAt?: string | null): boolean {
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = endsAt ? new Date(endsAt).getTime() : start + DEFAULT_EVENT_DURATION_MS;
  return start <= now && now < end;
}

/** Kitap Eşleşmeleri kartlarında ortak bir kitabın ilişkisini tek cümlede özetler. */
export function describeMatch(my: ShelfStatus, their: ShelfStatus): string {
  if (my === "reading" && their === "reading") return "İkiniz de şu an okuyorsunuz";
  if (my === "read" && their === "read") return "İkiniz de okumuş";
  if (my === "reading" && their === "read") return "Sen okuyorsun, o bitirmiş";
  if (my === "read" && their === "reading") return "Sen bitirmişsin, o okuyor";
  return "Ortak kitabınız var";
}

/** Doğum tarihinden yaş hesaplar — profilde ham tarih yerine yaş göstermek daha mahremiyetli. */
export function calculateAge(birthDateIso: string): number {
  const birth = new Date(birthDateIso);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

/** İsimden yalnızca ilk adı alır — sıcak, samimi hitap için (ör. bildirim/teşvik metinleri). */
export function firstName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

const SPINE_PALETTE = [
  "#D24915",
  "#B8791B",
  "#146B62",
  "#6F5A94",
  "#C05F82",
  "#35594D",
  "#3E6C93",
  "#AB3812",
  "#802A11",
  "#551B0B",
  "#4A3D31",
];

/** Bir metinden (ör. kitap başlığı) her zaman aynı, deterministik bir sırt rengi üretir. */
export function colorForText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return SPINE_PALETTE[hash % SPINE_PALETTE.length];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
