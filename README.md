# Kitapmeetup 📖🧡

Kitap sohbetlerini yeniden buluşturan topluluk uygulaması — kulüpler, etkinlikler, bir Akademi, bir blog ve "ne okuyorum" akışıyla, eski **kitapmeetup.com** topluluğunun ruhunu yeniden canlandırıyor.

Tam ürün planı için: **[docs/PRD.md](docs/PRD.md)** · Gerçek kullanıcılara canlıya almak için: **[docs/DEPLOY.md](docs/DEPLOY.md)**

## Özellikler

- **Ana Akış** — metin, alıntı, kitap fotoğrafı ve soru paylaşımları; her gün değişen **Günün Sorusu**; topluluk genelinde "şu an ne okunuyor" şeridi.
- **Kulüpler** — Felsefe, Bilimkurgu, Şiir, Distopya + kullanıcıların açabileceği yeni kulüpler. Her kulübün kendi akışı, üyeleri, etkinlikleri ve eğlenceli bir **Kitap Ruleti**'si var.
- **Etkinlikler** — fiziksel/online buluşma oluşturma, RSVP (gidiyorum/ilgileniyorum), geçmiş/yaklaşan ayrımı.
- **Akademi** — haftalık/aylık yayınlanan temel eğitimler ("Evrim 101" gibi), ders bazlı ilerleme takibi.
- **Blog** — Markdown destekli uzun yazılar.
- **Profil / Ne Okuyorum** — görsel kitap rafı (okuyor/okudu/istiyor), otomatik hesaplanan okuma rozetleri, kulüpler ve gönderiler tek profilde.
- **Kitap Takası** — Ana Akış'tan "🔄 Takas" ile bir kitabını takasa açabilir **ya da "🔍 Arıyorum" ile aradığın bir kitabı ilan edip** (karşılığında verebileceğin bir kitabı da isteğe bağlı ekleyerek) "kimde var?" diye sorabilirsin. Takas ilanlarına isteyen kendi kitabıyla teklif yapar; arama ilanlarına ise "bende var" diye haber verilir. İlan sahibi tekliflerden birini kabul eder (kabul edilince diğer bekleyen teklifler otomatik kapanır).
- **Okuma odası ambiyansı** — isteğe bağlı, tamamen üretimsel (Web Audio API ile anlık sentezlenen, hiçbir ses dosyası indirilmeyen) sıcak bir fon sesi + ara sıra çalan meraklı bir "kıvılcım" çanı. Sidebar/Topbar'daki hoparlör ikonuyla açılır kapanır, asla kendiliğinden başlamaz.

## Teknik yığın

- **Next.js 16** (App Router, TypeScript, Turbopack) + **React 19**
- **Tailwind CSS v4** (CSS-first `@theme`, `src/app/globals.css` içinde marka renkleri)
- **Supabase** — Postgres + Auth + Storage + Row Level Security

## Önemli: önizleme (demo) modu

Bu proje, **Supabase bağlanmadan da çalışır.** `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` tanımlı değilse, `src/lib/data/*` içindeki tüm veri fonksiyonları otomatik olarak `src/lib/fixtures/index.ts` içindeki zengin örnek verilere düşer. Arayüzde "Elif Yalçın" adlı bir demo kullanıcı olarak gezinirsiniz; beğeni/RSVP/yorum gibi aksiyonlar tıklanabilir ama gerçek bir veritabanını değiştirmez — üzerlerine tıklandığında "Demo modu" notu görünür.

**Bu sayede:** `npm install && npm run dev` komutlarından sonra hiçbir kurulum yapmadan uygulamanın tamamını (tüm sayfalar, tüm etkileşimler) gerçek görünümüyle görebilirsiniz. Supabase'i bağladığınız an, **aynı kod** gerçek veritabanı ile çalışmaya başlar — tek satır değişiklik gerekmez.

## Hızlı başlangıç (önizleme modu)

```bash
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000).

## Gerçek Supabase'e bağlanmak

1. **Proje oluşturun:** [supabase.com](https://supabase.com) → New Project (ücretsiz katman yeterli).
2. **Şemayı kurun:** Supabase Dashboard → SQL Editor → `supabase/migrations/` klasöründeki dosyaları **sırasıyla** ([`0001_init.sql`](supabase/migrations/0001_init.sql) → [`0002_hedefler_davetler_ortak_okuma.sql`](supabase/migrations/0002_hedefler_davetler_ortak_okuma.sql) → [`0003_kitap_turu_ve_genisletilmis_eslesme.sql`](supabase/migrations/0003_kitap_turu_ve_genisletilmis_eslesme.sql) → [`0004_akademi_derslerini_bulusmaya_cevir.sql`](supabase/migrations/0004_akademi_derslerini_bulusmaya_cevir.sql) → [`0005_kitap_takasi.sql`](supabase/migrations/0005_kitap_takasi.sql) → [`0006_kitap_arama_ilanlari.sql`](supabase/migrations/0006_kitap_arama_ilanlari.sql) → [`0007_mekanlar.sql`](supabase/migrations/0007_mekanlar.sql) → [`0008_sistem_gonderileri.sql`](supabase/migrations/0008_sistem_gonderileri.sql) → [`0009_gunun_sorusu_cevaplari.sql`](supabase/migrations/0009_gunun_sorusu_cevaplari.sql) → [`0010_yayinevi_hesaplari.sql`](supabase/migrations/0010_yayinevi_hesaplari.sql) → [`0011_etkinlik_kayit_formlari.sql`](supabase/migrations/0011_etkinlik_kayit_formlari.sql) → [`0012_instagram_paylasimi.sql`](supabase/migrations/0012_instagram_paylasimi.sql)) yapıştırıp çalıştırın — hepsi gerekli. Bu dosyalar tüm tabloları, Row Level Security politikalarını ve `post-images`/`avatars` Storage bucket'larını oluşturur.
3. **Ortam değişkenlerini girin:** `.env.example` dosyasını `.env.local` olarak kopyalayın ve Supabase projenizin **Settings → API** sayfasından şu üç değeri girin:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   # sadece seed script için, asla istemciye göndermeyin
   ```
4. **Örnek veri yükleyin (opsiyonel ama önerilir):**
   ```bash
   npm run db:seed
   ```
   Bu script; demo kullanıcıları (`elif@kitapmeetup.test` vb., şifre: `kitapmeetup-demo-2026`), kulüpleri, kitapları, gönderileri, etkinlikleri, Akademi derslerini, blog yazılarını ve İstanbul'daki kitapçı/kitap kafe rehberini (Mekanlar) gerçek veritabanınıza yazar. Tekrar çalıştırmak güvenlidir.
5. **Sunucuyu yeniden başlatın:**
   ```bash
   npm run dev
   ```
   Artık üstteki "Önizleme modu" uyarısı kaybolur; giriş/kayıt, gönderi paylaşma, RSVP, kulüp kurma gibi tüm aksiyonlar gerçek verilerle çalışır.

> Kendi kullanıcı hesabınızla kayıt olduktan sonra Akademi'ye içerik ekleyebilmek için Supabase Dashboard'dan `profiles` tablosunda kendi satırınızın `is_admin` alanını `true` yapabilirsiniz.

## Proje yapısı

```
src/
  app/
    (app)/            # Ana uygulama kabuğu (Sidebar + üst/alt gezinme) altındaki tüm sayfalar
    (auth)/           # Giriş / kayıt sayfaları (farklı, ortalanmış layout)
    api/               # Route handler'lar (ör. yorum listeleme)
  components/          # UI bileşenleri, modüle göre klasörlenmiş (feed, clubs, events, academy, blog, profile, layout, ui)
  lib/
    actions/           # Server Actions — her biri "gerçek Supabase" ve "demo modu" yollarını birlikte yönetir
    data/              # Salt-okunur veri katmanı — Supabase bağlıysa gerçek sorgu, değilse fixture
    fixtures/          # Önizleme modunun örnek verisi (Türkçe, topluluk temalı)
    supabase/          # İstemci/sunucu Supabase client kurulumu + elle yazılmış veritabanı tipleri
    badges.ts          # Okuma rozetleri kuralları (profil aktivitesinden hesaplanır)
    nav.ts, utils.ts, types.ts
  proxy.ts             # Next.js 16'da "middleware"in yeni adı — Supabase oturum tazeleme
supabase/
  migrations/0001_init.sql   # Tüm şema + RLS politikaları + Storage bucket'ları
scripts/seed.ts         # Gerçek Supabase projesine örnek veri yükleme scripti
docs/PRD.md              # Ürün planı
```

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Prodüksiyon derlemesi |
| `npm run start` | Derlenmiş uygulamayı çalıştır |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript tip kontrolü |
| `npm run db:seed` | Bağlı Supabase projesine örnek veri yükle |

## Yol haritası

- **Mobil (Faz 2):** Aynı Supabase backend'i kullanan bir Expo/React Native uygulaması — `@supabase/supabase-js` istemcisi RN'de de çalışır, backend'i sıfırdan kurmaya gerek yok.
- Bildirimler, gelişmiş arama, kulüp yönetici paneli, Akademi'de video/ses desteği.

Ayrıntılar için [docs/PRD.md](docs/PRD.md).
