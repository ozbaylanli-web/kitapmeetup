import type {
  AuthorSummary,
  BlogPostDetail,
  BookSummary,
  ClubDetail,
  CommentItem,
  CourseDetail,
  EventRegistrant,
  EventSummary,
  FeedPost,
  MessageItem,
  RegistrationField,
  ShelfItem,
  SwapOffer,
  VenueCheckin,
  VenueDetail,
  VenueNote,
  VenueOfTheWeek,
} from "@/lib/types";

/**
 * Kitapmeetup — demo/önizleme verisi.
 *
 * Supabase bağlanmadığı sürece (bkz. src/lib/env.ts) uygulamanın tamamı bu
 * dosyadaki verilerle çalışır. İçerik kurgusaldır; eski kitapmeetup.com
 * topluluğunun havasını yansıtsın diye özenle yazıldı.
 */

const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);
const daysFromNow = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

// ─────────────────────────────────────────────────────────────────────────
// YAZARLAR / ÜYELER
// ─────────────────────────────────────────────────────────────────────────
export const AUTHORS: Record<string, AuthorSummary> = {
  elif_yalcin: {
    id: "u_elif",
    username: "elif_yalcin",
    fullName: "Elif Yalçın",
    bio: "Kitapmeetup'ın eski günlerinden beri buradayım. Felsefe ve post-apokaliptik kurgu okurum.",
    avatarColor: "#F0611F",
    city: "İstanbul",
    birthDate: "1994-03-12",
    gender: "Kadın",
    isAdmin: true,
  },
  baris_k: {
    id: "u_baris",
    username: "baris_k",
    fullName: "Barış Kaya",
    bio: "Bilimkurgu Kulübü moderatörü. Anlatı kadar önsözleri de severim.",
    avatarColor: "#146B62",
    city: "İzmir",
  },
  sude_demir: {
    id: "u_sude",
    username: "sude_demir",
    fullName: "Sude Demir",
    bio: "Şiirle başlayıp felsefeyle bitiririm genelde.",
    avatarColor: "#6F5A94",
    city: "Ankara",
  },
  mert_aydin: {
    id: "u_mert",
    username: "mert_aydin",
    fullName: "Mert Aydın",
    bio: "Distopya Kulübü kurucusu. '1984'ü yılda bir okurum, evet abartıyorum.",
    avatarColor: "#35594D",
    city: "İstanbul",
  },
  zeynep_can: {
    id: "u_zeynep",
    username: "zeynep_can",
    fullName: "Zeynep Can",
    bio: "Akademi'de 'Evrim 101' dersini yürütüyorum. Biyolog, meraklı okur.",
    avatarColor: "#D24915",
    city: "Ankara",
  },
  omer_faruk: {
    id: "u_omer",
    username: "omer_faruk",
    fullName: "Ömer Faruk",
    bio: "Kahve, kitap, biraz da dert.",
    avatarColor: "#B8791B",
    city: "Bursa",
  },
  defne_ipek: {
    id: "u_defne",
    username: "defne_ipek",
    fullName: "Defne İpek",
    bio: "Blogda kitaplar üzerine uzun uzun yazarım.",
    avatarColor: "#C05F82",
    city: "İstanbul",
  },
  can_ozturk: {
    id: "u_can",
    username: "can_ozturk",
    fullName: "Can Öztürk",
    bio: "Yeni katıldım, İzmir'den selamlar.",
    avatarColor: "#3E6C93",
    city: "İzmir",
  },
  yordam_kitap: {
    id: "u_yordam",
    username: "yordam_kitap",
    fullName: "Yordam Kitap",
    bio: "Bağımsız bir yayınevi — felsefe, toplumsal bilim ve çeviri edebiyat basıyoruz. Kitapmeetup topluluğuyla okurlarımıza daha yakın olmak istiyoruz.",
    avatarColor: "#146B62",
    city: "İstanbul",
    accountKind: "publisher",
    publisherWebsite: "https://example.com/yordam-kitap",
  },
};

/** Demo/önizleme modunda "giriş yapmış" gibi davranılan kullanıcı. */
export const DEMO_USER = AUTHORS.elif_yalcin;

const author = (key: keyof typeof AUTHORS) => AUTHORS[key];

// ─────────────────────────────────────────────────────────────────────────
// KİTAPLAR
// ─────────────────────────────────────────────────────────────────────────
export const BOOKS: Record<string, BookSummary> = {
  simyaci: { id: "b_simyaci", title: "Simyacı", author: "Paulo Coelho", spineColor: "#D24915", genre: "Modern Dünya Bestseller" },
  dune: { id: "b_dune", title: "Dune", author: "Frank Herbert", spineColor: "#B8791B", genre: "Bilimkurgu ve Fantastik" },
  bindokuzyuzseksendort: { id: "b_1984", title: "1984", author: "George Orwell", spineColor: "#35594D", genre: "Bilimkurgu ve Fantastik" },
  suc_ve_ceza: { id: "b_sucveceza", title: "Suç ve Ceza", author: "Dostoyevski", spineColor: "#6F5A94", genre: "Dünya Edebiyatı: Rus" },
  kucuk_prens: { id: "b_kucukprens", title: "Küçük Prens", author: "Antoine de Saint-Exupéry", spineColor: "#3E6C93", genre: "Çocuk ve Gençlik Klasikleri" },
  solaris: { id: "b_solaris", title: "Solaris", author: "Stanisław Lem", spineColor: "#146B62", genre: "Bilimkurgu ve Fantastik" },
  sefiller: { id: "b_sefiller", title: "Sefiller", author: "Victor Hugo", spineColor: "#AB3812", genre: "Dünya Edebiyatı: Batı Klasikleri" },
  fahrenheit451: { id: "b_fahrenheit", title: "Fahrenheit 451", author: "Ray Bradbury", spineColor: "#D8481B", genre: "Bilimkurgu ve Fantastik" },
  zerdust: { id: "b_zerdust", title: "Böyle Buyurdu Zerdüşt", author: "Friedrich Nietzsche", spineColor: "#802A11", genre: "Felsefe" },
  zamanin_kisa_tarihi: { id: "b_zaman", title: "Zamanın Kısa Tarihi", author: "Stephen Hawking", spineColor: "#3E6C93", genre: "Popüler Bilim, Psikoloji ve Kişisel Gelişim" },
  donusum: { id: "b_donusum", title: "Dönüşüm", author: "Franz Kafka", spineColor: "#551B0B", genre: "Dünya Edebiyatı: Batı Klasikleri" },
  kurk_mantolu_madonna: { id: "b_kurkmanto", title: "Kürk Mantolu Madonna", author: "Sabahattin Ali", spineColor: "#C05F82", genre: "Türk Edebiyatı: Klasikler" },
};

const book = (key: keyof typeof BOOKS) => BOOKS[key];

// ─────────────────────────────────────────────────────────────────────────
// KULÜPLER
// ─────────────────────────────────────────────────────────────────────────
export const CLUBS: ClubDetail[] = [
  {
    id: "c_felsefe",
    slug: "felsefe-kulubu",
    name: "Felsefe Kulübü",
    icon: "🦉",
    color: "var(--club-felsefe)",
    description:
      "Sokratik sorulardan varoluşçuluğa, her ay bir düşünürün ya da metnin peşine düşüyoruz. Ön okuma şart değil, merak yeter.",
    memberCount: 5,
    createdBy: author("sude_demir"),
    members: [author("sude_demir"), author("elif_yalcin"), author("omer_faruk"), author("zeynep_can"), author("can_ozturk")],
    currentBooks: [book("zerdust"), book("suc_ve_ceza")],
    pinnedBook: book("zerdust"),
    pinnedBookNote: "Bu ay boyunca birlikte okuyoruz, her hafta yeni bir bölüm tartışıyoruz.",
    pinnedBookSetAt: daysAgo(10),
    readThreads: [
      { id: "th1", title: "1-3. Bölümler: Zerdüşt'ün İnişi", createdAt: daysAgo(8), createdBy: author("sude_demir"), commentCount: 2 },
      { id: "th2", title: "4-6. Bölümler: Erdem Üzerine", createdAt: daysAgo(3), createdBy: author("elif_yalcin"), commentCount: 0 },
    ],
  },
  {
    id: "c_bilimkurgu",
    slug: "bilimkurgu-kulubu",
    name: "Bilimkurgu Kulübü",
    icon: "🛰️",
    color: "var(--club-bilimkurgu)",
    description:
      "Uzak galaksilerden yapay zekaya, tekno-distopyalardan ütopyalara — bilimkurgunun bugünümüze ne söylediğini konuşuyoruz.",
    memberCount: 4,
    createdBy: author("baris_k"),
    members: [author("baris_k"), author("elif_yalcin"), author("can_ozturk"), author("omer_faruk")],
    currentBooks: [book("dune"), book("solaris")],
    pinnedBook: book("dune"),
    pinnedBookNote: "Kum, baharat, kehanet... Herbert'in başyapıtına birlikte dalıyoruz.",
    pinnedBookSetAt: daysAgo(15),
    readThreads: [
      { id: "th3", title: "Birinci Kitap: Dune", createdAt: daysAgo(12), createdBy: author("baris_k"), commentCount: 1 },
    ],
  },
  {
    id: "c_siir",
    slug: "siir-kulubu",
    name: "Şiir Kulübü",
    icon: "🖋️",
    color: "var(--club-siir)",
    description: "Dizeler üzerine sohbet, açık mikrofon geceleri ve karşılıklı sesli okuma seansları.",
    memberCount: 3,
    createdBy: author("defne_ipek"),
    members: [author("defne_ipek"), author("sude_demir"), author("zeynep_can")],
    currentBooks: [book("kurk_mantolu_madonna")],
    readThreads: [],
  },
  {
    id: "c_distopya",
    slug: "distopya-kulubu",
    name: "Distopya Kulübü",
    icon: "🕯️",
    color: "var(--club-distopya)",
    description: "Karanlık kurgusal gelecekler üzerinden bugünü okumaya çalışıyoruz. İyimserlere de kapımız açık.",
    memberCount: 4,
    createdBy: author("mert_aydin"),
    members: [author("mert_aydin"), author("baris_k"), author("defne_ipek"), author("elif_yalcin")],
    currentBooks: [book("bindokuzyuzseksendort"), book("fahrenheit451")],
    readThreads: [],
  },
];

export const getClubBySlug = (slug: string) => CLUBS.find((c) => c.slug === slug) ?? null;

// ─────────────────────────────────────────────────────────────────────────
// RAF / "NE OKUYORUM"
// ─────────────────────────────────────────────────────────────────────────
export const SHELVES: Record<string, ShelfItem[]> = {
  elif_yalcin: [
    { id: "s1", status: "reading", book: book("zerdust"), note: "Zerdüşt'ün dağdan inişini üçüncü kez okuyorum." },
    { id: "s2", status: "read", rating: 5, book: book("bindokuzyuzseksendort") },
    { id: "s3", status: "want", book: book("solaris") },
  ],
  baris_k: [
    { id: "s4", status: "reading", book: book("dune") },
    { id: "s5", status: "read", rating: 4, book: book("fahrenheit451") },
    { id: "s6", status: "want", book: book("zamanin_kisa_tarihi") },
  ],
  sude_demir: [
    { id: "s7", status: "reading", book: book("kurk_mantolu_madonna") },
    { id: "s8", status: "read", rating: 5, book: book("zerdust") },
  ],
  mert_aydin: [
    { id: "s9", status: "reading", book: book("bindokuzyuzseksendort"), note: "Yılın kaçıncı okuyuşu saymıyorum artık." },
    { id: "s10", status: "read", rating: 5, book: book("fahrenheit451") },
    { id: "s11", status: "want", book: book("donusum") },
  ],
  zeynep_can: [
    { id: "s12", status: "reading", book: book("zamanin_kisa_tarihi") },
    { id: "s13", status: "read", rating: 4, book: book("dune") },
    { id: "s13b", status: "read", rating: 5, book: book("bindokuzyuzseksendort") },
  ],
  omer_faruk: [
    { id: "s14", status: "reading", book: book("simyaci") },
    { id: "s15", status: "want", book: book("sefiller") },
    { id: "s15b", status: "reading", book: book("zerdust"), note: "Elif'in tavsiyesiyle başladım." },
  ],
  defne_ipek: [
    { id: "s16", status: "read", rating: 5, book: book("kurk_mantolu_madonna"), note: "Yılın kitabı, tartışmasız." },
    { id: "s17", status: "reading", book: book("suc_ve_ceza") },
  ],
  can_ozturk: [
    { id: "s18", status: "want", book: book("dune") },
    { id: "s19", status: "reading", book: book("kucuk_prens") },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// AKIŞ GÖNDERİLERİ
// ─────────────────────────────────────────────────────────────────────────
export const POSTS: FeedPost[] = [
  {
    id: "p_yordam1",
    type: "text",
    body: "Merhaba Kitapmeetup topluluğu! 📚 Yeni çıkan çeviri kitabımız için önümüzdeki ay bir imza günü + sohbet buluşması planlıyoruz. Felsefe Kulübü ile de bir okuma önerisi üzerinde konuşuyoruz — takipte kalın.",
    author: author("yordam_kitap"),
    createdAt: hoursAgo(1),
    likeCount: 7,
    commentCount: 1,
    likedByMe: false,
  },
  {
    id: "p1",
    type: "quote",
    body: "\"İnsan, aştığı bir şeydir.\"",
    author: author("sude_demir"),
    club: CLUBS[0],
    book: book("zerdust"),
    createdAt: hoursAgo(2),
    likeCount: 12,
    commentCount: 3,
    likedByMe: false,
  },
  {
    id: "p2",
    type: "question",
    body: "Bitirmeden bırakamadığınız son kitap hangisiydi? Ben Dune'u 2 günde bitirdim, hâlâ çölden çıkamadım.",
    author: author("baris_k"),
    club: CLUBS[1],
    createdAt: hoursAgo(5),
    likeCount: 18,
    commentCount: 9,
    likedByMe: true,
  },
  {
    id: "p3",
    type: "photo",
    body: "Bugünkü okuma köşem ☕📖 — Kürk Mantolu Madonna'ya üçüncü kez başladım.",
    author: author("defne_ipek"),
    book: book("kurk_mantolu_madonna"),
    photoColor: "#C05F82",
    createdAt: hoursAgo(9),
    likeCount: 24,
    commentCount: 5,
    likedByMe: false,
  },
  {
    id: "p4",
    type: "text",
    body: "Yarınki Nietzsche gecesine son 3 kontenjan kaldı, kaçırmayın! Kadıköy'de sıcacık bir mekandayız.",
    author: author("elif_yalcin"),
    club: CLUBS[0],
    createdAt: hoursAgo(14),
    likeCount: 9,
    commentCount: 2,
    likedByMe: false,
  },
  {
    id: "p5",
    type: "quote",
    body: "\"Büyükler hiçbir şeyi kendi kendilerine anlayamazlar; çocuklara ise durmadan açıklamak yapmak, onları bezdirir.\"",
    author: author("can_ozturk"),
    book: book("kucuk_prens"),
    createdAt: daysAgo(1),
    likeCount: 15,
    commentCount: 1,
    likedByMe: false,
  },
  {
    id: "p6",
    type: "text",
    body: "1984 vs Fahrenheit 451 tartışmasına hazırlanıyorum. İkisini de tekrar okuyan var mı, notlarınızı kapıştım gelirim.",
    author: author("mert_aydin"),
    club: CLUBS[3],
    createdAt: daysAgo(1),
    likeCount: 11,
    commentCount: 6,
    likedByMe: true,
  },
  {
    id: "p7",
    type: "question",
    body: "Bir yazarla akşam yemeği yiyebilseydiniz kimi seçerdiniz? Ben Calvino derim, masada anlattığı hikaye bitmez sanki.",
    author: author("zeynep_can"),
    createdAt: daysAgo(2),
    likeCount: 21,
    commentCount: 14,
    likedByMe: false,
  },
  {
    id: "p8",
    type: "photo",
    body: "Kulüp rafımız büyüyor 📚 Bu ay Solaris ve Dune yan yana duruyor.",
    author: author("baris_k"),
    club: CLUBS[1],
    photoColor: "#146B62",
    createdAt: daysAgo(3),
    likeCount: 17,
    commentCount: 4,
    likedByMe: false,
  },
  {
    id: "p9",
    type: "text",
    body: "Evrim 101'in 3. dersi bugün yayında — ortak atalar ve filogenetik ağaçlar. Sorularınızı ders altına bırakabilirsiniz.",
    author: author("zeynep_can"),
    createdAt: daysAgo(4),
    likeCount: 26,
    commentCount: 7,
    likedByMe: false,
  },
  {
    id: "p10",
    type: "quote",
    body: "\"Suçun cezası, işlendiği andan itibaren başlar.\"",
    author: author("omer_faruk"),
    book: book("suc_ve_ceza"),
    createdAt: daysAgo(5),
    likeCount: 8,
    commentCount: 0,
    likedByMe: false,
  },
  {
    id: "p11",
    type: "takas",
    body: "Bu kitabı okudum, bayıldım ama artık rafımda yer kaplıyor. Karşılığında bilimkurgu ya da felsefe türünde bir şey ararım.",
    author: author("can_ozturk"),
    book: book("sefiller"),
    createdAt: hoursAgo(6),
    likeCount: 5,
    commentCount: 0,
    likedByMe: false,
    offerCount: 2,
    myOfferStatus: null,
  },
  {
    id: "p12",
    type: "takas_arama",
    body: "Uzun zamandır arıyorum, hiçbir yerde bulamadım. Kimde varsa çok sevinirim.",
    author: author("sude_demir"),
    book: book("donusum"),
    counterBook: book("kucuk_prens"),
    createdAt: hoursAgo(10),
    likeCount: 3,
    commentCount: 0,
    likedByMe: false,
    offerCount: 1,
    myOfferStatus: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────
// KİTAP TAKASI TEKLİFLERİ
// ─────────────────────────────────────────────────────────────────────────
export const SWAP_OFFERS: Record<string, SwapOffer[]> = {
  p11: [
    { id: "so1", book: book("dune"), message: "Dune'umu verebilirim, çok temiz durumda.", status: "pending", createdAt: hoursAgo(4), offerer: author("baris_k") },
    { id: "so2", book: book("zerdust"), message: "Zerdüşt'ü takas eder misin?", status: "pending", createdAt: hoursAgo(2), offerer: author("sude_demir") },
  ],
  p12: [
    { id: "so3", book: book("donusum"), message: "Bende var, sana verebilirim! Küçük Prens'i de severim, takas olur.", status: "pending", createdAt: hoursAgo(7), offerer: author("defne_ipek") },
  ],
};

export const COMMENTS: Record<string, CommentItem[]> = {
  p1: [
    { id: "cm1", body: "Bu satırı okuyalı beri kafamdan çıkmıyor.", author: author("elif_yalcin"), createdAt: hoursAgo(1) },
    { id: "cm2", body: "Zerdüşt'ü ilk okuduğumda anlamamıştım, şimdi çok farklı okuyorum.", author: author("omer_faruk"), createdAt: hoursAgo(1) },
  ],
  p2: [
    { id: "cm3", body: "Benimki Solaris oldu, bir gecede bitirdim.", author: author("can_ozturk"), createdAt: hoursAgo(4) },
    { id: "cm4", body: "Dune'u bitirince Mesih'i de mutlaka oku.", author: author("elif_yalcin"), createdAt: hoursAgo(3) },
  ],
  th1: [
    { id: "cm5", body: "Dağdan iniş sahnesi beni her okuyuşta farklı bir yere götürüyor.", author: author("elif_yalcin"), createdAt: daysAgo(7) },
    { id: "cm6", body: "'Üstinsan' kavramını ilk kez burada gerçekten anladım galiba.", author: author("omer_faruk"), createdAt: daysAgo(6) },
  ],
  th3: [
    { id: "cm7", body: "Paul'un Arrakis'e ayak basışı fena tüylerimi diken diken etti.", author: author("elif_yalcin"), createdAt: daysAgo(11) },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// ETKİNLİKLER
// ─────────────────────────────────────────────────────────────────────────
export const EVENTS: EventSummary[] = [
  {
    id: "e1",
    slug: "felsefe-kulubu-nietzsche-gecesi",
    title: "Felsefe Kulübü: Nietzsche Gecesi",
    description:
      "Böyle Buyurdu Zerdüşt üzerine sohbet ediyoruz. Kitabı bitirmemiş olmak katılmaya engel değil — meraklı gelen herkese kapımız açık.",
    club: CLUBS[0],
    locationName: "Kadıköy, Moda — Sayfa Kahve",
    isOnline: false,
    startsAt: daysFromNow(4),
    endsAt: daysFromNow(4),
    capacity: 20,
    goingCount: 14,
    interestedCount: 6,
    createdBy: author("elif_yalcin"),
  },
  {
    id: "e2",
    slug: "bilimkurgu-kulubu-dune-tartismasi",
    title: "Bilimkurgu Kulübü: Dune Tartışması",
    description: "Dune'un ilk kitabını konuşuyoruz — çöl, güç, kehanet ve tabii ki solucanlar.",
    club: CLUBS[1],
    isOnline: true,
    locationUrl: "https://meet.example.com/kitapmeetup-dune",
    startsAt: daysFromNow(2),
    endsAt: daysFromNow(2),
    goingCount: 22,
    interestedCount: 11,
    createdBy: author("baris_k"),
  },
  {
    id: "e3",
    slug: "kitapmeetup-buyuk-piknik",
    title: "Aylık Büyük Buluşma: Kitapmeetup Pikniği",
    description: "Tüm kulüpler bir araya geliyor. Battaniyeni, kitabını ve biraz atıştırmalık getir yeter.",
    club: null,
    locationName: "Maçka Parkı, İstanbul",
    isOnline: false,
    startsAt: daysFromNow(14),
    capacity: 60,
    goingCount: 38,
    interestedCount: 20,
    createdBy: author("elif_yalcin"),
  },
  {
    id: "e4",
    slug: "distopya-kulubu-1984-fahrenheit",
    title: "Distopya Kulübü: 1984 vs Fahrenheit 451",
    description: "İki klasik distopyayı karşılaştırıyoruz: sansür mü, gözetim mi daha ürkütücü?",
    club: CLUBS[3],
    locationName: "Beşiktaş — Kütüphane Sokak",
    isOnline: false,
    startsAt: daysFromNow(20),
    capacity: 25,
    goingCount: 16,
    interestedCount: 9,
    createdBy: author("mert_aydin"),
  },
  {
    id: "e5",
    slug: "siir-kulubu-acik-mikrofon",
    title: "Şiir Kulübü: Açık Mikrofon Gecesi",
    description: "Kendi şiirini oku, sevdiğin bir şairden dize paylaş — mikrofon herkese açık.",
    club: CLUBS[2],
    locationName: "Cihangir — Dize Kıraathanesi",
    isOnline: false,
    startsAt: daysFromNow(10),
    capacity: 30,
    goingCount: 19,
    interestedCount: 12,
    createdBy: author("defne_ipek"),
  },
  {
    id: "e6",
    slug: "felsefe-kulubu-varolusculuk-101",
    title: "Felsefe Kulübü: Varoluşçuluk 101 Sohbeti",
    description: "Sartre, Camus ve 'özgürlüğe mahkumiyet' üzerine giriş seviyesinde bir sohbet yaptık.",
    club: CLUBS[0],
    locationName: "Kadıköy, Moda — Sayfa Kahve",
    isOnline: false,
    startsAt: daysAgo(30),
    goingCount: 17,
    interestedCount: 4,
    createdBy: author("sude_demir"),
  },
];

export const getEventBySlug = (slug: string) => EVENTS.find((e) => e.slug === slug) ?? null;

/** Hangi kullanıcı adının hangi etkinliğe "gidiyorum" dediği — Kitap Eşleşmeleri'ndeki
 * "O da bu etkinliğe gidiyor" teşviki için demo verisi. */
export const EVENT_ATTENDEES: Record<string, string[]> = {
  e1: ["elif_yalcin", "sude_demir", "mert_aydin", "omer_faruk", "can_ozturk"],
  e2: ["elif_yalcin", "can_ozturk", "omer_faruk", "zeynep_can"],
  e3: ["sude_demir", "mert_aydin", "zeynep_can", "defne_ipek"],
  e4: ["baris_k", "defne_ipek"],
  e5: ["zeynep_can", "defne_ipek"],
};

/**
 * Etkinlik kayıt formu (organizatörün tanımladığı sorular) — örnek olsun
 * diye tek bir etkinlikte (Kitapmeetup Pikniği) dolu, diğerlerinde boş.
 */
export const EVENT_REGISTRATION_FIELDS: Record<string, RegistrationField[]> = {
  e3: [
    { id: "rf1", label: "Getirebileceğin bir atıştırmalık var mı?", fieldType: "text", options: [], required: false, orderIndex: 0 },
    { id: "rf2", label: "Battaniyen var mı?", fieldType: "select", options: ["Evet, getiririm", "Hayır, paylaşırım olur mu?"], required: true, orderIndex: 1 },
  ],
};

const EVENT_REGISTRANT_ANSWERS: Record<string, Record<string, { fieldId: string; value: string }[]>> = {
  e3: {
    sude_demir: [
      { fieldId: "rf1", value: "Ev yapımı limonata getiririm!" },
      { fieldId: "rf2", value: "Evet, getiririm" },
    ],
    mert_aydin: [
      { fieldId: "rf1", value: "Kurabiye" },
      { fieldId: "rf2", value: "Hayır, paylaşırım olur mu?" },
    ],
    zeynep_can: [{ fieldId: "rf2", value: "Evet, getiririm" }],
    defne_ipek: [{ fieldId: "rf2", value: "Hayır, paylaşırım olur mu?" }],
  },
};

export function getFixtureEventRegistrants(eventId: string): EventRegistrant[] {
  const usernames = EVENT_ATTENDEES[eventId] ?? [];
  const fields = EVENT_REGISTRATION_FIELDS[eventId] ?? [];
  const fieldLabels = new Map(fields.map((f) => [f.id, f.label]));
  return usernames
    .map((username, i) => {
      const user = AUTHORS[username];
      if (!user) return null;
      const rawAnswers = EVENT_REGISTRANT_ANSWERS[eventId]?.[username] ?? [];
      const answers = rawAnswers.map((a) => ({ fieldId: a.fieldId, label: fieldLabels.get(a.fieldId) ?? "", value: a.value }));
      return { user, registeredAt: hoursAgo(3 + i * 7), answers };
    })
    .filter((r): r is EventRegistrant => Boolean(r));
}

// ─────────────────────────────────────────────────────────────────────────
// AKADEMİ
// ─────────────────────────────────────────────────────────────────────────
export const COURSES: CourseDetail[] = [
  {
    id: "ac_evrim101",
    slug: "evrim-101",
    title: "Evrim 101",
    subtitle: "Doğal seçilimden ortak atalara",
    description:
      "Evrimi lise korkularından arındırıp, meraklı her okurun anlayabileceği şekilde anlatan giriş düzeyinde bir seri.",
    level: "giriş",
    cadence: "haftalık",
    color: "var(--orange-500)",
    lessonCount: 5,
    enrolledCount: 41,
    isEnrolled: true,
    nextSessionAt: daysFromNow(2),
    lessons: [
      { id: "l1", slug: "evrim-nedir", title: "Evrim Nedir, Ne Değildir?", orderIndex: 1, durationMinutes: 12, content: "Evrim, popüler kültürde sıkça yanlış anlaşılan bir kavram...\n\nBu derste evrimin ne olduğunu ve **ne olmadığını** netleştiriyoruz: 'sadece bir teori' söylemi, 'ilerleme' yanılgısı ve maymun-insan çizgisi efsanesi.", completed: true, startsAt: daysAgo(14), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders1", goingCount: 38, interestedCount: 5 },
      { id: "l2", slug: "dogal-secilim", title: "Doğal Seçilim ve Uyum", orderIndex: 2, durationMinutes: 15, content: "Darwin'in en temel fikri: farklı üreme başarısı. Bu derste doğal seçilimi somut örneklerle (güve kanatları, antibiyotik direnci) ele alıyoruz.", completed: true, startsAt: daysAgo(7), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders2", goingCount: 35, interestedCount: 4 },
      { id: "l3", slug: "ortak-atalar", title: "Ortak Atalar ve Filogenetik Ağaçlar", orderIndex: 3, durationMinutes: 14, content: "Tüm yaşam neden tek bir ağaçla temsil edilebilir? Filogenetik ağaçların nasıl okunacağını öğreniyoruz.", completed: false, startsAt: daysFromNow(2), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders3", goingCount: 22, interestedCount: 9, myRsvp: "going" },
      { id: "l4", slug: "insanin-evrimi", title: "İnsanın Evrimi: Kısa Bir Tur", orderIndex: 4, durationMinutes: 18, content: "Homo cinsinin kısa tarihi ve bugünkü türümüze uzanan yol.", completed: false, startsAt: daysFromNow(9), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders4", goingCount: 14, interestedCount: 6 },
      { id: "l5", slug: "yanlis-anlamalar", title: "Yaygın Yanlış Anlamalar", orderIndex: 5, durationMinutes: 10, content: "'Eğer maymundan geldiysek neden hâlâ maymun var?' gibi sık sorulan soruları yanıtlıyoruz.", completed: false, startsAt: daysFromNow(16), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders5", goingCount: 8, interestedCount: 3 },
    ],
  },
  {
    id: "ac_felsefe101",
    slug: "felsefeye-giris-101",
    title: "Felsefeye Giriş 101",
    subtitle: "Sorularla başlayan bir yolculuk",
    description: "Felsefeyi akademik jargondan arındırıp günlük sorularla başlatan bir giriş serisi.",
    level: "giriş",
    cadence: "haftalık",
    color: "var(--club-felsefe)",
    lessonCount: 4,
    enrolledCount: 33,
    isEnrolled: false,
    nextSessionAt: daysFromNow(4),
    lessons: [
      { id: "l6", slug: "felsefe-nedir", title: "Felsefe Nedir?", orderIndex: 1, durationMinutes: 10, content: "Felsefe, sorulması 'garip' görünen soruları ciddiye almaktır. Bu derste felsefenin ne işe yaradığını konuşuyoruz.", startsAt: daysAgo(10), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20, goingCount: 18, interestedCount: 4 },
      { id: "l7", slug: "bilgi-kurami", title: "Bilgi Kuramına Giriş", orderIndex: 2, durationMinutes: 13, content: "Bir şeyi 'bildiğimizi' nasıl biliriz? Epistemolojiye kısa bir giriş.", startsAt: daysAgo(3), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20, goingCount: 16, interestedCount: 3 },
      { id: "l8", slug: "etik-iyi-nedir", title: "Etik: İyi Nedir?", orderIndex: 3, durationMinutes: 14, content: "Fayda mı, ödev mi, erdem mi? Üç büyük etik yaklaşıma hızlı bir bakış.", startsAt: daysFromNow(4), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20, goingCount: 12, interestedCount: 5 },
      { id: "l9", slug: "varolusculuk-101", title: "Varoluşçuluk 101", orderIndex: 4, durationMinutes: 16, content: "'Varoluş özden önce gelir' ne demek? Sartre ve Camus üzerinden kısa bir tur.", startsAt: daysFromNow(11), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20, goingCount: 7, interestedCount: 2 },
    ],
  },
  {
    id: "ac_distopya101",
    slug: "distopya-edebiyati-101",
    title: "Distopya Edebiyatına Giriş",
    subtitle: "Karanlık geleceklerden bugüne bakmak",
    description: "Distopya türünün kökenlerinden bugünün örneklerine kısa ve derli toplu bir tur.",
    level: "orta",
    cadence: "aylık",
    color: "var(--club-distopya)",
    lessonCount: 3,
    enrolledCount: 27,
    isEnrolled: false,
    nextSessionAt: daysFromNow(10),
    lessons: [
      { id: "l10", slug: "distopyanin-kokenleri", title: "Distopyanın Kökenleri", orderIndex: 1, durationMinutes: 11, content: "Ütopyadan distopyaya: tür nasıl doğdu?", startsAt: daysAgo(20), isOnline: true, locationUrl: "https://meet.example.com/distopya-101-ders1", goingCount: 21, interestedCount: 6 },
      { id: "l11", slug: "1984-totaliter-kurgu", title: "1984 ve Totaliter Kurgu", orderIndex: 2, durationMinutes: 15, content: "Orwell'in gözetim toplumu tasviri bugün nasıl okunmalı?", startsAt: daysFromNow(10), isOnline: true, locationUrl: "https://meet.example.com/distopya-101-ders2", goingCount: 15, interestedCount: 8 },
      { id: "l12", slug: "bugunun-distopyalari", title: "Bugünün Distopyaları", orderIndex: 3, durationMinutes: 13, content: "Algoritmalar, veri ve rıza: güncel distopik kurgu neyi konuşuyor?", startsAt: daysFromNow(40), isOnline: true, locationUrl: "https://meet.example.com/distopya-101-ders3", goingCount: 6, interestedCount: 2 },
    ],
  },
];

export const getCourseBySlug = (slug: string) => COURSES.find((c) => c.slug === slug) ?? null;

// ─────────────────────────────────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────────────────────────────────
export const BLOG_POSTS: BlogPostDetail[] = [
  {
    id: "bl1",
    slug: "kurk-mantolu-madonna-uzerine",
    title: "Kürk Mantolu Madonna Üzerine: Sessizliğin Sesi",
    summary: "Sabahattin Ali'nin az konuşan kahramanı, aslında en çok o mu anlatıyor?",
    color: "#C05F82",
    tags: ["inceleme", "türk edebiyatı"],
    author: author("defne_ipek"),
    publishedAt: daysAgo(2),
    readMinutes: 6,
    body: `Kürk Mantolu Madonna'yı üçüncü kez okudum ve her seferinde Raif Efendi'nin sessizliğinde yeni bir şey buluyorum.

## Sessizliğin dili

Raif Efendi, romanın neredeyse tamamında pasif, geri planda bir karakter olarak durur. Ama bu pasiflik, aslında bir savunma mekanizması — kırılganlığını gizlemenin tek yolu.

## Maria Puder'in aynası

Maria, Raif'in içindeki söylenmemiş her şeyi ortaya çıkaran bir ayna gibi işlev görüyor. Onunla geçirdiği kısa süre, kitabın geri kalanının neden bu kadar "az" olduğunu açıklıyor.

Sizce sessiz karakterler mi, yoksa çok konuşan karakterler mi daha çok şey anlatıyor?`,
  },
  {
    id: "bl2",
    slug: "bir-kahve-bir-kitap-okuma-rutinim",
    title: "Bir Kahve, Bir Kitap: Okuma Rutinim",
    summary: "Günde 20 sayfa okumak için kendime nasıl bir ritüel kurdum.",
    color: "#B8791B",
    tags: ["günlük", "okuma alışkanlığı"],
    author: author("omer_faruk"),
    publishedAt: daysAgo(5),
    readMinutes: 4,
    body: `İki yıl önce "okuyamıyorum" diyip duruyordum. Sorun zamanım değildi, rutinimdi.

## Ne değiştirdim

- Telefonu başka odaya bırakmak
- Her gün aynı saatte, aynı koltukta okumak
- Bitirmek zorunda olmadığımı kabul etmek

Şimdi günde en az 20 sayfa okuyorum, bazen fark etmeden 50'yi buluyorum.`,
  },
  {
    id: "bl3",
    slug: "evrim-101i-neden-actim",
    title: "Evrim 101'i Neden Açtım",
    summary: "Akademi'deki ilk dersimin arka planı.",
    color: "#D24915",
    tags: ["akademi", "bilim"],
    author: author("zeynep_can"),
    publishedAt: daysAgo(9),
    readMinutes: 5,
    body: `Kitapmeetup'ta herkesin bir konuda "101" anlatabileceği bir alan olsun istedik. Benim alanım biyoloji, ve evrim üzerine en çok yanlış anlaşılan kavramları düzeltmek istedim.

Dersleri kısa tutmaya özen gösteriyorum — amaç uzmanlaşmak değil, meraklanmak.`,
  },
  {
    id: "bl4",
    slug: "neden-hala-1984-okuyoruz",
    title: "Neden Hâlâ 1984 Okuyoruz?",
    summary: "Bir distopya klasiği, yayınlandığı yıldan bu yana neden hâlâ güncel?",
    color: "#35594D",
    tags: ["distopya", "inceleme"],
    author: author("mert_aydin"),
    publishedAt: daysAgo(12),
    readMinutes: 7,
    body: `1984'ü her okuduğumda, "bu sefer eskimiş bulacağım" diye düşünüyorum. Hiç olmuyor.

## Gözetimin biçimi değişti, kaygısı değişmedi

Orwell'in tele-ekranları bugün cebimizde. Ama kitabın asıl korkuttuğu şey teknoloji değil, dilin ve hafızanın nasıl bükülebildiği.`,
  },
  {
    id: "bl5",
    slug: "siirle-felsefe-arasinda",
    title: "Şiirle Felsefe Arasında",
    summary: "İki farklı düşünme biçimi, aslında sandığımızdan daha yakın.",
    color: "#6F5A94",
    tags: ["şiir", "felsefe"],
    author: author("sude_demir"),
    publishedAt: daysAgo(16),
    readMinutes: 5,
    body: `Felsefe soruyu netleştirir, şiir soruyu hissettirir. İkisi de aynı yere gidiyor bence: dikkatle bakmaya.

Bir dizeyi bir önerme gibi, bir önermeyi bir dize gibi okumayı deneyin — çok şey değişiyor.`,
  },
];

export const getBlogPostBySlug = (slug: string) => BLOG_POSTS.find((b) => b.slug === slug) ?? null;

// ─────────────────────────────────────────────────────────────────────────
// GÜNÜN SORUSU
// ─────────────────────────────────────────────────────────────────────────
export const DAILY_PROMPTS: string[] = [
  "Bitirmeden bırakamadığın son kitap hangisiydi?",
  "Bir kitap karakteriyle bir günlüğüne yer değiştirebilseydin, kimi seçerdin?",
  "Sana en çok 'bunu ben de yaşadım' dedirten kitap hangisiydi?",
  "Hangi kitabı herkesin okumasını istersin?",
  "En sevdiğin ilk cümle hangi kitaba ait?",
  "Bir kitabı yarım bıraktın mı hiç? Neden?",
  "Kitapları nasıl seçiyorsun: kapak mı, konu mu, tavsiye mi?",
  "Yeniden okuduğunda hep farklı bir şey bulduğun bir kitap var mı?",
  "Bir yazarla akşam yemeği yiyebilseydin kimi seçerdin?",
  "En sevdiğin distopya hangisi, neden?",
  "Şiirle aran nasıl?",
  "Bir kitabı filme uyarlasan hangisi olurdu?",
  "Kitaplığındaki en eski kitap hangisi?",
  "Felsefe kitapları seni hayattan mı koparır, hayata mı bağlar?",
  "Bir kitap alıntısını dövme yaptırsan hangisi olurdu?",
  "Bu ay okuma hedefin nedir?",
];

/** Gün-of-year bazlı, herkesin aynı anda gördüğü döngüsel "Günün Sorusu". */
export function getTodaysPrompt(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}

export function allAuthors(): AuthorSummary[] {
  return Object.values(AUTHORS);
}

export function getAuthorByUsername(username: string): AuthorSummary | null {
  return AUTHORS[username] ?? Object.values(AUTHORS).find((a) => a.username === username) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────
// DOĞRUDAN MESAJLAR (Kitap Eşleşmeleri'nden başlayan sohbetler)
// ─────────────────────────────────────────────────────────────────────────

/** İki kullanıcı adını sıralı birleştirip aynı sohbetin her iki taraftan da bulunmasını sağlar. */
export function conversationKey(usernameA: string, usernameB: string): string {
  return [usernameA, usernameB].sort().join("|");
}

export const DIRECT_MESSAGES: Record<string, MessageItem[]> = {
  [conversationKey("elif_yalcin", "sude_demir")]: [
    { id: "dm1", senderId: AUTHORS.sude_demir.id, body: "Zerdüşt'ü okurken en çok hangi bölüm etkiledi seni?", createdAt: daysAgo(1) },
    { id: "dm2", senderId: AUTHORS.elif_yalcin.id, body: "Ebedi dönüş kısmı beni çok sarstı, sen?", createdAt: hoursAgo(20) },
    { id: "dm3", senderId: AUTHORS.sude_demir.id, body: "Aynen! Ben de üçüncü kez okuyorum galiba o yüzden :) Nietzsche gecesinde konuşuruz.", createdAt: hoursAgo(18) },
  ],
  [conversationKey("elif_yalcin", "mert_aydin")]: [
    { id: "dm4", senderId: AUTHORS.mert_aydin.id, body: "1984'e nasıl başladın, sen de mi tekrar okuyorsun?", createdAt: hoursAgo(6) },
  ],
};

export function getConversation(usernameA: string, usernameB: string): MessageItem[] {
  return DIRECT_MESSAGES[conversationKey(usernameA, usernameB)] ?? [];
}

// ─────────────────────────────────────────────────────────────────────────
// YILLIK OKUMA HEDEFİ + DAVETLER
// ─────────────────────────────────────────────────────────────────────────

/** Kullanıcı adı -> o yılki hedef kitap sayısı. Tamamlanan sayı SHELVES'ten anlık hesaplanır. */
export const READING_GOALS: Record<string, number> = {
  elif_yalcin: 24,
  baris_k: 30,
  mert_aydin: 18,
};

/** Kullanıcı adı -> kaç kişiyi Kitapmeetup'a davet ettiği (referred_by sayacının demo karşılığı). */
export const REFERRAL_COUNTS: Record<string, number> = {
  elif_yalcin: 3,
  sude_demir: 1,
};

// ─────────────────────────────────────────────────────────────────────────
// MEKANLAR — İstanbul'daki kitapçı / kitap kafe / okumaya uygun kafeler
// ─────────────────────────────────────────────────────────────────────────

function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const RAW_VENUES = [
  {
    id: "v1",
    slug: "turk-alman-kitabevi",
    name: "Türk Alman Kitabevi & Cafe",
    district: "Beyoğlu",
    kind: "kitap_kafe" as const,
    description: "1955'ten beri İstiklal Caddesi'nde; Türkçe, Almanca ve İngilizce kitaplar iki katlı, sakin bir kafenin içine yayılıyor.",
    mapsQuery: "Türk Alman Kitabevi Beyoğlu İstanbul",
    addedBy: "elif_yalcin" as const,
  },
  {
    id: "v2",
    slug: "salt-galata",
    name: "SALT Galata",
    district: "Beyoğlu",
    kind: "okuma_dostu_kafe" as const,
    description: "Tarihi bina, geniş kütüphanesi ve huzurlu atmosferiyle uzun uzun oturup okumak/çalışmak için sevilen bir mekan.",
    mapsQuery: "SALT Galata İstanbul",
    addedBy: "baris_k" as const,
  },
  {
    id: "v3",
    slug: "akademi-kitabevi",
    name: "Akademi Kitabevi",
    district: "Kadıköy",
    kind: "kitap_kafe" as const,
    description: "Kadıköy'ün köklü kitap kafelerinden — uzun raflar arasında zaman kaybediyorsunuz, kulüp buluşmaları için de uygun.",
    mapsQuery: "Akademi Kitabevi Kadıköy İstanbul",
    addedBy: "sude_demir" as const,
  },
  {
    id: "v4",
    slug: "tasarim-bookshop-cafe",
    name: "Tasarım Bookshop and Cafe",
    district: "Kadıköy (Moda)",
    kind: "kitap_kafe" as const,
    description: "Moda'da, tasarım ve sanat kitaplarına ağırlık veren; mimarların/sanatçıların uğrak noktası bir kitap kafe.",
    mapsQuery: "Tasarım Bookshop and Cafe Moda İstanbul",
    addedBy: "defne_ipek" as const,
  },
  {
    id: "v5",
    slug: "mephisto-kitabevi-kadikoy",
    name: "Mephisto Kitabevi",
    district: "Kadıköy",
    kind: "kitapci" as const,
    description: "İstiklal, Beşiktaş ve Kadıköy şubeleriyle tanınan, geniş yelpazeli bir kitapçı zinciri.",
    mapsQuery: "Mephisto Kitabevi Kadıköy İstanbul",
    addedBy: "can_ozturk" as const,
  },
];

const VENUE_NOTES_RAW: Record<string, { id: string; authorKey: keyof typeof AUTHORS; rating: number | null; body: string; createdAt: string }[]> = {
  v1: [
    { id: "vn1", authorKey: "elif_yalcin", rating: 5, body: "İkinci katta pencere kenarı en sevdiğim köşe, saatlerce oturulur.", createdAt: daysAgo(5) },
    { id: "vn2", authorKey: "mert_aydin", rating: 4, body: "Kalabalık olabiliyor ama kitap seçimi çok iyi.", createdAt: daysAgo(2) },
  ],
  v3: [
    { id: "vn3", authorKey: "sude_demir", rating: 5, body: "Kulüp toplantıları için ideal, uzun masaları var.", createdAt: daysAgo(8) },
    { id: "vn4", authorKey: "omer_faruk", rating: 4, body: "Kahvesi de fena değil, fiyatlar makul.", createdAt: daysAgo(1) },
  ],
  v4: [{ id: "vn5", authorKey: "can_ozturk", rating: 5, body: "Moda'da yürüyüş sonrası uğramak için birebir.", createdAt: daysAgo(3) }],
};

const VENUE_CHECKINS_RAW: Record<string, { id: string; userKey: keyof typeof AUTHORS; note: string | null; createdAt: string }[]> = {
  v1: [{ id: "vc1", userKey: "omer_faruk", note: "Az önce geldim, pencere kenarındayım.", createdAt: hoursAgo(1) }],
  v3: [
    { id: "vc2", userKey: "zeynep_can", note: null, createdAt: hoursAgo(2) },
    { id: "vc3", userKey: "can_ozturk", note: "Felsefe Kulübü burada buluşuyor bugün!", createdAt: hoursAgo(1) },
    { id: "vc4", userKey: "defne_ipek", note: null, createdAt: hoursAgo(3) },
  ],
};

export const VENUES: VenueDetail[] = RAW_VENUES.map((v) => {
  const notes: VenueNote[] = (VENUE_NOTES_RAW[v.id] ?? []).map((n) => ({
    id: n.id,
    author: author(n.authorKey),
    rating: n.rating,
    body: n.body,
    createdAt: n.createdAt,
  }));
  const ratings = notes.map((n) => n.rating).filter((r): r is number => Boolean(r));
  const avgRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;
  const activeCheckins: VenueCheckin[] = (VENUE_CHECKINS_RAW[v.id] ?? []).map((c) => ({
    id: c.id,
    user: author(c.userKey),
    note: c.note,
    createdAt: c.createdAt,
  }));

  return {
    id: v.id,
    slug: v.slug,
    name: v.name,
    district: v.district,
    kind: v.kind,
    description: v.description,
    mapsUrl: mapsSearchUrl(v.mapsQuery),
    avgRating,
    noteCount: notes.length,
    activeCheckinCount: activeCheckins.length,
    addedBy: author(v.addedBy),
    notes,
    activeCheckins,
    upcomingEvents: [],
    myNote: notes.find((n) => n.author.username === DEMO_USER.username) ?? null,
  };
});

export const getVenueBySlug = (slug: string) => VENUES.find((v) => v.slug === slug) ?? null;

// Felsefe Kulübü'nün sabit buluşma mekanı olarak Akademi Kitabevi'ni işaretliyoruz —
// tanım sırası nedeniyle (VENUES, CLUBS'tan sonra tanımlanıyor) burada, modül
// yüklenirken bir kere atanıyor.
{
  const felsefeKulubu = CLUBS.find((c) => c.slug === "felsefe-kulubu");
  const akademiKitabevi = VENUES.find((v) => v.slug === "akademi-kitabevi");
  if (felsefeKulubu && akademiKitabevi) felsefeKulubu.homeVenue = akademiKitabevi;
}

/**
 * "Haftanın Mekanı" — editöryel değil: check-in ve etkinlik sayısından
 * hesaplanır. Önizleme modunda EVENTS henüz mekana bağlanmadığı için
 * (gerçek backend'de bağlanabilir) sadece check-in'lere bakılır.
 */
export function computeFixtureVenueOfWeek(): VenueOfTheWeek | null {
  let best: VenueDetail | null = null;
  let bestScore = 0;
  for (const v of VENUES) {
    const score = v.upcomingEvents.length * 3 + v.activeCheckins.length;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }
  if (!best) return null;
  return { venue: best, eventCount: best.upcomingEvents.length, checkinCount: best.activeCheckins.length };
}
