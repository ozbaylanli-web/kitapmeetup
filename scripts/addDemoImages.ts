/**
 * Kitapmeetup — mevcut örnek veriye telifsiz/placeholder görseller ekler.
 *
 * seed.ts'in aksine bu script veri ÜRETMEZ, sadece zaten var olan kayıtlara
 * (bazı profillere avatar, "photo" türü gönderilere fotoğraf, birkaç kulüp/
 * etkinliğe kapak) görsel URL'i yazar. Avatar/Günün Sorusu cevapları sadece
 * EKSİK olanlara eklenir; gönderi fotoğrafları ve kulüp/etkinlik kapakları
 * HER ÇALIŞTIRMADA güncellenir (anahtar kelime kuralları değiştiyse
 * görselleri yenilemek için).
 *
 * Kaynaklar (üçü de ücretsiz, API anahtarı gerektirmeyen, hotlink için
 * tasarlanmış placeholder servisleri):
 *  - i.pravatar.cc   → gerçekçi sahte profil fotoğrafları
 *  - loremflickr.com → gönderinin/kulübün/etkinliğin İÇERİĞİYLE ilgili
 *    ANAHTAR KELİMEYE göre gerçek stok fotoğraf (kitap, kahve, kütüphane vb.)
 *  - picsum.photos   → loremflickr'ın HİÇBİR adayı çalışmazsa son çare
 *    (konuyla ilgisiz ama en azından her zaman gerçek bir görsel döner)
 *
 * ÖNEMLİ: loremflickr bazı çok özel/bileşik anahtar kelime kombinasyonlarında
 * (Flickr'da o etiketle eşleşen fotoğraf bulamayınca) güvenilir biçimde 500
 * hatası veriyor. Bu yüzden her aday URL, veritabanına yazılmadan ÖNCE gerçek
 * bir HEAD isteğiyle doğrulanıyor (verifyImageUrl) — kırık görsel linki asla
 * kaydedilmez.
 *
 * Kullanım: npm run db:seed:images
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("\n❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli (.env.local).\n");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function pravatarUrl(seed: string): string {
  return `https://i.pravatar.cc/300?u=${encodeURIComponent(seed)}`;
}

/** seed'e göre sabit (deterministik) bir sayı üretir - loremflickr'ın ?lock= parametresi için. */
function lockFor(seed: string): number {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 100000;
}

function loremflickrUrl(keywords: string, seed: string, w: number, h: number): string {
  return `https://loremflickr.com/${w}/${h}/${keywords}?lock=${lockFor(seed)}`;
}
function picsumUrl(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

async function verifyImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return res.ok && (res.headers.get("content-type") ?? "").startsWith("image/");
  } catch {
    return false;
  }
}

/** Anahtar kelime adaylarını sırayla dener (her biri gerçek bir HEAD isteğiyle doğrulanır), hiçbiri çalışmazsa picsum'a düşer. */
async function pickWorkingImageUrl(keywordCandidates: string[], seed: string, w = 800, h = 600): Promise<string> {
  for (const keywords of keywordCandidates) {
    const url = loremflickrUrl(keywords, seed, w, h);
    if (await verifyImageUrl(url)) return url;
  }
  return picsumUrl(seed, w, h);
}

// Gönderi metnindeki ipuçlarına göre konuyla ilgili anahtar kelime adayları
// seç (en özelden en genele) - bulunamazsa genel "books,reading"a düşer.
// Sıra önemli: daha özel eşleşmeler üstte.
const POST_KEYWORD_RULES: { match: RegExp; candidates: string[] }[] = [
  { match: /kahve|çay/i, candidates: ["coffee,book", "coffee,books"] },
  { match: /kütüphane/i, candidates: ["library,books", "library"] },
  { match: /kitapçı/i, candidates: ["bookstore", "books,bookstore"] },
  { match: /ayracımı|ayracı/i, candidates: ["bookmark,book", "bookmark"] },
  { match: /raf|kitaplığımı|kitaplığındaki/i, candidates: ["bookshelf,books", "bookshelf"] },
  { match: /notlarım/i, candidates: ["notebook,book", "notebook"] },
  { match: /park/i, candidates: ["park,reading", "park,book"] },
  { match: /battaniye|yağmurlu/i, candidates: ["cozy,book,blanket", "cozy,book"] },
  { match: /yeni kitap|yeni gelen/i, candidates: ["newbooks", "books,stack"] },
  { match: /metroda|tren/i, candidates: ["train,book", "train,reading"] },
];

function keywordCandidatesForPost(body: string | null, bookGenre: string | null): string[] {
  const text = body ?? "";
  for (const rule of POST_KEYWORD_RULES) {
    if (rule.match.test(text)) return [...rule.candidates, "books"];
  }
  if (bookGenre?.toLowerCase().includes("bilimkurgu")) return ["sciencefiction,books", "sciencefiction", "books"];
  if (bookGenre?.toLowerCase().includes("şiir") || bookGenre?.toLowerCase().includes("siir")) return ["poetry,coffee", "poetry", "books"];
  return ["books,reading", "books"];
}

// 2 kulüp ve 2 etkinlik için örnek kapak fotoğrafı - "bir iki tanesinde
// kapak fotoğrafı olsun" isteği için, hepsine değil. Her biri kendi temasına
// uygun anahtar kelime adaylarıyla.
const CLUB_COVERS: { slug: string; candidates: string[] }[] = [
  { slug: "felsefe-kulubu", candidates: ["philosophy,books", "philosophy", "oldbooks"] },
  { slug: "bilimkurgu-kulubu", candidates: ["sciencefiction,space", "sciencefiction", "space"] },
];
const EVENT_COVERS: { slugPrefix: string; candidates: string[] }[] = [
  { slugPrefix: "kitapmeetup-buyuk-piknik", candidates: ["picnic,park", "picnic,books", "picnic"] },
  { slugPrefix: "siir-kulubu-acik-mikrofon", candidates: ["poetry,microphone", "poetry,coffee", "poetry"] },
];

async function main() {
  console.log("🖼️  Örnek görseller ekleniyor...\n");

  console.log("→ Profil fotoğrafları (avatar_url eksik olanların ~%55'i)");
  const { data: profiles } = await supabase.from("profiles").select("id, username, avatar_url").is("avatar_url", null);
  const targets = (profiles ?? []).filter(() => Math.random() < 0.55);
  let avatarCount = 0;
  for (const p of targets) {
    const { error } = await supabase.from("profiles").update({ avatar_url: pravatarUrl(p.username) }).eq("id", p.id);
    if (!error) avatarCount++;
  }
  console.log(`  ${avatarCount}/${targets.length} profile avatar eklendi (toplam ${profiles?.length ?? 0} avatarsız profil vardı).`);

  console.log("→ Kitap fotoğrafı gönderileri (tüm 'photo' türü gönderiler, konuyla ilgili + doğrulanmış görsellerle)");
  const { data: photoPosts } = await supabase.from("posts").select("id, body, book_id").eq("type", "photo");
  const bookIds = Array.from(new Set((photoPosts ?? []).map((p) => p.book_id).filter((id): id is string => Boolean(id))));
  const { data: books } = bookIds.length ? await supabase.from("books").select("id, genre").in("id", bookIds) : { data: [] };
  const genreByBookId = new Map((books ?? []).map((b) => [b.id, b.genre as string | null]));
  let postImageCount = 0;
  for (const p of photoPosts ?? []) {
    const genre = p.book_id ? (genreByBookId.get(p.book_id) ?? null) : null;
    const candidates = keywordCandidatesForPost(p.body, genre);
    const imageUrl = await pickWorkingImageUrl(candidates, p.id);
    const { error } = await supabase.from("posts").update({ image_url: imageUrl }).eq("id", p.id);
    if (!error) postImageCount++;
  }
  console.log(`  ${postImageCount}/${photoPosts?.length ?? 0} gönderiye konuyla ilgili, doğrulanmış fotoğraf eklendi.`);

  console.log("→ Günün Sorusu cevapları (image_url'i olmayan birkaçına)");
  const { data: promptAnswers } = await supabase.from("daily_prompt_answers").select("id").is("image_url", null).limit(5);
  let answerImageCount = 0;
  for (const a of promptAnswers ?? []) {
    if (Math.random() < 0.5) continue;
    const imageUrl = await pickWorkingImageUrl(["books,reading", "books"], a.id, 700, 500);
    const { error } = await supabase.from("daily_prompt_answers").update({ image_url: imageUrl }).eq("id", a.id);
    if (!error) answerImageCount++;
  }
  console.log(`  ${answerImageCount} cevaba fotoğraf eklendi.`);

  console.log("→ Kulüp kapak fotoğrafları (örnek — birkaç tanesine, temaya uygun + doğrulanmış)");
  let clubCoverCount = 0;
  for (const c of CLUB_COVERS) {
    const imageUrl = await pickWorkingImageUrl(c.candidates, `club-${c.slug}`, 1200, 500);
    const { error } = await supabase.from("clubs").update({ cover_url: imageUrl }).eq("slug", c.slug);
    if (!error) clubCoverCount++;
    else console.warn(`  ⚠️  ${c.slug}: ${error.message}`);
  }
  console.log(`  ${clubCoverCount}/${CLUB_COVERS.length} kulübe kapak eklendi.`);

  console.log("→ Etkinlik kapak fotoğrafları (örnek — birkaç tanesine, temaya uygun + doğrulanmış)");
  const { data: events } = await supabase.from("events").select("id, slug");
  let eventCoverCount = 0;
  for (const ec of EVENT_COVERS) {
    const match = (events ?? []).find((e) => e.slug.startsWith(ec.slugPrefix));
    if (!match) continue;
    const imageUrl = await pickWorkingImageUrl(ec.candidates, `event-${match.slug}`, 1200, 500);
    const { error } = await supabase.from("events").update({ cover_url: imageUrl }).eq("id", match.id);
    if (!error) eventCoverCount++;
    else console.warn(`  ⚠️  ${match.slug}: ${error.message}`);
  }
  console.log(`  ${eventCoverCount}/${EVENT_COVERS.length} etkinliğe kapak eklendi.`);

  console.log("\n✅ Tamamlandı.");
}

main().catch((err) => {
  console.error("\n❌ İşlem başarısız:", err);
  process.exit(1);
});
