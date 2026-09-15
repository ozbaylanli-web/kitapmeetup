/**
 * Kitapmeetup — Instagram Graph API ile paylaşım. SUNUCU TARAFI KODU:
 * bu dosya hiçbir zaman bir "use client" bileşeninden import edilmemeli —
 * access_token'lar buradan asla tarayıcıya gitmemeli.
 *
 * Kurulum: docs/INSTAGRAM_SETUP.md
 */

const GRAPH_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export interface InstagramConnection {
  igUserId: string;
  accessToken: string;
}

type GraphResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function graphFetch<T = Record<string, unknown>>(url: string, init?: RequestInit): Promise<GraphResult<T>> {
  try {
    const res = await fetch(url, init);
    const data = await res.json();
    if (!res.ok || data.error) {
      return { ok: false, error: data.error?.message ?? `Instagram API hatası (HTTP ${res.status})` };
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** 1. adım: bir "media container" oluşturur (henüz yayınlanmadı). */
async function createMediaContainer(conn: InstagramConnection, opts: { imageUrl: string; caption: string }) {
  return graphFetch<{ id: string }>(`${GRAPH_BASE}/${conn.igUserId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: opts.imageUrl, caption: opts.caption, access_token: conn.accessToken }),
  });
}

/** 2. adım: oluşturulan container'ı gerçekten yayınlar. */
async function publishMediaContainer(conn: InstagramConnection, creationId: string) {
  return graphFetch<{ id: string }>(`${GRAPH_BASE}/${conn.igUserId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: creationId, access_token: conn.accessToken }),
  });
}

async function getMediaPermalink(conn: InstagramConnection, mediaId: string): Promise<string | null> {
  const result = await graphFetch<{ permalink?: string }>(
    `${GRAPH_BASE}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(conn.accessToken)}`
  );
  return result.ok ? result.data.permalink ?? null : null;
}

/**
 * Bir görseli + açıklamayı Instagram'da (bağlı hesapta) tek adımda yayınlar.
 * Instagram Content Publishing API'nin iki adımlı akışını (container oluştur
 * → yayınla) sarmalar. `imageUrl` Meta'nın sunucularından erişilebilir,
 * herkese açık bir HTTPS adresi olmalı (Supabase Storage public URL ya da
 * uygulamanın kendi /api/instagram/kart görsel üreticisi).
 */
export async function publishImageToInstagram(
  conn: InstagramConnection,
  opts: { imageUrl: string; caption: string }
): Promise<{ ok: true; mediaId: string; permalink: string | null } | { ok: false; error: string }> {
  const container = await createMediaContainer(conn, opts);
  if (!container.ok) return { ok: false, error: container.error };

  const published = await publishMediaContainer(conn, container.data.id);
  if (!published.ok) return { ok: false, error: published.error };

  const permalink = await getMediaPermalink(conn, published.data.id);
  return { ok: true, mediaId: published.data.id, permalink };
}
