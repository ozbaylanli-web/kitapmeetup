"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import { publishImageToInstagram } from "@/lib/instagram/graph";
import { getSiteUrl } from "@/lib/env";
import { formatEventDate } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

function cardImageUrl(opts: { eyebrow: string; title: string; subtitle?: string }): string {
  const params = new URLSearchParams({ eyebrow: opts.eyebrow, title: opts.title });
  if (opts.subtitle) params.set("subtitle", opts.subtitle);
  return `${getSiteUrl()}/api/instagram/kart?${params.toString()}`;
}

/**
 * "Instagram'da paylaş" — topluluğun ortak Instagram hesabına gönderir.
 * Kasıtlı olarak yönetici-only: paylaşılan hesap tüm topluluğa ait tek bir
 * hesap olduğu için (her kulüp yöneticisi kendi hesabını bağlamıyor),
 * kimin ne zaman paylaştığını kontrol altında tutmak için sadece
 * `is_admin` olan kullanıcılar tetikleyebilir.
 */
export async function publishEventToInstagramAction(_prev: ActionResult, eventId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (!profile?.is_admin) return { ok: false, error: "Bu işlem için yönetici olman gerekiyor." };

  const { data: conn } = await supabase.from("instagram_connections").select("*").limit(1).maybeSingle();
  if (!conn) return { ok: false, error: "Instagram hesabı henüz bağlı değil — Ayarlar'dan bağla." };

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).maybeSingle();
  if (!event) return { ok: false, error: "Etkinlik bulunamadı." };

  const siteUrl = getSiteUrl();
  const imageUrl = cardImageUrl({
    eyebrow: "🗓️ Yeni Etkinlik",
    title: event.title,
    subtitle: formatEventDate(event.starts_at),
  });
  const location = event.is_online ? "Online" : event.location_name ?? "";
  const caption = [
    `🗓️ ${event.title}`,
    "",
    formatEventDate(event.starts_at),
    location,
    "",
    event.description || "",
    "",
    `Katılmak için: ${siteUrl}/etkinlikler/${event.slug}`,
    "",
    "#kitapmeetup #kitapkulübü #istanbul",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await publishImageToInstagram({ igUserId: conn.ig_user_id, accessToken: conn.access_token }, { imageUrl, caption });

  await supabase.from("instagram_posts").insert({
    source_type: "event",
    source_id: eventId,
    ig_media_id: result.ok ? result.mediaId : null,
    ig_permalink: result.ok ? result.permalink : null,
    status: result.ok ? "published" : "failed",
    error: result.ok ? null : result.error,
    posted_by: userId,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/etkinlikler/[slug]", "page");
  return { ok: true };
}

export async function publishPostToInstagramAction(_prev: ActionResult, postId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (!profile?.is_admin) return { ok: false, error: "Bu işlem için yönetici olman gerekiyor." };

  const { data: conn } = await supabase.from("instagram_connections").select("*").limit(1).maybeSingle();
  if (!conn) return { ok: false, error: "Instagram hesabı henüz bağlı değil — Ayarlar'dan bağla." };

  const { data: post } = await supabase.from("posts").select("*").eq("id", postId).maybeSingle();
  if (!post) return { ok: false, error: "Gönderi bulunamadı." };

  const siteUrl = getSiteUrl();
  const bodyText = post.body?.trim() || "Kitapmeetup topluluğundan bir paylaşım";
  const imageUrl =
    post.image_url ??
    cardImageUrl({
      eyebrow: post.type === "quote" ? "✒️ Alıntı" : "💬 Kitapmeetup",
      title: bodyText,
    });
  const caption = [bodyText, "", `Kitapmeetup'ta gör: ${siteUrl}`, "", "#kitapmeetup #kitapkulübü"].join("\n");

  const result = await publishImageToInstagram({ igUserId: conn.ig_user_id, accessToken: conn.access_token }, { imageUrl, caption });

  await supabase.from("instagram_posts").insert({
    source_type: "post",
    source_id: postId,
    ig_media_id: result.ok ? result.mediaId : null,
    ig_permalink: result.ok ? result.permalink : null,
    status: result.ok ? "published" : "failed",
    error: result.ok ? null : result.error,
    posted_by: userId,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/");
  return { ok: true };
}
