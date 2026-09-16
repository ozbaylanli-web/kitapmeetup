"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import { checkUploadSize } from "@/lib/uploads";
import type { ActionResult } from "@/lib/types";

export async function updateProfileAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const avatarColor = String(formData.get("avatarColor") ?? "").trim() || "#F0611F";
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const avatar = formData.get("avatar");

  let avatarUrl: string | undefined;
  if (avatar instanceof File && avatar.size > 0) {
    const sizeError = checkUploadSize(avatar);
    if (sizeError) return { ok: false, error: sizeError };
    const path = `${userId}/${Date.now()}-${avatar.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, avatar);
    if (uploadError) return { ok: false, error: uploadError.message };
    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      bio,
      city: city || null,
      avatar_color: avatarColor,
      birth_date: birthDate || null,
      gender: gender || null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil/[username]", "page");
  revalidatePath("/ayarlar");
  return { ok: true };
}

/** Hesap türünü değiştirir (okuyucu ⇄ yayınevi) — kayıt sırasında seçilmemişse sonradan buradan değiştirilebilir. */
export async function switchAccountKindAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const kindRaw = String(formData.get("kind") ?? "");
  const kind = kindRaw === "publisher" ? "publisher" : "reader";
  const website = String(formData.get("website") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({ account_kind: kind, publisher_website: kind === "publisher" ? website || null : null })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil/[username]", "page");
  revalidatePath("/ayarlar");
  return { ok: true };
}
