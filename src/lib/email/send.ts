/**
 * Kitapmeetup — basit, sağlayıcıdan bağımsız transactional e-posta gönderimi.
 *
 * Hiçbir e-posta sağlayıcısı zorunlu değil: hangi ortam değişkeni
 * tanımlıysa o kullanılır, hiçbiri tanımlı değilse (yerel geliştirme,
 * önizleme modu) e-posta gönderilmez ve konsola bir uyarı yazılır — uygulama
 * asla bu yüzden çökmez.
 *
 * Desteklenen sağlayıcılar (öncelik sırasıyla denenir):
 *  1) Google Apps Script Web App (GOOGLE_APPS_SCRIPT_EMAIL_URL) — tamamen
 *     ücretsiz, Google'ın kendi altyapısı (Gmail/Workspace hesabınla
 *     MailApp.sendEmail). Kurulum: docs/EMAIL_SETUP.md.
 *  2) Resend (RESEND_API_KEY) — ücretsiz katmanı olan, kurulumu tek
 *     satırlık bir transactional e-posta API'si. Kurulum: docs/EMAIL_SETUP.md.
 */

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

interface SendEmailResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

async function sendViaGoogleAppsScript(input: SendEmailInput): Promise<SendEmailResult> {
  const url = process.env.GOOGLE_APPS_SCRIPT_EMAIL_URL;
  if (!url) return { ok: false, skipped: true };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: process.env.GOOGLE_APPS_SCRIPT_EMAIL_TOKEN ?? "",
        to: input.to,
        subject: input.subject,
        body: input.text,
      }),
    });
    if (!res.ok) return { ok: false, error: `Apps Script ${res.status}: ${await res.text().catch(() => "")}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

async function sendViaResend(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, skipped: true };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "Kitapmeetup <onboarding@resend.dev>",
        to: input.to,
        subject: input.subject,
        text: input.text,
      }),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text().catch(() => "")}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Tanımlı ilk sağlayıcıyla e-posta göndermeyi dener. Hiçbir sağlayıcı
 * kurulu değilse sessizce atlar (uygulamayı asla bozmaz) — sadece konsola
 * yazar, bu yüzden çağıran taraf sonucu "best effort" olarak ele almalı.
 */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const appsScript = await sendViaGoogleAppsScript(input);
  if (!appsScript.skipped) {
    if (!appsScript.ok) console.warn(`[email] Google Apps Script gönderimi başarısız: ${appsScript.error}`);
    return appsScript;
  }

  const resend = await sendViaResend(input);
  if (!resend.skipped) {
    if (!resend.ok) console.warn(`[email] Resend gönderimi başarısız: ${resend.error}`);
    return resend;
  }

  console.warn(
    "[email] Hiçbir e-posta sağlayıcısı yapılandırılmamış (GOOGLE_APPS_SCRIPT_EMAIL_URL ya da RESEND_API_KEY) — e-posta gönderilmedi. Bkz. docs/EMAIL_SETUP.md."
  );
  return { ok: false, skipped: true };
}

export async function sendEventRegistrationConfirmationEmail(opts: {
  to: string;
  name: string;
  eventTitle: string;
  eventDateLabel: string;
  eventUrl: string;
}): Promise<SendEmailResult> {
  const text = `Merhaba ${opts.name},

"${opts.eventTitle}" etkinliğine kaydın alındı! 🎉

Tarih: ${opts.eventDateLabel}
Etkinlik detayı: ${opts.eventUrl}

Görüşmek üzere,
Kitapmeetup`;

  return sendTransactionalEmail({
    to: opts.to,
    subject: `Kaydın alındı: ${opts.eventTitle}`,
    text,
  });
}
