# Instagram kurulumu — "Instagram'da paylaş" butonu

Yöneticiler, oluşturulan bir etkinliği (etkinlik sayfasında) ya da bir Ana Akış gönderisini (gönderinin altındaki "Instagram" ikonuyla) tek tıkla topluluğun **ortak, resmi Instagram hesabında** paylaşabilir.

**Önemli tasarım kararı — tek, paylaşılan hesap:** Her kulüp yöneticisi kendi Instagram'ını ayrı ayrı bağlamıyor. Hesap **bir kere**, bir site yöneticisi tarafından bağlanıyor (aşağıda); ondan sonra hangi yönetici "Instagram'da paylaş" derse desin, içerik hep bu tek hesaba gidiyor — tıpkı eski @kitapmeetup hesabının topluluk adına paylaşım yapması gibi.

Bu, önceden var olan bir sosyal medya aracının (Buffer, Later, Meta Business Suite'in kendi zamanlama aracı vb.) kullandığıyla **aynı resmi API** (Instagram Graph API / Content Publishing API) üzerinden çalışır — tarayıcı otomasyonu ya da "botlama" değildir, Instagram'ın kurallarına uygundur.

**Hiçbir şey kurmazsanız uygulama yine çalışır** — "Instagram'da paylaş" butonları yöneticilere görünür ama tıklanınca "henüz kurulmadı" der; herkes diğer özellikleri sorunsuz kullanır.

## Gereksinimler (önce bunlar olmalı)

1. Topluluğun bir **Instagram İşletme (Business) ya da Yaratıcı (Creator) hesabı** olmalı — kişisel hesap OLMAZ. Instagram uygulamasında Ayarlar → Hesap türü ve araçlar'dan ücretsiz çevirebilirsiniz.
2. Bu Instagram hesabı bir **Facebook Sayfası**'na bağlı olmalı (Meta Business Suite → Ayarlar → Bağlı hesaplar). Sayfanız yoksa ücretsiz oluşturabilirsiniz.
3. Sitenizin **canlı, sabit bir alan adı** olmalı (`docs/DEPLOY.md`). Meta, OAuth için tam eşleşen bir "redirect URI" ister — geçici bir Cloudflare tünel linki her seferinde değiştiği için bu adımı **canlıya aldıktan sonra** yapmanız gerekir.

## Kurulum

1. [developers.facebook.com](https://developers.facebook.com) → **My Apps** → **Create App** → tür olarak "Business" seçin.
2. Uygulamanıza bir ürün olarak **Instagram Graph API**'yi ekleyin (App Dashboard → Add Product).
3. **App Settings → Basic**'ten **App ID** ve **App Secret**'ı kopyalayın.
4. **App Settings → Basic → App Domains**'e sitenizin alan adını ekleyin; **Instagram Graph API → Settings**'ten (ya da Facebook Login ürünü varsa oradan) **Valid OAuth Redirect URIs**'a şunu ekleyin:
   ```
   https://SIZIN-ALAN-ADINIZ.com/api/instagram/callback
   ```
5. Kitapmeetup'ın ortam değişkenlerine ekleyin (hosting panelinizde ya da `.env.local`):
   ```bash
   META_APP_ID=uygulama-id'niz
   META_APP_SECRET=uygulama-secret'iniz
   ```
6. Sunucuyu yeniden başlatın/yeniden deploy edin.
7. **Kendi hesabınızda `is_admin = true` olduğundan emin olun** (Supabase Dashboard → Table Editor → profiles), sonra **Ayarlar** sayfanıza gidip **"Instagram'a bağlan"**a basın. Meta'nın kendi ekranında giriş yapıp izin verin — hangi Facebook Sayfası'nı kullanacağınızı seçmeniz istenebilir.
8. Bağlantı başarılı olursa Ayarlar'da bağlı kullanıcı adınızı (`@...`) görürsünüz. Artık herhangi bir yönetici, bir etkinlik ya da gönderi sayfasındaki "Instagram'da paylaş" butonunu kullanabilir.

### App Review gerekiyor mu?

Muhtemelen **hayır** — en azından başlangıç için. `instagram_content_publish` izni, bu izni kullanan kişi (siz) zaten uygulamanın **yöneticisi/geliştiricisi/test kullanıcısı** rolündeyse "Development" modunda çalışır; App Review'a yalnızca uygulamanızı SİZİN dışınızdaki üçüncü kişilerin de kendi hesaplarını bağlayabilmesi için "Live" moda almanız gerektiğinde ihtiyaç duyulur. Bu kurulumda tek bir (sizin) hesap bağlandığı için bu adımı atlayabilirsiniz. İleride ihtiyaç olursa Meta'nın App Review süreci genelde birkaç gün sürer ve bir gizlilik politikası linkiister.

## Sınırlar

- Instagram, bir hesap için **24 saatte en fazla 25 paylaşım** yayınlamaya izin verir (Kitapmeetup'ın değil, Instagram'ın kendi kısıtı).
- Görsel/başlık için `image_url` herkese açık bir HTTPS adresi olmalı — bir gönderinin kendi fotoğrafı varsa o kullanılır, yoksa uygulama otomatik olarak markaya uygun bir kart görseli üretir (`/api/instagram/kart`).
- Uzun ömürlü sayfa erişim anahtarları genelde süresiz sayılır ama Meta bazı durumlarda (şifre değişikliği, uzun süre kullanılmama) geçersiz kılabilir — böyle bir durumda Ayarlar'daki "Farklı bir hesapla yeniden bağlan" ile tekrar bağlayabilirsiniz.
