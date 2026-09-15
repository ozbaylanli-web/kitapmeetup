/**
 * Kitapmeetup — örnek veri yükleme scripti.
 *
 * Bağlı bir Supabase projesini, uygulamanın önizleme (fixture) modunda
 * gördüğünüz aynı örnek içerikle DOLDURUR VE ÇOK DAHA FAZLASIYLA zenginleştirir:
 * 8 "kurucu" kullanıcının yanına, gerçekçi Türkçe isimlerle üretilmiş ~230
 * sentetik topluluk üyesi + bunların kulüp üyelikleri, raf kayıtları, gönderi
 * beğenileri/yorumları, takip ilişkileri, etkinlik katılımları ve Akademi
 * kayıtları eklenir — sonuç: canlıya alındığında ilk giren gerçek kullanıcı
 * boş değil, YÜZLERCE aktif üyesi olan dolu bir topluluk görür.
 *
 * Kullanım:
 *   1. supabase/migrations/0001_init.sql dosyasını Supabase projenizde çalıştırın.
 *   2. .env.local içine NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY girin.
 *   3. npm run db:seed   (ilk çalıştırma ~1-2 dakika sürebilir, yüzlerce kullanıcı oluşturulur)
 *
 * Bu script "servis rolü" anahtarını kullanır (RLS'i atlar) — SADECE yerel
 * geliştirme/seed işlemleri için, asla istemci tarafında kullanmayın.
 * Kurucu kullanıcılar/kulüpler/kitaplar/etkinlikler/Akademi/blog için tekrar
 * çalıştırmak güvenlidir (var olan kayıtları günceller/atlar). Sentetik
 * topluluk (üyeler + aktivite) yalnızca profil sayısı düşükken bir kez
 * üretilir — profil sayısı zaten yüksekse o bölüm atlanır (aşırı çoğalmasın diye).
 */

import { createClient } from "@supabase/supabase-js";
import { BOOK_CATALOG } from "../src/lib/fixtures/catalog";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "\n❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.\n" +
      "   .env.local dosyanızı doldurun ve tekrar deneyin (bkz. README.md).\n"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────────────────────────────────
// Sabit "kurucu" veri (küçük, elle yazılmış, tanıdık yüzler)
// ─────────────────────────────────────────────────────────────────────────

const DEMO_PASSWORD = "kitapmeetup-demo-2026";
// Aşağıdaki ~230 sentetik topluluk üyesi de dahil TÜM seed kullanıcıları
// aynı şifreyi paylaşır — herhangi birinin e-postasıyla (ör. ayse_yilmaz@kitapmeetup.test)
// giriş yapıp o kullanıcı gibi gezinebilirsiniz.

const USERS: SeedUser[] = [
  { username: "elif_yalcin", email: "elif@kitapmeetup.test", fullName: "Elif Yalçın", bio: "Kitapmeetup'ın eski günlerinden beri buradayım. Felsefe ve post-apokaliptik kurgu okurum.", city: "İstanbul", avatarColor: "#F0611F", isAdmin: true },
  { username: "baris_k", email: "baris@kitapmeetup.test", fullName: "Barış Kaya", bio: "Bilimkurgu Kulübü moderatörü. Anlatı kadar önsözleri de severim.", city: "İzmir", avatarColor: "#146B62" },
  { username: "sude_demir", email: "sude@kitapmeetup.test", fullName: "Sude Demir", bio: "Şiirle başlayıp felsefeyle bitiririm genelde.", city: "Ankara", avatarColor: "#6F5A94" },
  { username: "mert_aydin", email: "mert@kitapmeetup.test", fullName: "Mert Aydın", bio: "Distopya Kulübü kurucusu. '1984'ü yılda bir okurum, evet abartıyorum.", city: "İstanbul", avatarColor: "#35594D" },
  { username: "zeynep_can", email: "zeynep@kitapmeetup.test", fullName: "Zeynep Can", bio: "Akademi'de 'Evrim 101' dersini yürütüyorum. Biyolog, meraklı okur.", city: "Ankara", avatarColor: "#D24915" },
  { username: "omer_faruk", email: "omer@kitapmeetup.test", fullName: "Ömer Faruk", bio: "Kahve, kitap, biraz da dert.", city: "Bursa", avatarColor: "#B8791B" },
  { username: "defne_ipek", email: "defne@kitapmeetup.test", fullName: "Defne İpek", bio: "Blogda kitaplar üzerine uzun uzun yazarım.", city: "İstanbul", avatarColor: "#C05F82" },
  { username: "can_ozturk", email: "can@kitapmeetup.test", fullName: "Can Öztürk", bio: "Yeni katıldım, İzmir'den selamlar.", city: "İzmir", avatarColor: "#3E6C93" },
  {
    username: "yordam_kitap",
    email: "yordamkitap@kitapmeetup.test",
    fullName: "Yordam Kitap",
    bio: "Bağımsız bir yayınevi — felsefe, toplumsal bilim ve çeviri edebiyat basıyoruz. Kitapmeetup topluluğuyla okurlarımıza daha yakın olmak istiyoruz.",
    city: "İstanbul",
    avatarColor: "#146B62",
    accountKind: "publisher",
    publisherWebsite: "https://example.com/yordam-kitap",
  },
];

const BOOKS = [
  { key: "simyaci", title: "Simyacı", author: "Paulo Coelho", spineColor: "#D24915", genre: "Modern Dünya Bestseller" },
  { key: "dune", title: "Dune", author: "Frank Herbert", spineColor: "#B8791B", genre: "Bilimkurgu ve Fantastik" },
  { key: "1984", title: "1984", author: "George Orwell", spineColor: "#35594D", genre: "Bilimkurgu ve Fantastik" },
  { key: "suc_ve_ceza", title: "Suç ve Ceza", author: "Dostoyevski", spineColor: "#6F5A94", genre: "Dünya Edebiyatı: Rus" },
  { key: "kucuk_prens", title: "Küçük Prens", author: "Antoine de Saint-Exupéry", spineColor: "#3E6C93", genre: "Çocuk ve Gençlik Klasikleri" },
  { key: "solaris", title: "Solaris", author: "Stanisław Lem", spineColor: "#146B62", genre: "Bilimkurgu ve Fantastik" },
  { key: "sefiller", title: "Sefiller", author: "Victor Hugo", spineColor: "#AB3812", genre: "Dünya Edebiyatı: Batı Klasikleri" },
  { key: "fahrenheit451", title: "Fahrenheit 451", author: "Ray Bradbury", spineColor: "#D8481B", genre: "Bilimkurgu ve Fantastik" },
  { key: "zerdust", title: "Böyle Buyurdu Zerdüşt", author: "Friedrich Nietzsche", spineColor: "#802A11", genre: "Felsefe" },
  { key: "zaman", title: "Zamanın Kısa Tarihi", author: "Stephen Hawking", spineColor: "#3E6C93", genre: "Popüler Bilim, Psikoloji ve Kişisel Gelişim" },
  { key: "donusum", title: "Dönüşüm", author: "Franz Kafka", spineColor: "#551B0B", genre: "Dünya Edebiyatı: Batı Klasikleri" },
  { key: "kurkmanto", title: "Kürk Mantolu Madonna", author: "Sabahattin Ali", spineColor: "#C05F82", genre: "Türk Edebiyatı: Klasikler" },
] as const;

const CLUBS = [
  { slug: "felsefe-kulubu", name: "Felsefe Kulübü", icon: "🦉", color: "#6F5A94", description: "Sokratik sorulardan varoluşçuluğa, her ay bir düşünürün ya da metnin peşine düşüyoruz. Ön okuma şart değil, merak yeter.", createdBy: "sude_demir", members: ["sude_demir", "elif_yalcin", "omer_faruk", "zeynep_can", "can_ozturk"] },
  { slug: "bilimkurgu-kulubu", name: "Bilimkurgu Kulübü", icon: "🛰️", color: "#146B62", description: "Uzak galaksilerden yapay zekaya, tekno-distopyalardan ütopyalara — bilimkurgunun bugünümüze ne söylediğini konuşuyoruz.", createdBy: "baris_k", members: ["baris_k", "elif_yalcin", "can_ozturk", "omer_faruk"] },
  { slug: "siir-kulubu", name: "Şiir Kulübü", icon: "🖋️", color: "#C05F82", description: "Dizeler üzerine sohbet, açık mikrofon geceleri ve karşılıklı sesli okuma seansları.", createdBy: "defne_ipek", members: ["defne_ipek", "sude_demir", "zeynep_can"] },
  { slug: "distopya-kulubu", name: "Distopya Kulübü", icon: "🕯️", color: "#35594D", description: "Karanlık kurgusal gelecekler üzerinden bugünü okumaya çalışıyoruz. İyimserlere de kapımız açık.", createdBy: "mert_aydin", members: ["mert_aydin", "baris_k", "defne_ipek", "elif_yalcin"] },
] as const;

// İstanbul'daki kitapçı/kitap kafe/okumaya uygun kafeler — WebSearch ile
// doğrulanmış, gerçekten var olan 5 mekan. src/lib/fixtures/index.ts'teki
// önizleme (demo) rehberiyle aynı — bkz. RAW_VENUES.
const VENUES = [
  { slug: "turk-alman-kitabevi", name: "Türk Alman Kitabevi & Cafe", district: "Beyoğlu", kind: "kitap_kafe", description: "1955'ten beri İstiklal Caddesi'nde; Türkçe, Almanca ve İngilizce kitaplar iki katlı, sakin bir kafenin içine yayılıyor.", mapsQuery: "Türk Alman Kitabevi Beyoğlu İstanbul", addedBy: "elif_yalcin" },
  { slug: "salt-galata", name: "SALT Galata", district: "Beyoğlu", kind: "okuma_dostu_kafe", description: "Tarihi bina, geniş kütüphanesi ve huzurlu atmosferiyle uzun uzun oturup okumak/çalışmak için sevilen bir mekan.", mapsQuery: "SALT Galata İstanbul", addedBy: "baris_k" },
  { slug: "akademi-kitabevi", name: "Akademi Kitabevi", district: "Kadıköy", kind: "kitap_kafe", description: "Kadıköy'ün köklü kitap kafelerinden — uzun raflar arasında zaman kaybediyorsunuz, kulüp buluşmaları için de uygun.", mapsQuery: "Akademi Kitabevi Kadıköy İstanbul", addedBy: "sude_demir" },
  { slug: "tasarim-bookshop-cafe", name: "Tasarım Bookshop and Cafe", district: "Kadıköy (Moda)", kind: "kitap_kafe", description: "Moda'da, tasarım ve sanat kitaplarına ağırlık veren; mimarların/sanatçıların uğrak noktası bir kitap kafe.", mapsQuery: "Tasarım Bookshop and Cafe Moda İstanbul", addedBy: "defne_ipek" },
  { slug: "mephisto-kitabevi-kadikoy", name: "Mephisto Kitabevi", district: "Kadıköy", kind: "kitapci", description: "İstiklal, Beşiktaş ve Kadıköy şubeleriyle tanınan, geniş yelpazeli bir kitapçı zinciri.", mapsQuery: "Mephisto Kitabevi Kadıköy İstanbul", addedBy: "can_ozturk" },
] as const;

function mapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

const VENUE_NOTES: { venueSlug: string; author: string; rating: number; body: string }[] = [
  { venueSlug: "turk-alman-kitabevi", author: "elif_yalcin", rating: 5, body: "İkinci katta pencere kenarı en sevdiğim köşe, saatlerce oturulur." },
  { venueSlug: "turk-alman-kitabevi", author: "mert_aydin", rating: 4, body: "Kalabalık olabiliyor ama kitap seçimi çok iyi." },
  { venueSlug: "akademi-kitabevi", author: "sude_demir", rating: 5, body: "Kulüp toplantıları için ideal, uzun masaları var." },
  { venueSlug: "akademi-kitabevi", author: "omer_faruk", rating: 4, body: "Kahvesi de fena değil, fiyatlar makul." },
  { venueSlug: "tasarim-bookshop-cafe", author: "can_ozturk", rating: 5, body: "Moda'da yürüyüş sonrası uğramak için birebir." },
];

const VENUE_NOTE_BODIES = ["Güzel bir köşe, tekrar gelirim.", "Sessiz ve çalışmaya uygun.", "Kitap seçimi iyi, kahvesi de fena değil.", "Kulüp buluşması için burayı önereceğim."];

const VENUE_CHECKINS: { venueSlug: string; user: string; note: string | null; hoursAgo: number }[] = [
  { venueSlug: "turk-alman-kitabevi", user: "omer_faruk", note: "Az önce geldim, pencere kenarındayım.", hoursAgo: 1 },
  { venueSlug: "akademi-kitabevi", user: "zeynep_can", note: null, hoursAgo: 2 },
  { venueSlug: "akademi-kitabevi", user: "can_ozturk", note: "Felsefe Kulübü burada buluşuyor bugün!", hoursAgo: 1 },
  { venueSlug: "akademi-kitabevi", user: "defne_ipek", note: null, hoursAgo: 3 },
];

const SPINE_PALETTE = ["#D24915", "#B8791B", "#146B62", "#6F5A94", "#C05F82", "#35594D", "#3E6C93", "#AB3812", "#802A11", "#551B0B", "#4A3D31"];

function spineColorFor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  return SPINE_PALETTE[hash % SPINE_PALETTE.length];
}

const DAILY_PROMPTS = [
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

// ─────────────────────────────────────────────────────────────────────────
// Sentetik topluluk — gerçekçi Türkçe isimlerle üretilen ~230 üye
// ─────────────────────────────────────────────────────────────────────────

interface SeedUser {
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  city?: string;
  avatarColor?: string;
  isAdmin?: boolean;
  birthDate?: string;
  gender?: string;
  accountKind?: "reader" | "publisher";
  publisherWebsite?: string;
}

const SYNTHETIC_USER_COUNT = 230;

const FEMALE_FIRST = ["Ayşe", "Fatma", "Zeynep", "Elif", "Emine", "Hatice", "Meryem", "Sena", "İrem", "Buse", "Ece", "Deniz", "Cansu", "Gizem", "Aslı", "Pınar", "Selin", "Nazlı", "Melis", "Ebru", "Aylin", "Burcu", "Özge", "Şeyma", "Betül", "Yasemin", "Tuğçe", "Ceren", "Merve", "Damla", "Gamze", "Esra", "Sibel", "Dilara", "İpek", "Beren", "Naz", "Ada", "Su", "Rüya", "Azra"];
const MALE_FIRST = ["Mehmet", "Ahmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "Yusuf", "Ömer", "Halil", "Emre", "Burak", "Caner", "Kaan", "Onur", "Serkan", "Volkan", "Tolga", "Kerem", "Barış", "Cem", "Berk", "Alp", "Efe", "Arda", "Kağan", "Tuncay", "Sinan", "Umut", "Fatih", "Kemal", "Erhan", "Tarık", "Cenk", "Yiğit", "Doruk", "Poyraz", "Atlas", "Bora", "Kutay", "Ozan"];
const LAST_NAMES = ["Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek", "Polat", "Avcı", "Erdoğan", "Turan", "Güneş", "Aktaş", "Acar", "Tekin", "Bulut", "Uçar", "Sarı", "Ergün", "Bilgin", "Karaca", "Tuncer", "Ateş", "Duran", "Koçak", "Yücel", "Aksoy", "Tan", "Baş", "Ekşi", "Gündüz", "Sezer", "Kaplan", "Sönmez", "Yavuz", "Ünal", "Selçuk", "Bozkurt", "Erkan", "Toprak", "Güler", "Aygün", "Soylu", "Aktürk", "Vural", "Keskin"];
const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Eskişehir", "Adana", "Gaziantep", "Konya", "Kayseri", "Trabzon", "Mersin", "Kocaeli", "Denizli", "Samsun", "Muğla"];
const AVATAR_PALETTE = ["#F0611F", "#D24915", "#AB3812", "#146B62", "#0F766E", "#6F5A94", "#7C3AED", "#C05F82", "#BE185D", "#35594D", "#166534", "#3E6C93", "#0EA5E9", "#B8791B", "#92400E", "#4A3D31"];
const BIO_SNIPPETS = [
  "Ayda en az 2 kitap hedefi koyuyorum, genelde tutmuyor ama denemekten vazgeçmiyorum.",
  "Kitap kokusu için ikinci el kitapçıları gezerim.",
  "Sesli kitaplarla işe gidip geliyorum, göz dinlensin diye.",
  "Raf düzeni renge göre, kimse anlamıyor ama ben biliyorum.",
  "Bir oturuşta kitap bitirmeyi severim, uyku düşmanıyım.",
  "Kitap kulübüne yeni katıldım, heyecanlıyım.",
  "Kenar notu almadan kitap okuyamam.",
  "Fantastik kurgudan felsefeye geçiş yaptım, geri dönüşü yok.",
  "Kitapları bitirmeden yenisini almayı bırakamıyorum.",
  "Kadıköy'de küçük bir okuma çetesi kuruyorum, katılmak isteyen bulsun beni.",
  "Şiirle aram hep tuhaftı, şimdi düzeliyor.",
  "Kütüphane kartımı en çok kullandığım kart.",
  "Bilim kurguyla büyüdüm, hâlâ oradan çıkamadım.",
  "Kitap önerisi istemeden veririm, kusura bakmayın.",
  "Klasiklere döne döne dönerim.",
  "Yeni bir yazar keşfetmek en sevdiğim şey.",
  "Okurken müzik açmam, sessizlik şart.",
  "Kitap hediye etmeyi, almaktan çok severim.",
  "Bir kitabı bitirince hemen ikincisine başlarım, boşluğa dayanamam.",
  "Distopyalar beni hem korkutur hem de rahatlatır, tuhaf ama gerçek.",
  "Kahve ve kitap olmadan sabah başlamıyor.",
  "Uzun tren yolculukları en çok kitap okuduğum an.",
  "Kitap kulübünde en çok tartışma çıkaran kişi bendim galiba.",
  "Yeni şehre taşındım, burada da bir okuma çetesi arıyorum.",
];

function turkishToAscii(s: string): string {
  return s
    .replace(/İ/g, "I")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/Ğ/g, "g")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/ş/g, "s")
    .replace(/Ö/g, "o")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ç/g, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function makeUsername(first: string, last: string, used: Set<string>): string {
  const base = (`${turkishToAscii(first)}_${turkishToAscii(last)}`.slice(0, 16) || "okur").padEnd(3, "0");
  let candidate = base;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}${n}`;
    n++;
  }
  used.add(candidate);
  return candidate;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const clamped = Math.max(0, Math.min(n, arr.length));
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, clamped);
}

function randomBirthDate(): string {
  const age = randInt(18, 45);
  const year = new Date().getFullYear() - age;
  const month = randInt(1, 12);
  const day = randInt(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function weightedClubCount(): number {
  const r = Math.random();
  if (r < 0.2) return 0;
  if (r < 0.6) return 1;
  if (r < 0.9) return 2;
  return 3;
}

function weightedShelfStatus(): "reading" | "read" | "want" {
  const r = Math.random();
  if (r < 0.3) return "reading";
  if (r < 0.65) return "read";
  return "want";
}

function generateSyntheticUsers(count: number): SeedUser[] {
  const used = new Set(USERS.map((u) => u.username));
  const out: SeedUser[] = [];
  for (let i = 0; i < count; i++) {
    const isFemale = Math.random() < 0.5;
    const first = pick(isFemale ? FEMALE_FIRST : MALE_FIRST);
    const last = pick(LAST_NAMES);
    const username = makeUsername(first, last, used);
    const hasDetails = Math.random() < 0.55;
    out.push({
      username,
      email: `${username}@kitapmeetup.test`,
      fullName: `${first} ${last}`,
      bio: pick(BIO_SNIPPETS),
      city: pick(CITIES),
      avatarColor: pick(AVATAR_PALETTE),
      birthDate: hasDetails ? randomBirthDate() : undefined,
      gender: hasDetails ? pick(["Kadın", "Erkek", "Belirtmek istemiyorum"]) : undefined,
    });
  }
  return out;
}

const POST_BODIES: { type: "text" | "quote" | "photo" | "question"; body: string }[] = [
  { type: "text", body: "Bugün kütüphanede üç saat geçirdim, telefonuma hiç bakmadım. Küçük bir zafer sayılır." },
  { type: "text", body: "Yağmurlu bir günde battaniye, çay ve yarım kalan kitap — daha ne olsun." },
  { type: "text", body: "Bu hafta hiç okuyamadım, kendimi suçlu hissediyorum ama olsun, hafta sonu telafi ederim." },
  { type: "text", body: "Az önce bir kitapçıdan çıktım, bütçemi mahvettim ama pişman değilim." },
  { type: "text", body: "Kitap kulübü toplantımız harika geçti, herkese teşekkürler." },
  { type: "text", body: "Uzun zamandır ertelediğim bir klasiğe bugün başladım, umarım pişman olmam." },
  { type: "text", body: "Okuma listem her geçen gün büyüyor, hızım yetişmiyor." },
  { type: "text", body: "Kitap ayracımı kaybettim, sayfanın kenarını katlamak zorunda kaldım, içim rahat değil." },
  { type: "text", body: "Bu sabah erken kalkıp bir saat kitap okudum, güne böyle başlamak iyi geliyor." },
  { type: "text", body: "İkinci el kitapçıda beklenmedik bir hazine buldum bugün." },
  { type: "text", body: "Bazı kitapları bitirmek istemiyorum, karakterlerden ayrılamıyorum." },
  { type: "text", body: "Bugün metroda kitabımı unuttum, gün boyu huzursuzdum." },
  { type: "text", body: "Kitaplığımı yeniden düzenledim, bu sefer yazara göre." },
  { type: "text", body: "Uzun bir aradan sonra tekrar okumaya döndüm, iyi hissettiriyor." },
  { type: "text", body: "Bir arkadaşıma kitap önerdim, beğenmiş — küçük mutluluklar işte." },
  { type: "text", body: "Kulüp toplantısından yeni çıktım, aklım hâlâ orada." },
  { type: "text", body: "Bu ayki kulüp kitabımızı bitirdim, tartışmaya hazırım." },
  { type: "text", body: "Yeni katıldığım kulüpte herkes çok sıcakkanlı, kendimi hemen evimde hissettim." },
  { type: "text", body: "Kulüpteki tartışmalar bazen kitaptan daha ilginç oluyor." },
  { type: "text", body: "Bugün ilk kez bir kitap kulübü toplantısına gittim, bayıldım." },
  { type: "quote", body: "\"Bir kitap, kapağını kapattığında bile içinde yaşamaya devam eder.\"" },
  { type: "quote", body: "\"Okumak, başka bir hayatı ödünç almaktır.\"" },
  { type: "quote", body: "\"Her kitap, bitmeden önce seni biraz değiştirir.\"" },
  { type: "quote", body: "\"Sessizlik bazen en yüksek sesle konuşur.\"" },
  { type: "quote", body: "\"İyi bir cümle, uzun bir paragraftan daha çok şey anlatabilir.\"" },
  { type: "quote", body: "\"Kaybolmak için bazen bir kitap yeter.\"" },
  { type: "quote", body: "\"Zaman geçer, iyi kitaplar kalır.\"" },
  { type: "quote", body: "\"Bir kütüphane, sessiz bir kalabalıktır.\"" },
  { type: "question", body: "Bitirmeden bırakamadığınız son kitap hangisiydi?" },
  { type: "question", body: "Bir kitabı filme uyarlasanız hangisini seçerdiniz?" },
  { type: "question", body: "Kitap seçerken kapak mı, konu mu, yoksa tavsiye mi belirleyici oluyor sizde?" },
  { type: "question", body: "Yeniden okuduğunuzda hep farklı bir şey bulduğunuz bir kitap var mı?" },
  { type: "question", body: "Bir kitabı yarım bıraktınız mı hiç? Neden?" },
  { type: "question", body: "En sevdiğiniz ilk cümle hangi kitaba ait?" },
  { type: "question", body: "Bu ay okuma hedefiniz nedir?" },
  { type: "question", body: "Bir yazarla akşam yemeği yiyebilseydiniz kimi seçerdiniz?" },
  { type: "question", body: "Kitap mı dizi mi, hangisi daha çok vaktinizi alıyor?" },
  { type: "question", body: "Sizce bir kitap kaç sayfadan sonra 'uzun' sayılır?" },
  { type: "question", body: "Fiziksel kitap mı, e-kitap mı, yoksa sesli kitap mı?" },
  { type: "question", body: "Hangi kitabı herkesin okumasını istersiniz?" },
  { type: "photo", body: "Bugünkü okuma köşem ☕📚 — dışarıda hava soğudu, içeride sayfalar sıcak." },
  { type: "photo", body: "Yeni gelen kitaplarım, sıraya girdiler bile 📖" },
  { type: "photo", body: "Bu haftaki 'şu an okuyorum' rafım böyle görünüyor." },
  { type: "photo", body: "Kitapçıdan eve dönüş, kucak dolusu mutluluk." },
  { type: "photo", body: "Bugün parkta okudum, ideal bir öğleden sonraydı." },
  { type: "photo", body: "Kitap notlarım dağınık ama sistemli bir dağınıklık, güvenin bana." },
  { type: "photo", body: "Yeni kitap kokusu, hiçbir şeye değişmem." },
  { type: "photo", body: "Bu ayracı bir arkadaşımdan hediye aldım, artık ayrılmaz ikili." },
];

const COMMENT_TEMPLATES = [
  "Kesinlikle katılıyorum!",
  "Bunu ben de tam olarak düşünüyordum.",
  "Hangi baskıyı okudun?",
  "Bayıldım bu paylaşıma 📚",
  "Ben de sırada bekletiyorum bu kitabı.",
  "Yaa ben de aynen böyle hissetmiştim okurken.",
  "Bunu okuyunca hemen sıraya aldım.",
  "Çok haklısın, ben de bitirmekte zorlanmıştım.",
  "Bu alıntıyı not aldım, teşekkürler.",
  "Bence en güzel yanı da buydu zaten.",
  "Katılıyorum ama sonu biraz zayıf kalmış bence.",
  "Bunu bir de kulüpte konuşsak süper olur.",
  "Ben tam tersini düşünmüştüm, ilginç bir bakış açısı bu.",
  "Fotoğraf harika olmuş 😍",
  "Bu köşeye bayıldım, çok huzurlu görünüyor.",
  "Ben de aynı dönemde okumuştum, çok konuşacak şeyimiz var.",
  "Kesin okuyacağım şimdi.",
  "Böyle günler için yaşıyoruz zaten.",
  "Aynen, ben de sabahları en verimli okuyorum.",
  "Bunu görünce kitaplığımı yeniden düzenlemek istedim.",
  "Süper bir tespit, teşekkürler paylaşım için.",
  "Ben bu kitaba biraz soğuk bakmıştım açıkçası.",
  "Toplantıyı kaçırdığıma çok üzüldüm, özeti var mı?",
  "Bu soruyu hep merak etmişimdir, güzel oldu.",
];

const TAKAS_NOTES = [
  "Bu kitabı bitirdim, artık rafımda yer kaplıyor. Karşılığında bilimkurgu ya da felsefe ararım.",
  "Temiz bir baskı, hiç yıpranmamış. Takas için açığım, ne teklif edersen değerlendiririm.",
  "İki kopyası bende var yanlışlıkla, birini takas etmek istiyorum.",
  "Severek okudum ama türü artık bana göre değil. Şiir ya da distopya ararım karşılığında.",
  "Kitaplığımı sadeleştiriyorum, bu güzel kitaba yeni bir yuva arıyorum.",
  "Hediye gelmişti, okudum ama koleksiyonuma uymuyor. Takasa açığım.",
  "Bu kitabı ikinci kez okumayacağımı fark ettim, birine daha faydalı olsun istiyorum.",
];

const TAKAS_OFFER_MESSAGES = [
  "Bunu verebilirim, çok temiz durumda.",
  "İlgileniyorum, bu kitabı teklif ediyorum.",
  "Elimde bu var, takas eder misin?",
  "Severek okumuştum, sana da güzel bir eş olur bence.",
  "Ben de tam bunu arıyordum, olur mu?",
];

const TAKAS_ARAMA_NOTES = [
  "Uzun zamandır arıyorum, hiçbir yerde bulamadım. Kimde varsa çok sevinirim.",
  "Baskısı fark etmez, sadece okunabilir durumda olsun yeter.",
  "Bir arkadaşım tavsiye etti, kütüphanelerde de bulamadım.",
  "Eski bir baskısını arıyorum özellikle, ama yenisi de olur.",
  "Kulüp için arıyorum, elinde olan varsa haber versin.",
  "İkinci el kitapçılarda bulamadım, belki sizde vardır diye deniyorum.",
];

const TAKAS_ARAMA_OFFER_MESSAGES = [
  "Bende var, sana verebilirim!",
  "Rafımda duruyordu, tam sırası.",
  "Bende fazladan bir kopyası var, seve seve veririm.",
  "Var bende, nasıl ulaştırabilirim sana?",
  "Bende var ama biraz yıpranmış, olur mu?",
];

// ─────────────────────────────────────────────────────────────────────────
// Yardımcılar
// ─────────────────────────────────────────────────────────────────────────

async function getOrCreateUser(u: SeedUser): Promise<string> {
  const { data: existingProfile } = await supabase.from("profiles").select("id").eq("username", u.username).maybeSingle();
  if (existingProfile) return existingProfile.id;

  const { data: created, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { username: u.username, full_name: u.fullName },
  });
  if (error || !created.user) throw new Error(`Kullanıcı oluşturulamadı (${u.email}): ${error?.message}`);

  // Tetikleyici (handle_new_user) temel profili oluşturur; kalan alanları güncelliyoruz.
  await supabase
    .from("profiles")
    .update({
      bio: u.bio ?? "",
      city: u.city ?? null,
      avatar_color: u.avatarColor ?? "#F0611F",
      is_admin: u.isAdmin ?? false,
      birth_date: u.birthDate ?? null,
      gender: u.gender ?? null,
      account_kind: u.accountKind ?? "reader",
      publisher_website: u.accountKind === "publisher" ? u.publisherWebsite ?? null : null,
    })
    .eq("id", created.user.id);

  return created.user.id;
}

async function getOrCreateClub(c: (typeof CLUBS)[number], createdBy: string): Promise<string> {
  const { data: existing } = await supabase.from("clubs").select("id").eq("slug", c.slug).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("clubs")
    .insert({ slug: c.slug, name: c.name, icon: c.icon, color: c.color, description: c.description, created_by: createdBy })
    .select("id")
    .single();
  if (error || !created) throw new Error(`Kulüp oluşturulamadı (${c.slug}): ${error?.message}`);
  return created.id;
}

async function getOrCreateBook(b: (typeof BOOKS)[number], addedBy: string): Promise<string> {
  const { data: existing } = await supabase.from("books").select("id").ilike("title", b.title).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("books")
    .insert({ title: b.title, author: b.author, spine_color: b.spineColor, genre: b.genre, added_by: addedBy })
    .select("id")
    .single();
  if (error || !created) throw new Error(`Kitap oluşturulamadı (${b.title}): ${error?.message}`);
  return created.id;
}

function daysFromNow(d: number): string {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
}
function daysAgo(d: number): string {
  return daysFromNow(-d);
}
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

async function mapPool<T>(items: T[], concurrency: number, fn: (item: T) => Promise<void>): Promise<void> {
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

async function bulkInsert(table: string, rows: Record<string, unknown>[], chunkSize = 500): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) console.warn(`  ⚠️  ${table} parçası eklenemedi (${i}-${i + chunk.length}): ${error.message}`);
  }
}

async function bulkUpsert(table: string, rows: Record<string, unknown>[], onConflict: string, chunkSize = 500): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).upsert(chunk, { onConflict, ignoreDuplicates: true });
    if (error) console.warn(`  ⚠️  ${table} parçası eklenemedi (${i}-${i + chunk.length}): ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Ana akış
// ─────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Kitapmeetup örnek verisi yükleniyor...\n");

  console.log("→ Kurucu kullanıcılar");
  const userIds: Record<string, string> = {};
  for (const u of USERS) {
    userIds[u.username] = await getOrCreateUser(u);
  }
  console.log(`  ${Object.keys(userIds).length} kurucu kullanıcı hazır.`);

  console.log("→ Kitaplar");
  const bookIds: Record<string, string> = {};
  for (const b of BOOKS) {
    bookIds[b.key] = await getOrCreateBook(b, userIds.elif_yalcin);
  }
  console.log(`  ${Object.keys(bookIds).length} kitap hazır.`);

  console.log("→ Kulüpler");
  const clubIds: Record<string, string> = {};
  for (const c of CLUBS) {
    const clubId = await getOrCreateClub(c, userIds[c.createdBy]);
    clubIds[c.slug] = clubId;

    for (const memberUsername of c.members) {
      await supabase
        .from("club_members")
        .upsert(
          { club_id: clubId, user_id: userIds[memberUsername], role: memberUsername === c.createdBy ? "owner" : "member" },
          { onConflict: "club_id,user_id" }
        );
    }
  }
  console.log(`  ${Object.keys(clubIds).length} kulüp hazır.`);

  console.log("→ Mekanlar (İstanbul kitapçı/kitap kafe rehberi)");
  const venueIds: Record<string, string> = {};
  for (const v of VENUES) {
    const { data: existing } = await supabase.from("venues").select("id").eq("slug", v.slug).maybeSingle();
    if (existing) {
      venueIds[v.slug] = existing.id;
      continue;
    }
    const { data: created, error } = await supabase
      .from("venues")
      .insert({
        slug: v.slug,
        name: v.name,
        district: v.district,
        kind: v.kind,
        description: v.description,
        maps_url: mapsSearchUrl(v.mapsQuery),
        added_by: userIds[v.addedBy],
      })
      .select("id")
      .single();
    if (error || !created) throw new Error(`Mekan oluşturulamadı (${v.slug}): ${error?.message}`);
    venueIds[v.slug] = created.id;
  }
  // Felsefe Kulübü'nün sabit buluşma mekanı: Akademi Kitabevi (Kadıköy).
  await supabase.from("clubs").update({ home_venue_id: venueIds["akademi-kitabevi"] }).eq("id", clubIds["felsefe-kulubu"]);
  for (const n of VENUE_NOTES) {
    await supabase
      .from("venue_notes")
      .upsert(
        { venue_id: venueIds[n.venueSlug], author_id: userIds[n.author], rating: n.rating, body: n.body },
        { onConflict: "venue_id,author_id" }
      );
  }
  const { count: existingCheckinCount } = await supabase.from("venue_checkins").select("id", { count: "exact", head: true });
  if (!existingCheckinCount) {
    for (const c of VENUE_CHECKINS) {
      await supabase.from("venue_checkins").insert({
        venue_id: venueIds[c.venueSlug],
        user_id: userIds[c.user],
        note: c.note,
        created_at: hoursAgo(c.hoursAgo),
      });
    }
  }
  console.log(`  ${VENUES.length} mekan, ${VENUE_NOTES.length} not, ${VENUE_CHECKINS.length} check-in hazır.`);

  console.log("→ Raf kayıtları (kurucular)");
  const shelfPlan: [string, string, "reading" | "read" | "want"][] = [
    ["elif_yalcin", "zerdust", "reading"],
    ["elif_yalcin", "1984", "read"],
    ["elif_yalcin", "solaris", "want"],
    ["baris_k", "dune", "reading"],
    ["baris_k", "fahrenheit451", "read"],
    ["sude_demir", "kurkmanto", "reading"],
    ["mert_aydin", "1984", "reading"],
    ["mert_aydin", "fahrenheit451", "read"],
    ["zeynep_can", "zaman", "reading"],
    ["omer_faruk", "simyaci", "reading"],
    ["defne_ipek", "kurkmanto", "read"],
    ["can_ozturk", "kucuk_prens", "reading"],
  ];
  for (const [username, bookKey, status] of shelfPlan) {
    await supabase
      .from("shelf_entries")
      .upsert({ user_id: userIds[username], book_id: bookIds[bookKey], status }, { onConflict: "user_id,book_id" });
  }
  console.log(`  ${shelfPlan.length} raf kaydı hazır.`);

  console.log("→ Etkinlikler");
  const events = [
    { slug: "felsefe-kulubu-nietzsche-gecesi", title: "Felsefe Kulübü: Nietzsche Gecesi", club: "felsefe-kulubu", location: "Akademi Kitabevi", venueSlug: "akademi-kitabevi", startsAt: daysFromNow(4), createdBy: "elif_yalcin", capacity: 80 },
    { slug: "bilimkurgu-kulubu-dune-tartismasi", title: "Bilimkurgu Kulübü: Dune Tartışması", club: "bilimkurgu-kulubu", isOnline: true, locationUrl: "https://meet.example.com/kitapmeetup-dune", startsAt: daysFromNow(2), createdBy: "baris_k", capacity: 100 },
    { slug: "kitapmeetup-buyuk-piknik", title: "Aylık Büyük Buluşma: Kitapmeetup Pikniği", location: "Maçka Parkı, İstanbul", startsAt: daysFromNow(14), createdBy: "elif_yalcin", capacity: 150 },
    { slug: "distopya-kulubu-1984-fahrenheit", title: "Distopya Kulübü: 1984 vs Fahrenheit 451", club: "distopya-kulubu", location: "Beşiktaş — Kütüphane Sokak", startsAt: daysFromNow(20), createdBy: "mert_aydin", capacity: 90 },
    { slug: "siir-kulubu-acik-mikrofon", title: "Şiir Kulübü: Açık Mikrofon Gecesi", club: "siir-kulubu", location: "Cihangir — Dize Kıraathanesi", startsAt: daysFromNow(10), createdBy: "defne_ipek", capacity: 90 },
    { slug: "felsefe-kulubu-varolusculuk-101", title: "Felsefe Kulübü: Varoluşçuluk 101 Sohbeti", club: "felsefe-kulubu", location: "Kadıköy, Moda — Sayfa Kahve", startsAt: daysAgo(30), createdBy: "sude_demir" },
  ];
  const eventIds: Record<string, string> = {};
  for (const e of events) {
    const { data: existing } = await supabase.from("events").select("id").eq("slug", e.slug).maybeSingle();
    if (existing) {
      eventIds[e.slug] = existing.id;
      continue;
    }
    const { data: created, error } = await supabase
      .from("events")
      .insert({
        slug: e.slug,
        title: e.title,
        description: "",
        club_id: e.club ? clubIds[e.club] : null,
        is_online: Boolean(e.isOnline),
        location_name: e.location ?? null,
        location_url: e.locationUrl ?? null,
        starts_at: e.startsAt,
        capacity: e.capacity ?? null,
        created_by: userIds[e.createdBy],
        venue_id: e.venueSlug ? venueIds[e.venueSlug] : null,
      })
      .select("id")
      .single();
    if (error || !created) throw new Error(`Etkinlik oluşturulamadı (${e.slug}): ${error?.message}`);
    eventIds[e.slug] = created.id;
  }
  console.log(`  ${events.length} etkinlik hazır.`);

  console.log("→ Akademi: 3 ders");
  const COURSES = [
    {
      slug: "evrim-101",
      title: "Evrim 101",
      subtitle: "Doğal seçilimden ortak atalara",
      description: "Evrimi lise korkularından arındırıp, meraklı her okurun anlayabileceği şekilde anlatan giriş düzeyinde bir seri.",
      level: "giriş",
      cadence: "haftalık",
      color: "#F0611F",
      createdBy: "zeynep_can",
      lessons: [
        { slug: "evrim-nedir", title: "Evrim Nedir, Ne Değildir?", order: 1, duration: 12, content: "Evrim, popüler kültürde sıkça yanlış anlaşılan bir kavram.\n\nBu derste evrimin ne olduğunu ve **ne olmadığını** netleştiriyoruz.", startsAt: daysAgo(14), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders1" },
        { slug: "dogal-secilim", title: "Doğal Seçilim ve Uyum", order: 2, duration: 15, content: "Darwin'in en temel fikri: farklı üreme başarısı.", startsAt: daysAgo(7), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders2" },
        { slug: "ortak-atalar", title: "Ortak Atalar ve Filogenetik Ağaçlar", order: 3, duration: 14, content: "Tüm yaşam neden tek bir ağaçla temsil edilebilir?", startsAt: daysFromNow(2), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders3" },
        { slug: "insanin-evrimi", title: "İnsanın Evrimi: Kısa Bir Tur", order: 4, duration: 18, content: "Homo cinsinin kısa tarihi.", startsAt: daysFromNow(9), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders4" },
        { slug: "yanlis-anlamalar", title: "Yaygın Yanlış Anlamalar", order: 5, duration: 10, content: "Sık sorulan soruları yanıtlıyoruz.", startsAt: daysFromNow(16), isOnline: true, locationUrl: "https://meet.example.com/evrim-101-ders5" },
      ],
    },
    {
      slug: "felsefeye-giris-101",
      title: "Felsefeye Giriş 101",
      subtitle: "Sorularla başlayan bir yolculuk",
      description: "Felsefeyi akademik jargondan arındırıp günlük sorularla başlatan bir giriş serisi.",
      level: "giriş",
      cadence: "haftalık",
      color: "#6F5A94",
      createdBy: "sude_demir",
      lessons: [
        { slug: "felsefe-nedir", title: "Felsefe Nedir?", order: 1, duration: 10, content: "Felsefe, sorulması 'garip' görünen soruları ciddiye almaktır.", startsAt: daysAgo(10), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20 },
        { slug: "bilgi-kurami", title: "Bilgi Kuramına Giriş", order: 2, duration: 13, content: "Bir şeyi 'bildiğimizi' nasıl biliriz? Epistemolojiye kısa bir giriş.", startsAt: daysAgo(3), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20 },
        { slug: "etik-iyi-nedir", title: "Etik: İyi Nedir?", order: 3, duration: 14, content: "Fayda mı, ödev mi, erdem mi? Üç büyük etik yaklaşıma hızlı bir bakış.", startsAt: daysFromNow(4), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20 },
        { slug: "varolusculuk-101", title: "Varoluşçuluk 101", order: 4, duration: 16, content: "'Varoluş özden önce gelir' ne demek? Sartre ve Camus üzerinden kısa bir tur.", startsAt: daysFromNow(11), isOnline: false, locationName: "Kadıköy, Moda — Sayfa Kahve", capacity: 20 },
      ],
    },
    {
      slug: "distopya-edebiyati-101",
      title: "Distopya Edebiyatına Giriş",
      subtitle: "Karanlık geleceklerden bugüne bakmak",
      description: "Distopya türünün kökenlerinden bugünün örneklerine kısa ve derli toplu bir tur.",
      level: "orta",
      cadence: "aylık",
      color: "#35594D",
      createdBy: "mert_aydin",
      lessons: [
        { slug: "distopyanin-kokenleri", title: "Distopyanın Kökenleri", order: 1, duration: 11, content: "Ütopyadan distopyaya: tür nasıl doğdu?", startsAt: daysAgo(20), isOnline: true, locationUrl: "https://meet.example.com/distopya-101-ders1" },
        { slug: "1984-totaliter-kurgu", title: "1984 ve Totaliter Kurgu", order: 2, duration: 15, content: "Orwell'in gözetim toplumu tasviri bugün nasıl okunmalı?", startsAt: daysFromNow(10), isOnline: true, locationUrl: "https://meet.example.com/distopya-101-ders2" },
        { slug: "bugunun-distopyalari", title: "Bugünün Distopyaları", order: 3, duration: 13, content: "Algoritmalar, veri ve rıza: güncel distopik kurgu neyi konuşuyor?", startsAt: daysFromNow(40), isOnline: true, locationUrl: "https://meet.example.com/distopya-101-ders3" },
      ],
    },
  ] as const;

  const courseIds: Record<string, string> = {};
  const lessonIds: Record<string, string[]> = {};
  for (const c of COURSES) {
    const { data: existingCourse } = await supabase.from("academy_courses").select("id").eq("slug", c.slug).maybeSingle();
    let courseId = existingCourse?.id as string | undefined;
    if (!courseId) {
      const { data: created, error } = await supabase
        .from("academy_courses")
        .insert({
          slug: c.slug,
          title: c.title,
          subtitle: c.subtitle,
          description: c.description,
          level: c.level,
          cadence: c.cadence,
          color: c.color,
          created_by: userIds[c.createdBy],
        })
        .select("id")
        .single();
      if (error || !created) throw new Error(`Akademi kursu oluşturulamadı (${c.slug}): ${error?.message}`);
      courseId = created.id;
    }
    courseIds[c.slug] = courseId as string;
    lessonIds[c.slug] = [];
    for (const l of c.lessons) {
      const { data: lesson, error } = await supabase
        .from("academy_lessons")
        .upsert(
          {
            course_id: courseId,
            slug: l.slug,
            title: l.title,
            order_index: l.order,
            duration_minutes: l.duration,
            content: l.content,
            starts_at: "startsAt" in l ? l.startsAt : null,
            is_online: "isOnline" in l ? l.isOnline : true,
            location_name: "locationName" in l ? l.locationName : null,
            location_url: "locationUrl" in l ? l.locationUrl : null,
            capacity: "capacity" in l ? l.capacity : null,
          },
          { onConflict: "course_id,slug" }
        )
        .select("id")
        .single();
      if (!error && lesson) lessonIds[c.slug].push(lesson.id);
    }
  }
  console.log(`  ${COURSES.length} Akademi dersi hazır (${Object.values(lessonIds).reduce((n, l) => n + l.length, 0)} modül).`);

  console.log("→ Blog yazıları");
  const blogPosts = [
    { author: "defne_ipek", slug: "kurk-mantolu-madonna-uzerine", title: "Kürk Mantolu Madonna Üzerine: Sessizliğin Sesi", summary: "Sabahattin Ali'nin az konuşan kahramanı, aslında en çok o mu anlatıyor?", color: "#C05F82", tags: ["inceleme", "türk edebiyatı"], publishedAt: daysAgo(2), body: "Kürk Mantolu Madonna'yı üçüncü kez okudum ve her seferinde Raif Efendi'nin sessizliğinde yeni bir şey buluyorum." },
    { author: "omer_faruk", slug: "bir-kahve-bir-kitap-okuma-rutinim", title: "Bir Kahve, Bir Kitap: Okuma Rutinim", summary: "Günde 20 sayfa okumak için kendime nasıl bir ritüel kurdum.", color: "#B8791B", tags: ["günlük"], publishedAt: daysAgo(5), body: "İki yıl önce okuyamıyorum diyip duruyordum. Sorun zamanım değildi, rutinimdi.\n\nŞimdi günde en az 20 sayfa okuyorum, bazen fark etmeden 50'yi buluyorum." },
    { author: "zeynep_can", slug: "evrim-101i-neden-actim", title: "Evrim 101'i Neden Açtım", summary: "Akademi'deki ilk dersimin arka planı.", color: "#D24915", tags: ["akademi", "bilim"], publishedAt: daysAgo(9), body: "Kitapmeetup'ta herkesin bir konuda \"101\" anlatabileceği bir alan olsun istedik. Benim alanım biyoloji, ve evrim üzerine en çok yanlış anlaşılan kavramları düzeltmek istedim.\n\nDersleri kısa tutmaya özen gösteriyorum — amaç uzmanlaşmak değil, meraklanmak." },
    { author: "mert_aydin", slug: "neden-hala-1984-okuyoruz", title: "Neden Hâlâ 1984 Okuyoruz?", summary: "Bir distopya klasiği, yayınlandığı yıldan bu yana neden hâlâ güncel?", color: "#35594D", tags: ["distopya", "inceleme"], publishedAt: daysAgo(12), body: "1984'ü her okuduğumda, \"bu sefer eskimiş bulacağım\" diye düşünüyorum. Hiç olmuyor.\n\n## Gözetimin biçimi değişti, kaygısı değişmedi\n\nOrwell'in tele-ekranları bugün cebimizde. Ama kitabın asıl korkuttuğu şey teknoloji değil, dilin ve hafızanın nasıl bükülebildiği." },
    { author: "sude_demir", slug: "siirle-felsefe-arasinda", title: "Şiirle Felsefe Arasında", summary: "İki farklı düşünme biçimi, aslında sandığımızdan daha yakın.", color: "#6F5A94", tags: ["şiir", "felsefe"], publishedAt: daysAgo(16), body: "Felsefe soruyu netleştirir, şiir soruyu hissettirir. İkisi de aynı yere gidiyor bence: dikkatle bakmaya.\n\nBir dizeyi bir önerme gibi, bir önermeyi bir dize gibi okumayı deneyin — çok şey değişiyor." },
  ];
  for (const b of blogPosts) {
    const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", b.slug).maybeSingle();
    if (existing) continue;
    await supabase.from("blog_posts").insert({
      author_id: userIds[b.author],
      slug: b.slug,
      title: b.title,
      summary: b.summary,
      color: b.color,
      tags: b.tags,
      body: b.body,
      published_at: b.publishedAt,
    });
  }
  console.log(`  ${blogPosts.length} blog yazısı hazır.`);

  console.log("→ Yayınevi gönderisi (örnek)");
  const { count: yordamPostCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userIds.yordam_kitap);
  if (!yordamPostCount) {
    await supabase.from("posts").insert({
      author_id: userIds.yordam_kitap,
      type: "text",
      body: "Merhaba Kitapmeetup topluluğu! 📚 Yeni çıkan çeviri kitabımız için önümüzdeki ay bir imza günü + sohbet buluşması planlıyoruz. Takipte kalın.",
    });
    console.log("  1 yayınevi gönderisi eklendi.");
  }

  console.log("→ Kitap kataloğu");
  const { data: existingBooks } = await supabase.from("books").select("title");
  const existingTitles = new Set((existingBooks ?? []).map((b) => b.title.trim().toLowerCase()));
  const newCatalogBooks = BOOK_CATALOG.filter((b) => !existingTitles.has(b.title.trim().toLowerCase()));

  const CATALOG_CHUNK_SIZE = 200;
  for (let i = 0; i < newCatalogBooks.length; i += CATALOG_CHUNK_SIZE) {
    const chunk = newCatalogBooks.slice(i, i + CATALOG_CHUNK_SIZE).map((b) => ({
      title: b.title,
      author: b.author,
      spine_color: spineColorFor(b.title),
      genre: b.genre,
      added_by: userIds.elif_yalcin,
    }));
    const { error } = await supabase.from("books").insert(chunk);
    if (error) console.warn(`  ⚠️  Katalog parçası eklenemedi (${i}-${i + chunk.length}): ${error.message}`);
  }
  console.log(`  ${newCatalogBooks.length} yeni katalog kitabı eklendi (toplam katalog: ${BOOK_CATALOG.length}).`);

  console.log("→ Günün soruları");
  const { count: promptCount } = await supabase.from("daily_prompts").select("id", { count: "exact", head: true });
  if (!promptCount) {
    await supabase.from("daily_prompts").insert(DAILY_PROMPTS.map((question) => ({ question })));
  }
  console.log(`  ${DAILY_PROMPTS.length} soru hazır.`);

  // ───────────────────────────────────────────────────────────────────────
  // Topluluk: ~230 sentetik üye + tüm aktivite (kulüp üyeliği, raf, gönderi,
  // beğeni, yorum, takip, etkinlik katılımı, Akademi kaydı). Bu bölüm SADECE
  // topluluk henüz küçükken çalışır — tekrar tekrar çalıştırıp veriyi
  // şişirmesin diye.
  // ───────────────────────────────────────────────────────────────────────
  const { count: profileCount } = await supabase.from("profiles").select("id", { count: "exact", head: true });

  if ((profileCount ?? 0) >= 50) {
    console.log(`\n→ Topluluk zaten dolu görünüyor (${profileCount} profil) — sentetik üye/aktivite üretimi atlanıyor.`);
  } else {
    console.log(`\n→ Topluluk üyeleri (${SYNTHETIC_USER_COUNT} sentetik üye oluşturuluyor, biraz sürebilir)`);
    const syntheticUsers = generateSyntheticUsers(SYNTHETIC_USER_COUNT);
    let done = 0;
    const failed: string[] = [];
    await mapPool(syntheticUsers, 6, async (u) => {
      try {
        userIds[u.username] = await getOrCreateUser(u);
      } catch (err) {
        failed.push(u.username);
        console.warn(`  ⚠️  ${u.username} oluşturulamadı: ${(err as Error).message}`);
      }
      done++;
      if (done % 40 === 0) console.log(`  ...${done}/${syntheticUsers.length}`);
    });
    const allUsernames = Object.keys(userIds);
    const allUids = Object.values(userIds);
    console.log(`  ${allUsernames.length} kullanıcı hazır (${failed.length} başarısız).`);

    console.log("→ Kulüp üyelikleri (topluluk)");
    const clubMembershipRows: { club_id: string; user_id: string; role: string }[] = [];
    for (const u of syntheticUsers) {
      if (!userIds[u.username]) continue;
      const chosenClubs = pickN(Object.values(clubIds), weightedClubCount());
      for (const clubId of chosenClubs) {
        clubMembershipRows.push({ club_id: clubId, user_id: userIds[u.username], role: "member" });
      }
    }
    await bulkUpsert("club_members", clubMembershipRows, "club_id,user_id");
    console.log(`  ${clubMembershipRows.length} yeni üyelik eklendi.`);

    console.log("→ Raf kayıtları (topluluk)");
    const shelfRows: { user_id: string; book_id: string; status: string }[] = [];
    for (const u of syntheticUsers) {
      if (!userIds[u.username]) continue;
      const chosenBooks = pickN(Object.keys(bookIds), randInt(1, 4));
      for (const key of chosenBooks) {
        shelfRows.push({ user_id: userIds[u.username], book_id: bookIds[key], status: weightedShelfStatus() });
      }
    }
    await bulkUpsert("shelf_entries", shelfRows, "user_id,book_id");
    console.log(`  ${shelfRows.length} yeni raf kaydı eklendi.`);

    console.log("→ Gönderiler (topluluk akışı)");
    const clubSlugs = Object.keys(clubIds);
    const bookKeys = Object.keys(bookIds);
    const POST_COUNT = 150;
    const postRows: { author_id: string; type: string; body: string; club_id: string | null; book_id: string | null; created_at: string }[] = [];
    for (let i = 0; i < POST_COUNT; i++) {
      const tmpl = pick(POST_BODIES);
      const author = pick(allUsernames);
      const attachClub = Math.random() < 0.35 ? pick(clubSlugs) : null;
      const attachBook = Math.random() < 0.3 ? pick(bookKeys) : null;
      // Yakın tarihli gönderiler daha olası (üstel dağılım) — akış "canlı" hissettirsin.
      const daysBack = Math.floor(Math.pow(Math.random(), 1.6) * 45);
      const secondsBack = randInt(0, 86399);
      postRows.push({
        author_id: userIds[author],
        type: tmpl.type,
        body: tmpl.body,
        club_id: attachClub ? clubIds[attachClub] : null,
        book_id: attachBook ? bookIds[attachBook] : null,
        created_at: new Date(Date.now() - daysBack * 86400000 - secondsBack * 1000).toISOString(),
      });
    }
    const { data: insertedPosts, error: postsError } = await supabase.from("posts").insert(postRows).select("id, created_at");
    if (postsError) console.warn(`  ⚠️  Gönderiler eklenemedi: ${postsError.message}`);
    console.log(`  ${insertedPosts?.length ?? 0} gönderi eklendi.`);

    console.log("→ Beğeniler ve yorumlar");
    const likeRows: { post_id: string; user_id: string }[] = [];
    const commentRows: { author_id: string; target_type: string; target_id: string; body: string; created_at: string }[] = [];
    for (const post of insertedPosts ?? []) {
      const likers = pickN(allUids, randInt(3, 40));
      for (const uid of likers) likeRows.push({ post_id: post.id, user_id: uid });

      const commentCount = Math.random() < 0.55 ? randInt(1, 6) : 0;
      const commenters = pickN(allUids, commentCount);
      const postTime = new Date(post.created_at).getTime();
      for (const uid of commenters) {
        commentRows.push({
          author_id: uid,
          target_type: "post",
          target_id: post.id,
          body: pick(COMMENT_TEMPLATES),
          created_at: new Date(postTime + randInt(2, 4000) * 60000).toISOString(),
        });
      }
    }
    await bulkInsert("post_likes", likeRows);
    await bulkInsert("comments", commentRows);
    console.log(`  ${likeRows.length} beğeni, ${commentRows.length} yorum eklendi.`);

    console.log("→ Kitap takası ilanları (elimde var + arıyorum)");
    const TAKAS_COUNT = 14;
    const TAKAS_ARAMA_COUNT = 10;
    const takasRows: { author_id: string; type: string; body: string; club_id: null; book_id: string; counter_book_id: string | null; created_at: string }[] = [];
    for (let i = 0; i < TAKAS_COUNT; i++) {
      const author = pick(allUsernames);
      const daysBack = randInt(0, 30);
      takasRows.push({
        author_id: userIds[author],
        type: "takas",
        body: pick(TAKAS_NOTES),
        club_id: null,
        book_id: bookIds[pick(bookKeys)],
        counter_book_id: null,
        created_at: new Date(Date.now() - daysBack * 86400000).toISOString(),
      });
    }
    for (let i = 0; i < TAKAS_ARAMA_COUNT; i++) {
      const author = pick(allUsernames);
      const daysBack = randInt(0, 30);
      const hasCounter = Math.random() < 0.5;
      takasRows.push({
        author_id: userIds[author],
        type: "takas_arama",
        body: pick(TAKAS_ARAMA_NOTES),
        club_id: null,
        book_id: bookIds[pick(bookKeys)],
        counter_book_id: hasCounter ? bookIds[pick(bookKeys)] : null,
        created_at: new Date(Date.now() - daysBack * 86400000).toISOString(),
      });
    }
    const { data: insertedTakas, error: takasError } = await supabase
      .from("posts")
      .insert(takasRows)
      .select("id, author_id, book_id, type, created_at");
    if (takasError) console.warn(`  ⚠️  Takas ilanları eklenemedi: ${takasError.message}`);

    const offerRows: { post_id: string; offerer_id: string; book_id: string; message: string; status: string; created_at: string }[] = [];
    for (const t of insertedTakas ?? []) {
      const offerers = pickN(
        allUids.filter((id) => id !== t.author_id),
        randInt(0, 4)
      );
      const listingTime = new Date(t.created_at).getTime();
      offerers.forEach((uid) => {
        // "arıyorum" ilanlarında yanıt zaten aranan kitabı onaylar — uygulamadaki
        // makeOfferAction ile aynı mantık: kitap yeniden sorulmaz.
        const responseBookId = t.type === "takas_arama" ? t.book_id : bookIds[pick(bookKeys)];
        if (!responseBookId) return;
        offerRows.push({
          post_id: t.id,
          offerer_id: uid,
          book_id: responseBookId,
          message: Math.random() < 0.6 ? pick(t.type === "takas_arama" ? TAKAS_ARAMA_OFFER_MESSAGES : TAKAS_OFFER_MESSAGES) : "",
          status: "pending",
          created_at: new Date(listingTime + randInt(60, 20000) * 60000).toISOString(),
        });
      });
    }
    await bulkInsert("swap_offers", offerRows);
    console.log(`  ${insertedTakas?.length ?? 0} takas ilanı, ${offerRows.length} teklif eklendi.`);

    console.log("→ Takip ilişkileri");
    const followRows: { follower_id: string; following_id: string }[] = [];
    const seenFollowPairs = new Set<string>();
    for (const uid of allUids) {
      const candidates = pickN(
        allUids.filter((id) => id !== uid),
        randInt(2, 18)
      );
      for (const followingId of candidates) {
        const key = `${uid}:${followingId}`;
        if (seenFollowPairs.has(key)) continue;
        seenFollowPairs.add(key);
        followRows.push({ follower_id: uid, following_id: followingId });
      }
    }
    await bulkUpsert("follows", followRows, "follower_id,following_id");
    console.log(`  ${followRows.length} takip ilişkisi eklendi.`);

    console.log("→ Etkinlik katılımları");
    const rsvpRows: { event_id: string; user_id: string; status: string }[] = [];
    for (const slug of Object.keys(eventIds)) {
      const goingCount = randInt(15, 70);
      const interestedCount = randInt(5, 25);
      const chosen = pickN(allUids, goingCount + interestedCount);
      chosen.forEach((uid, idx) => {
        rsvpRows.push({ event_id: eventIds[slug], user_id: uid, status: idx < goingCount ? "going" : "interested" });
      });
    }
    await bulkUpsert("event_rsvps", rsvpRows, "event_id,user_id");
    console.log(`  ${rsvpRows.length} etkinlik katılımı eklendi.`);

    console.log("→ Etkinlik kayıt formu (örnek — Kitapmeetup Pikniği)");
    const piknikEventId = eventIds["kitapmeetup-buyuk-piknik"];
    if (piknikEventId) {
      const { count: existingFieldCount } = await supabase
        .from("event_registration_fields")
        .select("id", { count: "exact", head: true })
        .eq("event_id", piknikEventId);
      if (!existingFieldCount) {
        const { data: insertedFields } = await supabase
          .from("event_registration_fields")
          .insert([
            { event_id: piknikEventId, label: "Getirebileceğin bir atıştırmalık var mı?", field_type: "text", order_index: 0 },
            {
              event_id: piknikEventId,
              label: "Battaniyen var mı?",
              field_type: "select",
              options: ["Evet, getiririm", "Hayır, paylaşırım olur mu?"],
              is_required: true,
              order_index: 1,
            },
          ])
          .select("id, field_type");
        const snackFieldId = insertedFields?.find((f) => f.field_type === "text")?.id;
        const blanketFieldId = insertedFields?.find((f) => f.field_type === "select")?.id;
        const piknikGoers = rsvpRows.filter((r) => r.event_id === piknikEventId && r.status === "going").slice(0, 12);
        const answerRows: { field_id: string; event_id: string; user_id: string; value: string }[] = [];
        piknikGoers.forEach((r) => {
          if (blanketFieldId) {
            answerRows.push({ field_id: blanketFieldId, event_id: piknikEventId, user_id: r.user_id, value: pick(["Evet, getiririm", "Hayır, paylaşırım olur mu?"]) });
          }
          if (snackFieldId && Math.random() < 0.6) {
            answerRows.push({ field_id: snackFieldId, event_id: piknikEventId, user_id: r.user_id, value: pick(["Kurabiye", "Meyve", "Limonata", "Cips"]) });
          }
        });
        if (answerRows.length) await bulkInsert("event_registration_answers", answerRows);
        console.log(`  2 kayıt sorusu, ${answerRows.length} yanıt eklendi.`);
      }
    }

    console.log("→ Mekan check-in'leri ve notları (topluluk)");
    // "Haftanın Mekanı" editöryel değil — gerçek check-in dağılımından
    // dinamik olarak hesaplanıyor, o yüzden burada tek bir mekana ağırlık
    // vermiyoruz, tamamen rastgele dağıtıyoruz.
    const venueSlugs = Object.keys(venueIds);
    const CHECKIN_COUNT = 90;
    const checkinRows: { venue_id: string; user_id: string; note: string | null; created_at: string }[] = [];
    for (let i = 0; i < CHECKIN_COUNT; i++) {
      const venueSlug = pick(venueSlugs);
      const uid = pick(allUids);
      const hoursBack = randInt(0, 24 * 6);
      checkinRows.push({
        venue_id: venueIds[venueSlug],
        user_id: uid,
        note: Math.random() < 0.3 ? "Şu an buradayım, okuyorum 📖" : null,
        created_at: hoursAgo(hoursBack),
      });
    }
    await bulkInsert("venue_checkins", checkinRows);

    const noteRows: { venue_id: string; author_id: string; rating: number; body: string }[] = [];
    const seenVenueNoteAuthors = new Set(VENUE_NOTES.map((n) => `${n.venueSlug}:${n.author}`));
    const VENUE_NOTE_COUNT = 40;
    for (let i = 0; i < VENUE_NOTE_COUNT; i++) {
      const venueSlug = pick(venueSlugs);
      const uid = pick(allUsernames);
      const key = `${venueSlug}:${uid}`;
      if (seenVenueNoteAuthors.has(key) || !userIds[uid]) continue;
      seenVenueNoteAuthors.add(key);
      noteRows.push({ venue_id: venueIds[venueSlug], author_id: userIds[uid], rating: randInt(3, 5), body: pick(VENUE_NOTE_BODIES) });
    }
    await bulkUpsert("venue_notes", noteRows, "venue_id,author_id");
    console.log(`  ${checkinRows.length} check-in, ${noteRows.length} mekan notu eklendi.`);

    console.log("→ Akademi kayıtları");
    const enrollRows: { course_id: string; user_id: string }[] = [];
    const progressRows: { lesson_id: string; user_id: string }[] = [];
    const lessonRsvpRows: { lesson_id: string; user_id: string; status: string }[] = [];
    const enrollTargets: Record<string, number> = { "evrim-101": 140, "felsefeye-giris-101": 100, "distopya-edebiyati-101": 70 };
    for (const slug of Object.keys(courseIds)) {
      const enrolled = pickN(allUids, enrollTargets[slug] ?? 60);
      const lessons = lessonIds[slug] ?? [];
      for (const uid of enrolled) {
        enrollRows.push({ course_id: courseIds[slug], user_id: uid });
        const completed = pickN(lessons, randInt(0, lessons.length));
        for (const lessonId of completed) progressRows.push({ lesson_id: lessonId, user_id: uid });
      }
      // Her ders buluşması için ayrı ayrı — kayıtlı olmayan biri bile tek bir
      // derse "gidiyorum" diyebilir (gerçek etkinliklerde olduğu gibi).
      for (const lessonId of lessons) {
        const goingCount = randInt(6, 40);
        const interestedCount = randInt(2, 15);
        const chosen = pickN(allUids, goingCount + interestedCount);
        chosen.forEach((uid, idx) => {
          lessonRsvpRows.push({ lesson_id: lessonId, user_id: uid, status: idx < goingCount ? "going" : "interested" });
        });
      }
    }
    await bulkUpsert("academy_enrollments", enrollRows, "course_id,user_id");
    await bulkUpsert("academy_lesson_progress", progressRows, "lesson_id,user_id");
    await bulkUpsert("academy_lesson_rsvps", lessonRsvpRows, "lesson_id,user_id");
    console.log(`  ${enrollRows.length} Akademi kaydı, ${progressRows.length} tamamlanan ders, ${lessonRsvpRows.length} ders katılımı eklendi.`);

    console.log(`\n✅ Topluluk hazır: ${allUsernames.length} kullanıcı, ${clubMembershipRows.length} kulüp üyeliği, ${insertedPosts?.length ?? 0} gönderi, ${likeRows.length} beğeni, ${followRows.length} takip.`);
  }

  console.log("\n✅ Tamamlandı! Tüm seed kullanıcıları aynı şifreyi paylaşır:", DEMO_PASSWORD);
  console.log("   Örnek giriş: elif@kitapmeetup.test /", DEMO_PASSWORD);
}

main().catch((err) => {
  console.error("\n❌ Seed işlemi başarısız:", err);
  process.exit(1);
});
