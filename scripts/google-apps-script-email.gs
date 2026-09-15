/**
 * Kitapmeetup — Google Apps Script e-posta gönderme köprüsü.
 *
 * Bu dosya Node/Next.js projesinin bir parçası DEĞİL — google.script.google.com
 * üzerinde ayrı bir Apps Script projesine yapıştırılıp "Web App" olarak
 * deploy edilir. Kitapmeetup, bir kullanıcı bir etkinliğe kayıt olduğunda bu
 * Web App'e bir POST isteği atar; bu script de Gmail/Workspace hesabınla
 * MailApp.sendEmail() ile gerçek bir e-posta gönderir. Tamamen ücretsiz,
 * üçüncü parti bir hesaba ihtiyaç yok — sadece senin Google hesabın.
 *
 * KURULUM (bkz. docs/EMAIL_SETUP.md için ekran görüntülü anlatım):
 *  1. script.google.com → "Yeni proje" → bu dosyanın tüm içeriğini yapıştır.
 *  2. Sol menüden "Project Settings" → "Script Properties" → "Add script
 *     property" → adı EMAIL_TOKEN, değeri kendi belirlediğin uzun/rastgele
 *     bir gizli anahtar (ör. bir UUID). Bu, Web App URL'ini bilen herkesin
 *     senin adına e-posta göndermesini engeller.
 *  3. Sağ üstten "Deploy" → "New deployment" → tür: "Web app".
 *     - Execute as: Me (kendi hesabın)
 *     - Who has access: Anyone
 *     Deploy'a bas, Google izin ister — kendi hesabınla onayla.
 *  4. Verilen Web App URL'ini kopyala.
 *  5. Kitapmeetup'ın .env.local (ya da hosting'inin ortam değişkenleri)
 *     dosyasına ekle:
 *       GOOGLE_APPS_SCRIPT_EMAIL_URL=<3. adımdaki URL>
 *       GOOGLE_APPS_SCRIPT_EMAIL_TOKEN=<2. adımda belirlediğin gizli anahtar>
 *
 * Not: Ücretsiz kişisel Gmail hesapları günde ~100 e-posta ile sınırlıdır;
 * bir Google Workspace hesabıyla bu sınır ~1500/gün'e çıkar. Küçük/orta
 * ölçekli bir topluluk için fazlasıyla yeterli.
 */

function doPost(e) {
  var result = { ok: false };
  try {
    var payload = JSON.parse(e.postData.contents);
    var expectedToken = PropertiesService.getScriptProperties().getProperty("EMAIL_TOKEN");

    if (!expectedToken || payload.token !== expectedToken) {
      result.error = "Geçersiz token.";
    } else if (!payload.to || !payload.subject || !payload.body) {
      result.error = "to/subject/body alanları gerekli.";
    } else {
      MailApp.sendEmail({
        to: payload.to,
        subject: payload.subject,
        body: payload.body,
      });
      result.ok = true;
    }
  } catch (err) {
    result.error = String(err);
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
