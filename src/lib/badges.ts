import type { Badge, ProfileDetail } from "@/lib/types";

export interface BadgeStatus extends Badge {
  earned: boolean;
  /** Kazanılmadıysa: nasıl kazanılacağını anlatan, ileri dönük bir ipucu. */
  howTo: string;
}

interface BadgeDef {
  id: string;
  label: string;
  emoji: string;
  /** Kazanıldıktan sonra gösterilen, geçmiş zamanlı açıklama. */
  description: string;
  /** Henüz kazanılmadıysa gösterilen, ileri dönük ipucu. */
  howTo: string;
  predicate: (profile: ProfileDetail) => boolean;
}

/**
 * Okuma rozetleri — sabit bir "rozetler" tablosu yerine, profildeki
 * aktiviteden anlık olarak hesaplanır. Basit ama genişletilebilir.
 */
const BADGE_DEFS: BadgeDef[] = [
  {
    id: "ilk-kitap",
    label: "İlk Kitabın",
    emoji: "🌱",
    description: "Rafına ilk kitabını ekledin.",
    howTo: "Rafına en az bir kitap ekle.",
    predicate: (p) => p.shelf.length > 0,
  },
  {
    id: "kulup-kurdu",
    label: "Kulüp Kurdu",
    emoji: "📚",
    description: "3'ten fazla kitabı bitirdin.",
    howTo: "Rafında \"okudum\" olarak işaretlediğin kitap sayısını 3'ün üzerine çıkar.",
    predicate: (p) => p.shelf.filter((s) => s.status === "read").length >= 3,
  },
  {
    id: "coklu-okur",
    label: "Çoklu Okur",
    emoji: "🔀",
    description: "Aynı anda 2'den fazla kitap okuyorsun.",
    howTo: "Rafına aynı anda 2'den fazla \"okuyorum\" kitabı ekle.",
    predicate: (p) => p.shelf.filter((s) => s.status === "reading").length >= 2,
  },
  {
    id: "sohbet-baslatici",
    label: "Sohbet Başlatıcı",
    emoji: "💬",
    description: "Akışta bir soru sordun.",
    howTo: "Ana Akış'ta \"Soru\" türünde bir gönderi paylaş.",
    predicate: (p) => p.posts.filter((post) => post.type === "question").length >= 1,
  },
  {
    id: "alinti-avcisi",
    label: "Alıntı Avcısı",
    emoji: "✒️",
    description: "2'den fazla alıntı paylaştın.",
    howTo: "Ana Akış'ta 2'den fazla \"Alıntı\" gönderisi paylaş.",
    predicate: (p) => p.posts.filter((post) => post.type === "quote").length >= 2,
  },
  {
    id: "coklu-kulup",
    label: "Çok Yönlü Okur",
    emoji: "🗝️",
    description: "Birden fazla kulübe üyesin.",
    howTo: "Birden fazla kulübe katıl.",
    predicate: (p) => p.clubs.length >= 2,
  },
  {
    id: "organizator",
    label: "Organizatör",
    emoji: "🎪",
    description: "Bir etkinlik oluşturdun.",
    howTo: "Etkinlikler sayfasından bir buluşma oluştur.",
    predicate: (p) => p.events.length >= 1,
  },
  {
    id: "kalem-erbabi",
    label: "Kalem Erbabı",
    emoji: "🖋️",
    description: "Blogda ilk yazını yayınladın.",
    howTo: "Blog'da bir yazı yayınla.",
    predicate: (p) => p.blogPosts.length >= 1,
  },
  {
    id: "davetci",
    label: "Davetçi",
    emoji: "📣",
    description: "En az bir arkadaşını Kitapmeetup'a davet ettin.",
    howTo: "Ayarlar'daki davet linkini paylaş, bir arkadaşın senin linkinle katılsın.",
    predicate: (p) => p.referralCount >= 1,
  },
];

/** Yalnızca kazanılan rozetler — geriye dönük uyumluluk için. */
export function computeBadges(profile: ProfileDetail): Badge[] {
  return BADGE_DEFS.filter((def) => def.predicate(profile)).map(({ id, label, emoji, description }) => ({
    id,
    label,
    emoji,
    description,
  }));
}

/** Tüm rozetler — kazanılan VE henüz kazanılmayan (pasif, "nasıl kazanılır" ipucuyla). */
export function getBadgeStatuses(profile: ProfileDetail): BadgeStatus[] {
  return BADGE_DEFS.map((def) => {
    const earned = def.predicate(profile);
    return {
      id: def.id,
      label: def.label,
      emoji: def.emoji,
      description: def.description,
      howTo: def.howTo,
      earned,
    };
  });
}
