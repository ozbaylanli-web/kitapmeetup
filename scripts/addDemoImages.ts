/**
 * Kitapmeetup — mevcut örnek veriye telifsiz/placeholder görseller ekler.
 *
 * seed.ts'in aksine bu script veri ÜRETMEZ, sadece zaten var olan kayıtlara
 * (bazı profillere avatar, "photo" türü gönderilere fotoğraf, birkaç kulüp/
 * etkinliğe kapak) görsel URL'i yazar. Tekrar çalıştırmak güvenlidir —
 * yalnızca görseli EKSİK olan kayıtları günceller.
 *
 * Kaynaklar (ikisi de ücretsiz, API anahtarı gerektirmeyen, hotlink için
 * tasarlanmış placeholder servisleri):
 *  - i.pravatar.cc  → gerçekçi sahte profil fotoğrafları
 *  - picsum.photos  → gerçek stok fotoğraflar (kitap/mekan/kapak için)
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
function picsumUrl(seed: string, w: number, h: number): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

// 2 kulüp ve 2 etkinlik için ornek kapak fotografi - "bir iki tanesinde
// kapak fotografi olsun" istegi icin, hepsine degil.
const CLUB_COVER_SLUGS = ["felsefe-kulubu", "bilimkurgu-kulubu"];
const EVENT_COVER_SLUGS_PREFIXES = ["kitapmeetup-buyuk-piknik", "siir-kulubu-acik-mikrofon"];

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

  console.log("→ Kitap fotoğrafı gönderileri (image_url eksik olan 'photo' türü gönderiler)");
  const { data: photoPosts } = await supabase.from("posts").select("id").eq("type", "photo").is("image_url", null);
  let postImageCount = 0;
  for (const p of photoPosts ?? []) {
    const { error } = await supabase.from("posts").update({ image_url: picsumUrl(p.id, 800, 600) }).eq("id", p.id);
    if (!error) postImageCount++;
  }
  console.log(`  ${postImageCount}/${photoPosts?.length ?? 0} gönderiye fotoğraf eklendi.`);

  console.log("→ Günün Sorusu cevapları (image_url'i olmayan birkaçına)");
  const { data: promptAnswers } = await supabase.from("daily_prompt_answers").select("id").is("image_url", null).limit(5);
  let answerImageCount = 0;
  for (const a of promptAnswers ?? []) {
    if (Math.random() < 0.5) continue;
    const { error } = await supabase.from("daily_prompt_answers").update({ image_url: picsumUrl(a.id, 700, 500) }).eq("id", a.id);
    if (!error) answerImageCount++;
  }
  console.log(`  ${answerImageCount} cevaba fotoğraf eklendi.`);

  console.log("→ Kulüp kapak fotoğrafları (örnek — birkaç tanesine)");
  let clubCoverCount = 0;
  for (const slug of CLUB_COVER_SLUGS) {
    const { error } = await supabase.from("clubs").update({ cover_url: picsumUrl(`club-${slug}`, 1200, 500) }).eq("slug", slug);
    if (!error) clubCoverCount++;
    else console.warn(`  ⚠️  ${slug}: ${error.message}`);
  }
  console.log(`  ${clubCoverCount}/${CLUB_COVER_SLUGS.length} kulübe kapak eklendi.`);

  console.log("→ Etkinlik kapak fotoğrafları (örnek — birkaç tanesine)");
  const { data: events } = await supabase.from("events").select("id, slug");
  let eventCoverCount = 0;
  for (const prefix of EVENT_COVER_SLUGS_PREFIXES) {
    const match = (events ?? []).find((e) => e.slug.startsWith(prefix));
    if (!match) continue;
    const { error } = await supabase.from("events").update({ cover_url: picsumUrl(`event-${match.slug}`, 1200, 500) }).eq("id", match.id);
    if (!error) eventCoverCount++;
    else console.warn(`  ⚠️  ${match.slug}: ${error.message}`);
  }
  console.log(`  ${eventCoverCount}/${EVENT_COVER_SLUGS_PREFIXES.length} etkinliğe kapak eklendi.`);

  console.log("\n✅ Tamamlandı.");
}

main().catch((err) => {
  console.error("\n❌ İşlem başarısız:", err);
  process.exit(1);
});
