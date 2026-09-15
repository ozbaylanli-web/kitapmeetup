/**
 * Kitapmeetup — Meta (Facebook) OAuth ile "topluluğun resmi Instagram
 * hesabını bağla" akışı. Sunucu tarafı kodu — bkz. docs/INSTAGRAM_SETUP.md.
 *
 * Standart Meta akışı: kısa ömürlü kullanıcı token → uzun ömürlü kullanıcı
 * token → bu kullanıcının yönettiği Facebook Sayfaları → o sayfalardan
 * hangisine bir Instagram İşletme Hesabı bağlıysa onu bul → o sayfanın
 * (uzun ömürlü) sayfa erişim anahtarını kaydet (Instagram Graph API
 * çağrıları için kullanılan budur).
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const OAUTH_SCOPES = ["instagram_basic", "instagram_content_publish", "pages_show_list", "pages_read_engagement"].join(",");

export function isInstagramConfigured(): boolean {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export function getInstagramOAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID ?? "",
    redirect_uri: redirectUri,
    scope: OAUTH_SCOPES,
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

interface ResolvedConnection {
  igUserId: string;
  igUsername: string | null;
  pageId: string;
  accessToken: string;
  expiresInSeconds: number | null;
}

export async function completeInstagramOAuth(code: string, redirectUri: string): Promise<{ ok: true; connection: ResolvedConnection } | { ok: false; error: string }> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return { ok: false, error: "META_APP_ID / META_APP_SECRET tanımlı değil." };

  // 1) code -> kısa ömürlü kullanıcı token'ı
  const shortLivedRes = await fetch(
    `${GRAPH_BASE}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
  );
  const shortLived = await shortLivedRes.json();
  if (!shortLivedRes.ok || !shortLived.access_token) {
    return { ok: false, error: shortLived.error?.message ?? "Kısa ömürlü token alınamadı." };
  }

  // 2) kısa ömürlü -> uzun ömürlü kullanıcı token'ı (~60 gün)
  const longLivedRes = await fetch(
    `${GRAPH_BASE}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLived.access_token}`
  );
  const longLived = await longLivedRes.json();
  if (!longLivedRes.ok || !longLived.access_token) {
    return { ok: false, error: longLived.error?.message ?? "Uzun ömürlü token alınamadı." };
  }

  // 3) Kullanıcının yönettiği Facebook Sayfaları (her biri kendi sayfa token'ıyla gelir)
  const pagesRes = await fetch(`${GRAPH_BASE}/me/accounts?access_token=${longLived.access_token}`);
  const pages = await pagesRes.json();
  if (!pagesRes.ok || !Array.isArray(pages.data)) {
    return { ok: false, error: pages.error?.message ?? "Facebook Sayfaları alınamadı." };
  }
  if (pages.data.length === 0) {
    return { ok: false, error: "Bu hesapla yönetilen bir Facebook Sayfası bulunamadı. Instagram İşletme hesabının bir Sayfaya bağlı olması gerekiyor." };
  }

  // 4) Hangi sayfanın bir Instagram İşletme Hesabı'na bağlı olduğunu bul
  for (const page of pages.data as { id: string; access_token: string; name?: string }[]) {
    const igRes = await fetch(`${GRAPH_BASE}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`);
    const igData = await igRes.json();
    const igAccountId = igData?.instagram_business_account?.id;
    if (!igAccountId) continue;

    const usernameRes = await fetch(`${GRAPH_BASE}/${igAccountId}?fields=username&access_token=${page.access_token}`);
    const usernameData = await usernameRes.json();

    return {
      ok: true,
      connection: {
        igUserId: igAccountId,
        igUsername: usernameData?.username ?? null,
        pageId: page.id,
        accessToken: page.access_token,
        expiresInSeconds: typeof longLived.expires_in === "number" ? longLived.expires_in : null,
      },
    };
  }

  return {
    ok: false,
    error:
      "Yönettiğin Facebook Sayfalarından hiçbiri bir Instagram İşletme/Yaratıcı Hesabı'na bağlı değil. Instagram hesabını önce Meta Business Suite'ten ilgili Sayfaya bağlaman gerekiyor (bkz. docs/INSTAGRAM_SETUP.md).",
  };
}
