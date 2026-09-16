// Kitapmeetup görünüm modelleri — arayüz bu tiplerle çalışır.
// src/lib/data/* fonksiyonları, veri Supabase'ten ya da fixture'lardan
// gelsin, hep bu şekillere dönüştürür.

export type AccountKind = "reader" | "publisher";

export interface AuthorSummary {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatarColor: string;
  avatarUrl?: string | null;
  city?: string | null;
  /** ISO tarih (yyyy-mm-dd) — opsiyonel, kullanıcı isterse girer. */
  birthDate?: string | null;
  /** Serbest metin — "Kadın" / "Erkek" / "Diğer" / "Belirtmek istemiyorum" vb. */
  gender?: string | null;
  isAdmin?: boolean;
  /** "publisher" ise profilde/paylaşımlarda "Yayınevi" rozetiyle gösterilir. */
  accountKind?: AccountKind;
  /** Sadece yayınevi hesapları için — opsiyonel web sitesi linki. */
  publisherWebsite?: string | null;
}

export interface ClubSummary {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  memberCount: number;
  /** İsteğe bağlı kapak fotoğrafı (Supabase Storage public URL) — yoksa varsayılan gradient kullanılır. */
  coverUrl?: string | null;
}

export interface ClubDetail extends ClubSummary {
  members: AuthorSummary[];
  currentBooks: BookSummary[];
  createdBy: AuthorSummary;
  /** Yönetici/moderatörün sabitlediği "resmi" ortak okuma — üyelerin bireysel raflarından bağımsız. */
  pinnedBook?: BookSummary | null;
  pinnedBookNote?: string | null;
  pinnedBookSetAt?: string | null;
  readThreads: ReadThreadSummary[];
  /** Kulübün sabit buluşma mekanı — İstanbul'daki kitapçı/kitap kafe rehberinden seçilir. */
  homeVenue?: VenueSummary | null;
}

/** Kulüpte, pinlenen kitap üzerine açılan bölüm bazlı bir mini tartışma başlığı. */
export interface ReadThreadSummary {
  id: string;
  title: string;
  createdAt: string;
  createdBy: AuthorSummary;
  commentCount: number;
}

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  spineColor: string;
  /** ör. "Bilimkurgu ve Fantastik" — Kitap Eşleşmeleri'nde "aynı tür" eşleşmesi için kullanılır. */
  genre?: string | null;
}

export type ShelfStatus = "reading" | "read" | "want";

/** Bir kitabı rafına ekleyen bir kullanıcı — kitap sayfasındaki "kim okuyor/okumuş" listesi için. */
export interface BookReader {
  status: ShelfStatus;
  author: AuthorSummary;
}

/** Kitap detay sayfası — o kitapla ilgili paylaşımlar, okuyanlar ve etkinlikler tek yerde. */
export interface BookDetail extends BookSummary {
  posts: FeedPost[];
  readers: BookReader[];
  events: EventSummary[];
}

/** Yazar detay sayfası — kitaplar tablosundaki serbest metin "author" alanından türetilir, ayrı bir yazar tablosu yok. */
export interface AuthorDetail {
  name: string;
  slug: string;
  books: BookSummary[];
  posts: FeedPost[];
  events: EventSummary[];
}

export interface ShelfItem {
  id: string;
  status: ShelfStatus;
  rating?: number | null;
  note?: string | null;
  book: BookSummary;
}

export type PostType = "text" | "quote" | "photo" | "question" | "takas" | "takas_arama" | "etkinlik" | "kulup";
export type SwapOfferStatus = "pending" | "accepted" | "declined";

/** Bir takas ilanına (type: "takas" olan bir gönderiye) yapılan tek bir kitap teklifi. */
export interface SwapOffer {
  id: string;
  book: BookSummary;
  message: string;
  status: SwapOfferStatus;
  createdAt: string;
  offerer: AuthorSummary;
}
export type CommentTarget = "post" | "blog_post" | "lesson" | "read_thread";
export type RsvpStatus = "going" | "interested" | "not_going";

export interface FeedPost {
  id: string;
  type: PostType;
  body: string | null;
  createdAt: string;
  author: AuthorSummary;
  club?: ClubSummary | null;
  book?: BookSummary | null;
  /** Gerçek yüklenen fotoğraf (Supabase Storage public URL). */
  imageUrl?: string | null;
  /** imageUrl yoksa (ör. önizleme modu) dekoratif bir renk kartı gösterilir. */
  photoColor?: string | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  /** Sadece type: "takas"/"takas_arama" gönderiler için — kaç teklif/yanıt aldığı ve giriş yapan kullanıcının kendi teklifinin durumu. */
  offerCount?: number;
  myOfferStatus?: SwapOfferStatus | null;
  /**
   * İkincil, opsiyonel kitap: "takas" ilanlarında (gelecekte) karşılığında
   * istenen belirli kitap, "takas_arama" ilanlarında ise arayan kişinin
   * karşılığında verebileceğini belirttiği kitap.
   */
  counterBook?: BookSummary | null;
  /** Sadece type: "etkinlik" sistem gönderilerinde — duyurulan etkinliğin hafif özeti. */
  event?: { slug: string; title: string; startsAt: string } | null;
}

export type RegistrationFieldType = "text" | "textarea" | "select" | "checkbox";

/** Bir etkinliğin yöneticisinin tanımladığı serbest bir kayıt sorusu (ör. "Diyetin var mı?"). */
export interface RegistrationField {
  id: string;
  label: string;
  fieldType: RegistrationFieldType;
  options: string[];
  required: boolean;
  orderIndex: number;
}

/** "Gidiyorum" diyen bir katılımcının kayıt sorularına verdiği tüm yanıtlar. */
export interface EventRegistrant {
  user: AuthorSummary;
  registeredAt: string;
  answers: { fieldId: string; label: string; value: string }[];
}

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  club?: ClubSummary | null;
  locationName?: string | null;
  locationUrl?: string | null;
  isOnline: boolean;
  startsAt: string;
  endsAt?: string | null;
  capacity?: number | null;
  goingCount: number;
  interestedCount: number;
  createdBy: AuthorSummary;
  myRsvp?: RsvpStatus | null;
  /** Etkinlik rehberdeki bir mekana bağlıysa (opsiyonel — serbest metin konum da hâlâ geçerli). */
  venue?: VenueSummary | null;
  /** İsteğe bağlı kapak fotoğrafı (Supabase Storage public URL) — yoksa varsayılan gradient kullanılır. */
  coverUrl?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────
// MEKANLAR — İstanbul'daki kitapçı / kitap kafe / okumaya uygun kafeler
// ─────────────────────────────────────────────────────────────────────────
export type VenueKind = "kitapci" | "kitap_kafe" | "okuma_dostu_kafe";

export interface VenueSummary {
  id: string;
  slug: string;
  name: string;
  district: string;
  kind: VenueKind;
  description: string;
  mapsUrl?: string | null;
  avgRating: number | null;
  noteCount: number;
  /** Son birkaç saat içinde "buradayım" diyen kişi sayısı. */
  activeCheckinCount: number;
}

export interface VenueNote {
  id: string;
  author: AuthorSummary;
  rating?: number | null;
  body: string;
  createdAt: string;
}

export interface VenueCheckin {
  id: string;
  user: AuthorSummary;
  note?: string | null;
  createdAt: string;
}

export interface VenueDetail extends VenueSummary {
  addedBy: AuthorSummary;
  notes: VenueNote[];
  activeCheckins: VenueCheckin[];
  upcomingEvents: EventSummary[];
  /** Giriş yapan kullanıcının bu mekana bıraktığı not/puan, varsa. */
  myNote?: VenueNote | null;
}

/** O hafta gerçekten hareketli olan mekan — editöryel değil, etkinlik+check-in sayısından hesaplanır. */
export interface VenueOfTheWeek {
  venue: VenueSummary;
  eventCount: number;
  checkinCount: number;
}

/**
 * Bir ders artık sadece okunan bir metin değil — "haftalık"/"aylık" ritimli
 * kurslarda gerçek bir buluşma (fiziksel ya da online) olabilir. `startsAt`
 * boşsa (ör. "kendi hızında" kurslar) ders eskisi gibi self-paced okunur.
 */
export interface CourseLesson {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  durationMinutes: number;
  content: string;
  completed?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  isOnline?: boolean;
  locationName?: string | null;
  locationUrl?: string | null;
  capacity?: number | null;
  goingCount?: number;
  interestedCount?: number;
  myRsvp?: RsvpStatus | null;
}

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  level: "giriş" | "orta" | "ileri";
  cadence: string;
  color: string;
  lessonCount: number;
  enrolledCount: number;
  isEnrolled?: boolean;
  /** En yakın gelecekteki ders buluşması — Etkinlikler listesinde tarih rozeti için. */
  nextSessionAt?: string | null;
}

export interface CourseDetail extends CourseSummary {
  lessons: CourseLesson[];
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  color: string;
  tags: string[];
  author: AuthorSummary;
  publishedAt: string;
  readMinutes: number;
}

export interface BlogPostDetail extends BlogPostSummary {
  body: string;
}

/**
 * Ana Akış, kısa gönderilerle blog yazılarını tek, kronolojik bir akışta
 * karıştırır — ayrı bir "Blog" sekmesine gerek kalmadan.
 */
export type FeedItem =
  | { kind: "post"; sortAt: string; post: FeedPost }
  | { kind: "blog"; sortAt: string; blogPost: BlogPostSummary };

/** "Günün Sorusu" — bugün herkese gösterilen soru + varsa giriş yapan kullanıcının kendi cevabı. */
export interface TodaysPrompt {
  id: string;
  question: string;
  myAnswer?: DailyPromptAnswer | null;
}

export interface DailyPromptAnswer {
  id: string;
  author: AuthorSummary;
  body: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  body: string;
  createdAt: string;
  author: AuthorSummary;
}

export interface ProfileDetail {
  author: AuthorSummary;
  shelf: ShelfItem[];
  posts: FeedPost[];
  blogPosts: BlogPostSummary[];
  clubs: ClubSummary[];
  events: EventSummary[];
  followerCount: number;
  followingCount: number;
  /** Kaç kişiyi Kitapmeetup'a davet ettiği (referred_by üzerinden sayılır). */
  referralCount: number;
}

/** Bir yıl için okuma hedefi + o yıl "okudum" işaretlenen kitap sayısı. */
export interface ReadingGoal {
  year: number;
  target: number;
  completed: number;
}

export interface CommunityReadingItem {
  author: AuthorSummary;
  book: BookSummary;
}

/** Aynı kitabı okuyan/okumuş iki kullanıcı arasındaki tek bir ortak kitap. */
export interface SharedBook {
  book: BookSummary;
  myStatus: ShelfStatus;
  theirStatus: ShelfStatus;
}

export interface SharedEvent {
  slug: string;
  title: string;
  startsAt: string;
}

/**
 * İki kullanıcı arasındaki eşleşme — artık tek bir sinyale değil, dördüne
 * birden dayanabilir: aynı kitap, aynı TÜR kitap, aynı kulüp, aynı etkinlik.
 * Biri bile eşleşme için yeterli; ne kadar çok sinyal o kadar güçlü eşleşme.
 */
export interface BookMatch {
  user: AuthorSummary;
  sharedBooks: SharedBook[];
  /** Ortak kitapları olmasa da, ikisinin de okuduğu/okuduğu ortak türler (ör. "Bilimkurgu ve Fantastik"). */
  sharedGenres: string[];
  sharedClubs: ClubSummary[];
  sharedEvents: SharedEvent[];
  /** Eşleştiğin kişinin gittiği, senin henüz "gidiyorum" demediğin en yakın etkinlik. */
  upcomingEventTogether?: SharedEvent | null;
}

export interface MessageItem {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ConversationSummary {
  otherUser: AuthorSummary;
  lastMessage: string;
  lastMessageAt: string;
  fromMe: boolean;
  unread: boolean;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  emoji: string;
}

/** Server Action sonuç şekli — fixture (demo) modunda mutasyonlar nazikçe reddedilir. */
export interface ActionResult {
  ok: boolean;
  demo?: boolean;
  error?: string;
}

/** Bir etkinliğin/gönderinin topluluğun ortak Instagram hesabına en son paylaşım denemesi (varsa). */
export interface InstagramPostRecord {
  status: "pending" | "published" | "failed";
  permalink: string | null;
  error: string | null;
  createdAt: string;
}
