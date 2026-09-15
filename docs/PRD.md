# Kitapmeetup — Ürün Planı (PRD)

> "Kitap sohbetlerini yeniden buluşturuyoruz." — eski kitapmeetup.com topluluğunun ruhunu fiziksel buluşmalar + basit, davetkâr bir sosyal akışla yeniden ayağa kaldıran uygulama.

## 1. Vizyon

Kitapmeetup, bir zamanlar fiziksel kitap sohbetleri düzenleyen bir topluluğun mirasını devralan; insanları hem **gerçek hayatta buluşturan** (etkinlikler), hem de aralarda **hafif, keyifli bir sosyal akışta** (alıntılar, "ne okuyorum", mini sorular) bir arada tutan bir topluluk uygulamasıdır. Instagram hesabındaki (@kitapmeetup) sıcak gün-batımı turuncusu ve samimi/davetkâr ton, tüm ürünün görsel ve duygusal kimliğinin temelini oluşturur.

Kitapmeetup bir "kitap satış" ya da "kitap kataloğu" uygulaması değildir — o işi zaten Goodreads gibi devler yapıyor. Kitapmeetup'ın farkı: **küçük, sıcak, yerel/yakın topluluk hissi** + **alt kulüpler etrafında derinleşen sohbet** + **fiziksel buluşmayı kolaylaştırma**.

## 2. Marka ve Görsel Kimlik

- **Ana renk – Turuncu (gün batımı tonu):** logo ilhamlı, sıcak turuncudan kiremit kırmızısına geçen bir gradyan. Birincil aksiyon rengi.
- **İkincil – Mürekkep siyahı / sıcak antrasit:** logo alt yarımdaki siyahtan ilhamla, "kitap sayfası" hissi veren krem/kağıt fonla birlikte kullanılır (saf siyah değil, sıcak bir ton).
- **Fon – Kağıt kremi:** eski kitap sayfası hissi veren krem/bej ton, kartlar beyaza yakın "kağıt" yüzeyinde durur.
- **Kulüp renkleri:** her alt kulüp kendi vurgu rengini taşır (Felsefe = çamurlu mor, Bilimkurgu = derin teal, Şiir = pudra pembe, Distopya = petrol yeşili gibi) — turuncu marka rengiyle çatışmadan, kartlarda/etiketlerde ayırt edicilik sağlar.
- **Tipografi:** başlıklarda karakterli bir serif (kitap/edebiyat hissi), gövde metninde okunaklı bir sans-serif.
- **Ton:** davetkâr, sıcak, hafif muzip — bir kütüphane değil, "kitap dostlarının buluştuğu masa" hissi.

## 3. Hedef Kullanıcı

- Eski Kitapmeetup topluluğunun üyeleri (yeniden bir araya gelmek isteyenler).
- Şehrindeki/çevrimiçi kitap sohbetlerine katılmak isteyen okurlar.
- Belirli bir temaya (felsefe, bilimkurgu, şiir, distopya…) derinlemesine ilgi duyan okur grupları.
- "Ne okuyorum" paylaşmayı, alıntı biriktirmeyi seven, ama Goodreads'in soğukluğunu değil sıcak bir topluluk isteyen kullanıcılar.

## 4. Bilgi Mimarisi / Ana Modüller

1. **Ana Akış** — kısa gönderiler (metin, alıntı, kitap fotoğrafı, soru, **kitap takası ilanı**), kulüp gönderileri, etkinlik duyuruları tek akışta; paylaşım türüne göre filtrelenebilir (ör. sadece takas ilanlarını göster). Yeni bir kulüp kurulduğunda ya da yeni bir etkinlik oluşturulduğunda, bunu duyuran bir **sistem gönderisi** otomatik olarak akışa düşer (`type: "kulup"` / `"etkinlik"`). "Günün Sorusu" kartına tıklayınca kendi sayfasına gidilir (`/gunun-sorusu`): diğer üyelerin cevapları görünür, kullanıcı kendi cevabını (isteğe bağlı bir fotoğrafla) bırakabilir. Kitap takası iki yönlü: **"elimde var"** ilanına isteyen kendi kitabıyla teklif yapar; **"arıyorum"** ilanında ise aranan kitap (ve isteğe bağlı olarak karşılığında verilebilecek kitap) baştan belli olur, yanıtlayan sadece "bende var" der. İlan sahibi bir teklifi kabul/reddedebilir (küçük butonlarla) ya da teklif sahibiyle doğrudan mesajlaşıp pazarlık edebilir; kabul edilince diğer bekleyenler otomatik kapanır (`/takas/[postId]`).
2. **Kulüpler** — alt topluluklar (Felsefe, Bilimkurgu, Şiir, Distopya + kullanıcı üretimi yeni kulüpler). Her kulübün kendi mini-akışı, üye listesi, güncel okuma listesi ve etkinlikleri var. **Kitap Ruleti** ile kulüp bir sonraki kitabı eğlenceli şekilde seçebilir.
3. **Etkinlikler & Akademi** — tek sayfada birleşik: Meetup benzeri fiziksel/online etkinlik oluşturma, tarih/yer, katılım durumu (gidiyorum/ilgileniyorum), kulübe bağlanabilir, geçmiş etkinlik arşivi; içinde bulunulan an gerçekleşmekte olan bir etkinlik varsa listenin en tepesinde **"🔴 Şu an gerçekleşiyor"** olarak öne çıkar; hemen üstünde de haftalık/aylık yayınlanan Akademi dersleri ("Evrim 101" gibi) **"🎓 Eğitim" etiketiyle özel bir etkinlik türü olarak** listelenir. Akademi'deki her ders artık kendi başına gerçek bir buluşma olabilir — tarihi, fiziksel ya da online yeri, kontenjanı ve "gidiyorum/ilgileniyorum" RSVP'si vardır; sadece "kendi hızında" kurslarda ders eskisi gibi self-paced okunur (kayıt olma, ders içeriği, ilerleme takibi `/akademi` altında ayrıntılı kalır). Bir etkinliği oluşturan kişi ya da bağlı olduğu kulübün sahibi/moderatörü, **özel bir kayıt formu** tanımlayabilir (serbest sorular: kısa metin, uzun metin, seçenekli, onay kutusu) — "Gidiyorum" diyen katılımcı önce bu soruları yanıtlar. Aynı yönetici, o etkinliğe kimlerin kayıt olduğunu ve verdikleri yanıtları gösteren bir **kayıt panelinden** (`RegistrantsDashboard`) takip eder; kayıt tamamlanınca katılımcıya otomatik bir "kaydın alındı" e-postası gider (sağlayıcıdan bağımsız — Google Apps Script ya da Resend, bkz. `docs/EMAIL_SETUP.md`; hiçbiri kurulu değilse uygulama yine çalışır, sadece e-posta gitmez). Bu, önceden Google Form'la manuel yürütülen eğitim/etkinlik kayıtlarının yerini alır. Yöneticiler ayrıca oluşturulan bir etkinliği (ya da Ana Akış'taki bir gönderiyi) tek tıkla topluluğun **ortak, resmi Instagram hesabında** paylaşabilir — Instagram Graph API üzerinden, tek bir paylaşılan hesaba (her kulüp kendi hesabını bağlamaz); görseli olmayan içerikler için marka kimliğine uygun bir kart görseli otomatik üretilir. Kurulum: `docs/INSTAGRAM_SETUP.md`.
4. **Blog** — kullanıcıların uzun form yazılar (deneme, inceleme, kitap üzerine düşünceler) yazabildiği, markdown destekli bir alan; Ana Akış'a gömülüdür (kısa paylaşımlarla aynı kronolojik akışta görünür), `/blog` tam arşividir.
5. **Profil / Ne Okuyorum** — okunan/okunmakta olan/okunacak kitap rafı, alıntılar, kitap fotoğrafları, katılınan kulüpler ve etkinlikler, rozetler, yazılan bloglar, opsiyonel doğum tarihi/cinsiyet tek profilde. Başka birinin profilinde **Takip Et** butonu var (takipçi/takip sayıları buna göre güncellenir). Rozetler bölümü hem kazanılanları hem de henüz kazanılmayanları (soluk, kilit ikonlu) gösterir — kilitli bir rozete tıklayınca nasıl kazanılacağı açılır.
6. **Kitap Kataloğu** (`/kitaplar`) — 700'ü aşkın kitaptan oluşan aranabilir bir kütüphane; "okudum / okuyorum / okumak istiyorum" sekmeleri arasında geçip tek dokunuşla rafına ekleyebilirsin. Her kitabın kendi sayfası vardır (`/kitaplar/[id]`) — o kitapla ilgili paylaşımlar/takaslar, "kim okuyor/okumuş" listesi ve (kulübün güncel kitabıysa) ilgili etkinlikler orada listelenir. Yazar adına tıklayınca ayrı bir **yazar sayfasına** gidilir (`/yazarlar/[slug]`) — o yazarın tüm kitapları, ilgili paylaşımlar ve etkinlikler tek yerde; ayrı bir "yazar" tablosu yok, kimlik `books.author` metninden türetilir.
7. **Eşleşmeler** (`/eslesmeler`) — dört bağımsız sinyalden herhangi biriyle eşleşme kurar: aynı kitabı okumak/okumuş olmak, aynı TÜRDEN kitaplar okumak (kitap kataloğundaki 13 tür etiketine göre), aynı kulübe kayıtlı olmak, ya da aynı etkinliğe katılmak. Profillerine bakmaya ve **doğrudan mesajla** sohbet başlatmaya teşvik eder; en güçlü sinyale sahip eşleşmeler (aynı kitap > aynı etkinlik > aynı kulüp > aynı tür) üstte listelenir.
8. **Mesajlar** (`/mesajlar`) — kitap eşleşmelerinle başlayan, basit (gerçek zamanlı olmayan) birebir sohbetler.
9. **Keşfet & Arama** — kullanıcı, kulüp, kitap, etkinlik arama.
10. **Yayınevi Hesapları** — bir yayınevini temsil eden kullanıcılar, kayıt sırasında "Yayınevi olarak katıl"ı seçebilir ya da normal kayıt olup sonradan Ayarlar'dan "Yayınevi hesabına geç" diyebilir. Ayrı bir izin sistemi yok: yayınevi hesabı da normal bir kullanıcı gibi paylaşım yapar, kulüp kurar, okuyucularla mesajlaşır — yalnızca kimliği (profil, gönderiler, kurduğu kulüpler) her yerde **"🏢 Yayınevi"** rozetiyle ve isterse bir web sitesi linkiyle işaretlenir.
11. **Mekanlar** (`/mekanlar`) — İstanbul'daki kitapçı, kitap kafe ve okumaya uygun kafelerden oluşan, **topluluğun beraber büyüttüğü** bir rehber (herkes yeni mekan ekleyebilir). Başlangıçta 3-5 güvenilir gerçek mekanla açılır ki boş olmasın. Üyeler bir mekana not + yıldız puanı bırakabilir, "Şu an buradayım" diyerek check-in yapabilir. Kulüpler kendine sabit bir buluşma mekanı seçebilir (`ClubVenueSection`); etkinlik oluştururken rehberden bir mekan seçilebilirse konum otomatik doldurulur. Harita gömme yok — sadece dış Google Maps arama linki. Ana sayfada **"🔥 Haftanın Mekanı"** öne çıkar: editöryel bir seçim değil, o hafta gerçekten etkinlik düzenlenen ya da "buradayım" denen en hareketli mekan dinamik olarak hesaplanır (`getVenueOfTheWeek`); hiç hareket yoksa hiçbir şey gösterilmez.

Ana navigasyon beş sekmeyle sınırlı tutuluyor: **Ana Akış, Kitap Eşleşmeleri, Mesajlar, Kulüpler, Etkinlikler (+Akademi)**. Mesajlar bilinçli olarak tam ortaya eklendi — eşleşmeler, kitap takası pazarlığı ve etkinlik soruları doğrudan mesajlaşmayı gerektirdiği için (`/mesajlar`). Blog, Akademi, Mekanlar, Kitap/Yazar sayfaları ve Günün Sorusu'nun kendi sayfaları var ama ayrı bir sekmeyi hak edecek kadar büyük, bağımsız bir kitleleri olmadığı için ana menüde değiller — bunlara bağlamsal giriş noktalarından ulaşılır (ör. Etkinlikler başlığındaki "Mekanlar" linki, Ana Akış'taki "Günün Sorusu" kartı, kitap/yazar isimlerine tıklama).

## 5. "Çılgın" / Ayırt Edici Özellikler

- **Kitap Ruleti** — bir kulübün okuma listesinden rastgele/döner animasyonlu bir sonraki kitabı seçen eğlenceli widget.
- **Günün Sorusu** — her gün otomatik değişen, herkesin aynı anda gördüğü bir sohbet başlatıcı soru (ör. "Bitirmeden bırakamadığın son kitap hangisiydi?").
- **Okuma Rozetleri** — aktiviteye dayalı otomatik rozetler (İlk Kitabın, Kulüp Kurdu, Sohbet Başlatıcı, Ayın Kaşifi…).
- **Görsel Raf** — profildeki "ne okuyorum" alanı, kitap sırtlarından oluşan renkli bir raf gibi görselleştirilir (gerçek kapak görseli olmadan da şık durur).
- **Eşleşmeler** — "aynı kitap, aynı tür, aynı kulüp ya da aynı etkinlik" mantığı; tek bir ortak nokta bile eşleşme için yeterli. Eşleştiğin kişi bir etkinliğe "gidiyorum" dediğinde, sen henüz demediysen ürün sana da o etkinliği nazikçe önerir ("O da gidiyor, sen de gelsene?").
- **Haftanın Mekanı** — ana sayfada öne çıkan mekan, elle seçilmiş bir "editör önerisi" değil: o hafta gerçekleşen etkinliklerden ve "Şu an buradayım" check-in'lerinden hesaplanan, topluluğun kendi davranışını yansıtan dinamik bir sonuç.
- **Etkileşim sesleri** — Web Audio API ile anlık üretilen (hiçbir dosya indirilmeyen) kısa geri bildirim sesleri: beğenme, RSVP, kulübe katılma gibi olumlu anlarda küçük bir "pop", Kitap Ruleti karar kıldığında pentatonik bir "kıvılcım" çanı. Sürekli çalan bir arka plan ambiyansı yok — yalnızca anlık, göze/kulağa batmayan geri bildirimler.

## 6. Teknik Mimari

- **Web (bu faz):** Next.js 16 (App Router, TypeScript, Tailwind CSS v4), React 19. PWA'ya uygun, mobil tarayıcıda native app hissi.
- **Backend:** Supabase (Postgres + Auth + Storage + Row Level Security). Aynı Supabase projesi ileride bir Expo/React Native mobil istemci tarafından da kullanılabilir — mobil faz için backend'i sıfırdan kurmaya gerek kalmaz.
- **Veri erişimi:** `src/lib/data/*` içinde repository fonksiyonları; Supabase ortam değişkenleri tanımlı değilse (yerel geliştirme / ilk önizleme) otomatik olarak `src/lib/fixtures` içindeki örnek verilere düşer — böylece proje Supabase kurulmadan da `npm run dev` ile anında görülebilir, kurulduğunda aynı kod gerçek veriyle çalışır.
- **Kimlik doğrulama:** Supabase Auth (e-posta/şifre), oturum senkronizasyonu `proxy.ts` (Next.js 16'da `middleware`'in yeni adı) üzerinden yapılır.
- **Web sitesi ↔ app senkronu:** ayrı bir "pazarlama sitesi" yok — tek Next.js kod tabanı hem uygulama hem de herkese açık web sitesi olarak yayınlanır; içerik ve tasarım tanım gereği her zaman birebir aynıdır. SEO/paylaşım tarafı `manifest.ts`, `robots.ts`, `sitemap.ts` ve anlık üretilen `opengraph-image.tsx`/`icon.tsx` dosya kurallarıyla otomatik yönetilir (bkz. `docs/DEPLOY.md`).

## 7. Yol Haritası

- **Faz 0 (bu teslim):** Ürün planı, tasarım sistemi, veritabanı şeması, tüm modüllerin uçtan uca çalışan arayüzü (Supabase bağlanınca gerçek veriyle çalışır durumda).
- **Faz 1:** Kullanıcının kendi Supabase projesini bağlaması, gerçek kullanıcılarla test, bildirimler, gelişmiş arama.
- **Faz 2:** Expo ile mobil uygulama (aynı Supabase backend), push bildirimleri, offline destek.
- **Faz 3:** Moderasyon araçları, kulüp yöneticisi paneli, Akademi için video/ses desteği.

## 8. Kapsam Dışı (v1)

- Ödeme/bilet satışı (etkinlikler şimdilik ücretsiz/RSVP bazlı).
- Gerçek zamanlı sohbet/DM (v1'de yok, yorumlar üzerinden asenkron sohbet var).
- Gelişmiş moderasyon paneli (temel RLS ile kötüye kullanım engellenir, tam admin paneli sonraki faz).
