"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult, VenueKind } from "@/lib/types";
import { slugify } from "@/lib/utils";

const VALID_KINDS: VenueKind[] = ["kitapci", "kitap_kafe", "okuma_dostu_kafe"];

export async function createVenueAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const name = String(formData.get("name") ?? "").trim();
  const district = String(formData.get("district") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "kitap_kafe");
  const kind: VenueKind = VALID_KINDS.includes(kindRaw as VenueKind) ? (kindRaw as VenueKind) : "kitap_kafe";
  const description = String(formData.get("description") ?? "").trim();
  const mapsUrl = String(formData.get("mapsUrl") ?? "").trim() || null;

  if (!name) return { ok: false, error: "Mekan adı gerekli." };
  if (!district) return { ok: false, error: "İlçe/semt gerekli." };

  const slug = `${slugify(name)}-${Date.now().toString(36).slice(-4)}`;

  const { error } = await supabase
    .from("venues")
    .insert({ slug, name, district, kind, description, maps_url: mapsUrl, added_by: userId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/mekanlar");
  return { ok: true };
}

/** Bir mekana not + puan bırakır (üye başına tek kayıt — tekrar gönderirse günceller). */
export async function addVenueNoteAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const venueId = String(formData.get("venueId") ?? "");
  const ratingRaw = Number(formData.get("rating"));
  const rating = Number.isFinite(ratingRaw) && ratingRaw >= 1 && ratingRaw <= 5 ? Math.round(ratingRaw) : null;
  const body = String(formData.get("body") ?? "").trim();

  if (!venueId) return { ok: false, error: "Geçersiz mekan." };
  if (!rating && !body) return { ok: false, error: "En az bir puan ya da not bırak." };

  const { error } = await supabase
    .from("venue_notes")
    .upsert({ venue_id: venueId, author_id: userId, rating, body }, { onConflict: "venue_id,author_id" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/mekanlar/[slug]", "page");
  return { ok: true };
}

/** "Şu an buradayım" — hafif, zaman damgalı bir check-in; "Haftanın Mekanı" hesabını da besler. */
export async function checkinAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const venueId = String(formData.get("venueId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!venueId) return { ok: false, error: "Geçersiz mekan." };

  const { error } = await supabase.from("venue_checkins").insert({ venue_id: venueId, user_id: userId, note });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/mekanlar/[slug]", "page");
  revalidatePath("/");
  return { ok: true };
}
