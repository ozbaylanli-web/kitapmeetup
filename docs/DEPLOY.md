# Kitapmeetup'ı canlıya alma rehberi

Bu doküman, uygulamayı **gerçek kullanıcılara açık bir web sitesi** olarak yayına almak için gereken tüm backend ve hosting adımlarını tek yerden toplar. Kod tarafında hiçbir ekstra iş yok — proje zaten hem "site" hem "app" olacak şekilde tek bir Next.js kod tabanı; Supabase'i bağlayıp bir alan adına dağıttığınız an ikisi de aynı anda, birebir aynı tasarım ve içerikle yayında olur.

> Genel mimari ve önizleme (demo) modu için önce **[README.md](../README.md)** içindeki "Gerçek Supabase'e bağlanmak" bölümünü okuyun — buradaki adımlar onun üzerine inşa edilir.

## 1. Supabase projesi (backend)

1. [supabase.com](https://supabase.com) → **New Project** (ücretsiz katman v1 için yeterli).
2. **SQL Editor** → `supabase/migrations/` klasöründeki dosyaları **sırasıyla** ([`0001_init.sql`](../supabase/migrations/0001_init.sql) → [`0002_hedefler_davetler_ortak_okuma.sql`](../supabase/migrations/0002_hedefler_davetler_ortak_okuma.sql) → [`0003_kitap_turu_ve_genisletilmis_eslesme.sql`](../supabase/migrations/0003_kitap_turu_ve_genisletilmis_eslesme.sql) → [`0004_akademi_derslerini_bulusmaya_cevir.sql`](../supabase/migrations/0004_akademi_derslerini_bulusmaya_cevir.sql) → [`0005_kitap_takasi.sql`](../supabase/migrations/0005_kitap_takasi.sql) → [`0006_kitap_arama_ilanlari.sql`](../supabase/migrations/0006_kitap_arama_ilanlari.sql) → [`0007_mekanlar.sql`](../supabase/migrations/0007_mekanlar.sql) → [`0008_sistem_gonderileri.sql`](../supabase/migrations/0008_sistem_gonderileri.sql) → [`0009_gunun_sorusu_cevaplari.sql`](../supabase/migrations/0009_gunun_sorusu_cevaplari.sql) → [`0010_yayinevi_hesaplari.sql`](../supabase/migrations/0010_yayinevi_hesaplari.sql) → [`0011_etkinlik_kayit_formlari.sql`](../supabase/migrations/0011_etkinlik_kayit_formlari.sql) → [`0012_instagram_paylasimi.sql`](../supabase/migrations/0012_instagram_paylasimi.sql)) yapıştırıp çalıştırın — hepsi gerekli. Bunlar tüm tabloları, indeksleri, Row Level Security politikalarını ve `avatars` / `post-images` Storage bucket'larını kurar.
3. **Authentication → URL Configuration**:
   - **Site URL**: canlı alan adınız, ör. `https://kitapmeetup.com` (sondaki `/` olmadan). Bu, kayıt/e-posta doğrulama linklerinin nereye yönleneceğini belirler — **yanlış bırakılırsa kullanıcılar doğrulama e-postasında `localhost` linkine tıklar.**
   - **Redirect URLs**: aynı alan adını (ve varsa `https://*.vercel.app` önizleme URL desenini) ekleyin.
4. **Authentication → Emails**: varsayılan şablonlar Türkçe değildir; isterseniz "Confirm signup" / "Reset password" şablonlarını Türkçeleştirin (opsiyonel, v1 için şart değil).
5. **Authentication → Providers → Email**: "Confirm email" açık kalabilir (varsayılan); kapatırsanız kullanıcılar e-posta doğrulamadan direkt giriş yapabilir (daha hızlı topluluk büyümesi ister, spam riskini göze alırsanız kapatabilirsiniz).
6. **Örnek veri (opsiyonel ama önerilir — boş bir uygulama yerine dolu bir topluluk hissiyle açılış için)**:
   ```bash
   npm run db:seed
   ```
   Demo kullanıcıları, kulüpleri, 700+ kitaplık kataloğu, etkinlikleri, Akademi derslerini, blog yazılarını ve İstanbul'daki kitapçı/kitap kafe rehberini (Mekanlar) yükler. Canlıya gerçek üyeler katılmaya başlayınca bu hesapları Dashboard'dan silebilir ya da öylece bırakabilirsiniz (görünür şekilde "kurucu ekip" hesapları gibi de kullanılabilir).
7. Kendi hesabınızla kayıt olduktan sonra Akademi'ye ders ekleyebilmek için **Table Editor → profiles** üzerinden kendi satırınızda `is_admin` = `true` yapın.
8. **Etkinlik kayıt onay e-postaları (opsiyonel)**: bir kullanıcı bir etkinliğe "Gidiyorum" dediğinde otomatik bir onay e-postası göndermek isterseniz **[docs/EMAIL_SETUP.md](EMAIL_SETUP.md)** adımlarını izleyin (ücretsiz, Google'ın kendi altyapısını kullanan bir seçenek dahil). Kurmazsanız uygulama yine sorunsuz çalışır, sadece e-posta gitmez.
9. **Instagram'da paylaşım (opsiyonel)**: yöneticilerin oluşturulan etkinlik/gönderileri topluluğun ortak Instagram hesabında tek tıkla paylaşabilmesi için **[docs/INSTAGRAM_SETUP.md](INSTAGRAM_SETUP.md)** adımlarını izleyin. Sitenizin canlı, sabit bir alan adına ihtiyacı var (Meta'nın OAuth redirect URI'si için) — bu yüzden bu adımı canlıya aldıktan sonra yapın.

## 2. Ortam değişkenleri

`.env.example` dosyasındaki üç grup değeri hosting sağlayıcınızın ortam değişkenleri panelinde tanımlayın (yerelde `.env.local`):

| Değişken | Nereden alınır | Not |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | İstemciye açık, sorun değil |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | İstemciye açık, sorun değil |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | **Yalnızca** `npm run db:seed` için — hosting'e girmenize gerek yok, girerseniz asla `NEXT_PUBLIC_` önekiyle kullanılmaz/istemciye gönderilmez |
| `NEXT_PUBLIC_SITE_URL` | Sizin alan adınız | `sitemap.xml`, `robots.txt` ve sosyal paylaşım kartları (Open Graph) için. Boş bırakılırsa `https://kitapmeetup.com` varsayılır |
| `GOOGLE_APPS_SCRIPT_EMAIL_URL` / `GOOGLE_APPS_SCRIPT_EMAIL_TOKEN` | Kendi Apps Script deploy'unuz — bkz. [EMAIL_SETUP.md](EMAIL_SETUP.md) | Opsiyonel — etkinlik kayıt onay e-postaları için |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | resend.com | Opsiyonel — yukarıdakinin alternatifi |
| `META_APP_ID` / `META_APP_SECRET` | developers.facebook.com — bkz. [INSTAGRAM_SETUP.md](INSTAGRAM_SETUP.md) | Opsiyonel — "Instagram'da paylaş" butonu için |

## 3. Hosting'e dağıtım

Proje sade bir Next.js 16 uygulaması olduğu için Vercel, Netlify, Cloudflare Pages veya kendi sunucunuzdan (`npm run build && npm run start`) yayınlanabilir. En az sürtünmeli yol Vercel'dir:

1. Depoyu GitHub'a itin (henüz bir git deposu değilse: `git init && git add -A && git commit -m "İlk sürüm"`).
2. [vercel.com/new](https://vercel.com/new) → depoyu içe aktarın → Next.js otomatik algılanır, ek ayara gerek yok.
3. **Environment Variables** adımında yukarıdaki tabloda listelenen değişkenleri girin (Production + Preview) — Supabase'in 3 zorunlu değişkeni dışındakiler (e-posta, Instagram) opsiyonel, o özellikleri kullanacaksanız girin.
4. Deploy'a basın. İlk build birkaç dakika sürer.
5. **Domains** sekmesinden kendi alan adınızı (ör. `kitapmeetup.com`) bağlayın; DNS kayıtlarını Vercel'in verdiği şekilde ayarlayın.
6. Alan adı yayına girince **Supabase → Authentication → URL Configuration**'daki Site URL'i bu nihai adres olacak şekilde güncelleyin (adım 1.3) ve Vercel'deki `NEXT_PUBLIC_SITE_URL` değişkenini de aynı adrese eşitleyip yeniden deploy edin.

## 4. Yayın öncesi kontrol listesi

- [ ] `supabase/migrations/0001_init.sql` çalıştırıldı, RLS politikaları aktif (migration dosyası `ENABLE ROW LEVEL SECURITY` satırlarını içeriyor — Supabase Dashboard → Authentication → Policies'ten görünür olmalı).
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` hosting'de tanımlı → "Önizleme modu" uyarısı canlıda görünmüyor.
- [ ] Supabase Site URL, gerçek alan adınızla eşleşiyor (e-posta doğrulama linkleri doğru yere gidiyor).
- [ ] `npm run typecheck` ve `npm run lint` temiz, `npm run build` başarılı (bu proje için doğrulandı).
- [ ] `https://SİTENİZ/sitemap.xml`, `/robots.txt` ve link paylaşımında görünen kart (ör. WhatsApp'a link atıp önizlemeye bakın) doğru görünüyor.
- [ ] Telefonda gerçek genişlikte (375px ve altı) yatay taşma yok, tüm menüler okunur boyutta (bu proje için ayrıca doğrulandı — bkz. `AppShell` `min-w-0` düzeltmesi).
- [ ] Kendi hesabınızda `is_admin = true` yapıldı, en az bir Akademi dersi / etkinlik / kulüp gerçek veriyle oluşturuldu.

## 5. Sonrası: bakım ve büyüme

- **Yedekleme**: Supabase ücretsiz katmanda günlük otomatik yedek yoktur — kritikleştikçe Pro plana geçmeyi (point-in-time recovery) değerlendirin.
- **Moderasyon**: v1'de temel RLS var ama admin paneli yok; kötüye kullanım raporlarını şimdilik Supabase Table Editor üzerinden elle yönetin (bkz. `docs/PRD.md` § Kapsam Dışı).
- **İzleme**: Vercel'in kendi Analytics/Speed Insights eklentisi (opsiyonel, ayrı onay gerektirir) trafik ve performansı izlemek için yeterlidir.
- **Mobil uygulama**: aynı Supabase backend'i bir Expo/React Native istemcisinin de kullanabileceği şekilde kuruldu (bkz. `docs/PRD.md` § Yol Haritası) — web sitesi canlıya alındıktan sonra sıradaki doğal adım budur. Ayrıntılar için bkz. § 6 aşağıda.

## 6. Mobil'e hazırlık — bu mimari neden "önce site, sonra app" için uygun

Kitapmeetup kasıtlı olarak **iki ayrı katman** olarak kuruldu: Supabase (veritabanı + kimlik doğrulama + dosya deposu + güvenlik kuralları) bağımsız bir backend; Next.js sadece bunun BİR istemcisi (web istemcisi). İleride bir Expo/React Native uygulaması yazdığınızda, o da `@supabase/supabase-js` ile **aynı Supabase projesine doğrudan bağlanan ikinci bir istemci** olur — ayrı bir API sunucusu yazmanıza gerek kalmaz. Ayrıntılar:

- **Okuma/yazma işlemlerinin çoğu (gönderiler, raf, kulüpler, RSVP'ler, beğeniler...) zaten doğrudan Supabase tablolarına, Row Level Security kurallarıyla korunuyor.** Bu kurallar veritabanı seviyesinde tanımlı (`supabase/migrations/*.sql`) — hangi istemci sorarsa sorsun (web ya da mobil) aynı güvenlik geçerli. Mobil uygulama bu işlemler için Next.js'e hiç uğramadan Supabase'e direkt konuşabilir.
- **Tek istisna: Server Actions** (`src/lib/actions/*.ts`) — kayıt formu, kayıt onay e-postası, Instagram paylaşımı gibi daha karmaşık işlemler bunlarla yapılıyor. Server Actions Next.js'e özel bir mekanizma; bir React Native uygulaması bunları doğrudan çağıramaz. Mobil uygulama bu işlemleri gerektirdiğinde iki seçenek var: (a) aynı mantığı Supabase istemcisiyle mobilde yeniden yazmak (çoğu action zaten birkaç satırlık `insert`/`update` — kopyalaması kolay), ya da (b) o action'ı bir **Route Handler**'a (`src/app/api/.../route.ts`) taşımak — Route Handler'lar, deploy edilince herkese açık birer HTTPS uç noktası olur, mobil uygulama sıradan bir `fetch()` ile çağırabilir (`/api/instagram/kart` ve `/api/instagram/callback` zaten bu şekilde çalışıyor).
- **Dosyalar** (avatar, gönderi fotoğrafları) Supabase Storage'ın herkese açık URL'leri — mobilde de aynı şekilde gösterilir/yüklenir.
- **Kimlik doğrulama**: Supabase Auth'un kendi SDK'sı Expo/React Native'i resmi olarak destekler (aynı e-posta/şifre hesapları, aynı kullanıcılar) — ayrı bir kullanıcı sistemi kurmaya gerek yok.

Kısacası: siteyi normal şekilde canlıya alın (yukarıdaki adımlar); mobil app'e geçtiğinizde tek yapmanız gereken Expo projesinde aynı `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` ile bir Supabase istemcisi kurmak. Bu arada, native bir uygulama yazmadan önce bile: proje zaten bir **PWA** (bkz. `src/app/manifest.ts`, ikonlar) — kullanıcılar siteyi telefonlarında "Ana Ekrana Ekle" ile bugünden bir uygulama gibi kullanabilir, native app o ihtiyaç büyüdükçe eklenecek bir sonraki adım olur.
