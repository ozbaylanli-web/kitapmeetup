"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult } from "@/lib/types";
import { slugify } from "@/lib/utils";

export async function joinClubAction(_prev: ActionResult, clubId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const { error } = await ctx.supabase.from("club_members").insert({ club_id: clubId, user_id: ctx.userId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/kulupler");
  return { ok: true };
}

export async function leaveClubAction(_prev: ActionResult, clubId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const { error } = await ctx.supabase.from("club_members").delete().eq("club_id", clubId).eq("user_id", ctx.userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/kulupler");
  return { ok: true };
}

export async function createClubAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim() || "📚";
  const color = String(formData.get("color") ?? "").trim() || "#F0611F";

  if (!name) return { ok: false, error: "Kulüp adı gerekli." };

  const slug = `${slugify(name)}-${Date.now().toString(36).slice(-4)}`;

  const { data: club, error } = await supabase
    .from("clubs")
    .insert({ name, slug, description, icon, color, created_by: userId })
    .select("id, slug")
    .single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("club_members").insert({ club_id: club.id, user_id: userId, role: "owner" });

  // Ana akışa düşecek duyuru gönderisi — best-effort, başarısız olsa da kulüp oluşturma başarılı sayılır.
  await supabase.from("posts").insert({
    author_id: userId,
    type: "kulup",
    body: `🎉 Yeni bir kulüp kuruldu: ${name}`,
    club_id: club.id,
  });

  revalidatePath("/kulupler");
  revalidatePath("/");
  return { ok: true };
}

/** Kulübün sabit buluşma mekanını (İstanbul mekan rehberinden) ayarlar/değiştirir — RLS gereği sadece yönetici/moderatör. */
export async function setHomeVenueAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const clubId = String(formData.get("clubId") ?? "");
  const venueId = String(formData.get("venueId") ?? "").trim() || null;
  if (!clubId) return { ok: false, error: "Geçersiz kulüp." };

  const { error } = await ctx.supabase.from("clubs").update({ home_venue_id: venueId }).eq("id", clubId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/kulupler/[slug]", "page");
  return { ok: true };
}
