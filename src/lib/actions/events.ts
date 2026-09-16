"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import { checkUploadSize } from "@/lib/uploads";
import { getMyClubRole } from "@/lib/data/clubs";
import type { ActionResult, RsvpStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function rsvpAction(
  _prev: ActionResult,
  payload: { eventId: string; status: RsvpStatus }
): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const { error } = await ctx.supabase
    .from("event_rsvps")
    .upsert(
      { event_id: payload.eventId, user_id: ctx.userId, status: payload.status },
      { onConflict: "event_id,user_id" }
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/etkinlikler");
  return { ok: true };
}

export async function createEventAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const clubId = String(formData.get("clubId") ?? "") || null;
  const venueId = String(formData.get("venueId") ?? "").trim() || null;
  let isOnline = formData.get("isOnline") === "on";
  let locationName = String(formData.get("locationName") ?? "").trim() || null;
  const locationUrl = String(formData.get("locationUrl") ?? "").trim() || null;
  const startsAtRaw = String(formData.get("startsAt") ?? "");
  const capacityRaw = String(formData.get("capacity") ?? "").trim();

  if (!title) return { ok: false, error: "Etkinlik başlığı gerekli." };
  if (!startsAtRaw) return { ok: false, error: "Tarih ve saat gerekli." };

  const startsAt = new Date(startsAtRaw);
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: "Geçersiz tarih." };

  // Rehberden bir mekan seçildiyse konum ondan gelir — mekan zaten fiziksel bir yer.
  if (venueId) {
    const { data: venue } = await supabase.from("venues").select("name, district").eq("id", venueId).maybeSingle();
    if (venue) {
      locationName = `${venue.name}, ${venue.district}`;
      isOnline = false;
    }
  }

  const slug = `${slugify(title)}-${Date.now().toString(36).slice(-4)}`;

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      title,
      slug,
      description,
      club_id: clubId,
      venue_id: venueId,
      is_online: isOnline,
      location_name: locationName,
      location_url: locationUrl,
      starts_at: startsAt.toISOString(),
      capacity: capacityRaw ? Number(capacityRaw) : null,
      created_by: userId,
    })
    .select("id")
    .single();
  if (error || !event) return { ok: false, error: error?.message ?? "Etkinlik oluşturulamadı." };

  // Ana akışa düşecek duyuru gönderisi — best-effort, başarısız olsa da etkinlik oluşturma başarılı sayılır.
  await supabase.from("posts").insert({
    author_id: userId,
    type: "etkinlik",
    body: `🗓️ Yeni bir etkinlik oluşturuldu: ${title}`,
    club_id: clubId,
    event_id: event.id,
  });

  revalidatePath("/etkinlikler");
  revalidatePath("/");
  return { ok: true };
}

/** Etkinliğin kapak fotoğrafını ayarlar/değiştirir — sadece oluşturan kişi ya da bağlı kulübün yöneticisi/moderatörü. */
export async function setEventCoverAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const eventId = String(formData.get("eventId") ?? "");
  const cover = formData.get("cover");
  if (!eventId) return { ok: false, error: "Geçersiz etkinlik." };
  if (!(cover instanceof File) || cover.size === 0) return { ok: false, error: "Bir fotoğraf seç." };

  const { data: event } = await supabase.from("events").select("created_by, club_id").eq("id", eventId).maybeSingle();
  if (!event) return { ok: false, error: "Etkinlik bulunamadı." };
  let canManage = event.created_by === userId;
  if (!canManage && event.club_id) {
    const role = await getMyClubRole(event.club_id);
    canManage = role === "owner" || role === "moderator";
  }
  if (!canManage) return { ok: false, error: "Bu etkinliği yönetme yetkin yok." };

  const sizeError = checkUploadSize(cover);
  if (sizeError) return { ok: false, error: sizeError };

  const path = `${userId}/event-${eventId}-${Date.now()}-${cover.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage.from("covers").upload(path, cover);
  if (uploadError) return { ok: false, error: uploadError.message };
  const { data: publicUrlData } = supabase.storage.from("covers").getPublicUrl(path);

  const { error } = await supabase.from("events").update({ cover_url: publicUrlData.publicUrl }).eq("id", eventId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/etkinlikler/[slug]", "page");
  revalidatePath("/etkinlikler");
  return { ok: true };
}
