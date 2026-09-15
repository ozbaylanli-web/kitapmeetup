# E-posta kurulumu — etkinlik kayıt onayı

Bir kullanıcı bir etkinliğe **"Gidiyorum"** dediğinde (ve varsa kayıt formunu doldurduğunda), Kitapmeetup ona otomatik bir "kaydın alındı" e-postası göndermeye çalışır (`src/lib/email/send.ts`).

**Hiçbir sağlayıcı kurulu değilse uygulama bozulmaz** — e-posta gönderilmez, sunucu konsoluna bir uyarı yazılır, kayıt işleminin kendisi (RSVP + kayıt formu yanıtları) yine de başarıyla tamamlanır. Yani bu kurulumu istediğiniz zaman, hatta hiç yapmadan da uygulamayı kullanabilirsiniz.

İki seçenek var — **birini** seçmeniz yeterli (ikisi de tanımlıysa Google Apps Script önceliklidir):

## Seçenek 1 — Google Apps Script (önerilen: ücretsiz, Google'ın kendi altyapısı)

Sizin sorduğunuz "ücretsiz, tercihen Google'a ait bir altyapı" tam olarak bu — üçüncü parti bir hesaba ihtiyaç yok, sadece kendi Gmail/Workspace hesabınız.

1. [script.google.com](https://script.google.com) → **Yeni proje**.
2. [`scripts/google-apps-script-email.gs`](../scripts/google-apps-script-email.gs) dosyasının tüm içeriğini kopyalayıp projenize yapıştırın (dosyanın en üstünde ayrıntılı adımlar da var).
3. Sol menüden **Project Settings** → **Script Properties** → **Add script property**: adı `EMAIL_TOKEN`, değeri kendi seçtiğiniz uzun/rastgele bir gizli anahtar (ör. `openssl rand -hex 24` ile üretebilirsiniz, ya da herhangi bir UUID). Bu, Web App linkini ele geçiren birinin sizin adınıza e-posta göndermesini engeller.
4. Sağ üstten **Deploy** → **New deployment** → tür: **Web app**.
   - **Execute as**: Me
   - **Who has access**: Anyone
   - Deploy'a basın, Google kendi hesabınızla izin ister — onaylayın.
5. Size verilen **Web App URL**'ini kopyalayın.
6. `.env.local` dosyanıza (ya da hosting sağlayıcınızın ortam değişkenleri panosuna) ekleyin:
   ```bash
   GOOGLE_APPS_SCRIPT_EMAIL_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   GOOGLE_APPS_SCRIPT_EMAIL_TOKEN=3. adımda belirlediğiniz gizli anahtar
   ```
7. Sunucuyu yeniden başlatın — artık kayıt onay e-postaları gerçekten gidiyor.

**Sınırlar:** ücretsiz kişisel Gmail hesabında günde ~100 e-posta; bir Google Workspace hesabında ~1500/gün. Küçük/orta ölçekli bir topluluk için fazlasıyla yeterli; büyürseniz Seçenek 2'ye geçebilirsiniz.

## Seçenek 2 — Resend (basit, üretime daha uygun)

[Resend](https://resend.com) Next.js ekosisteminde yaygın kullanılan, ücretsiz katmanı olan (ayda 3.000 e-postaya kadar) bir transactional e-posta API'si. Google Apps Script'in günlük kotasını aşan topluluklar için daha sağlam bir seçenek.

1. [resend.com](https://resend.com) üzerinden ücretsiz bir hesap açın, bir API anahtarı oluşturun.
2. `.env.local` dosyanıza ekleyin:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxx
   RESEND_FROM_EMAIL=Kitapmeetup <bildirim@sizin-domaininiz.com>   # opsiyonel; boş bırakılırsa Resend'in test adresi kullanılır
   ```
   Kendi domaininizden göndermek isterseniz Resend panelinden domain doğrulaması yapmanız gerekir (opsiyonel — doğrulanmamış domainle de test e-postaları gider).
3. Sunucuyu yeniden başlatın.

## Neden Mailchimp değil?

Mailchimp esasen bir **bülten/pazarlama** aracı — abone listeleri, kampanyalar. "Birisi kayıt oldu, ona anında tek bir onay e-postası gönder" gibi **transactional** (olay bazlı, anlık) e-postalar için Mailchimp'in kendisi uygun değil; bunun için ayrı, ücretli bir ürünleri var (Mailchimp Transactional / eski adıyla Mandrill) ve ücretsiz katmanı yok. Bu yüzden burada Mailchimp yerine, aynı ihtiyacı ücretsiz karşılayan Google Apps Script'i (istediğiniz gibi) ya da Resend'i öneriyoruz. İleride topluluğa haftalık/aylık bir bülten göndermek isterseniz (bu, farklı bir özellik) Mailchimp o iş için hâlâ iyi bir seçim olur.
