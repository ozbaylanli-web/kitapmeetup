"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import { checkUploadSize } from "@/lib/uploads";
import type { ActionResult } from "@/lib/types";

export async function submitPromptAnswerAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const promptId = String(formData.get("promptId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const image = formData.get("image");

  if (!promptId || Number.isNaN(Number(promptId))) return { ok: false, error: "Geçersiz soru." };
  if (!body && !(image instanceof File && image.size > 0)) return { ok: false, error: "Bir cevap yaz ya da bir fotoğraf ekle." };

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    const sizeError = checkUploadSize(image);
    if (sizeError) return { ok: false, error: sizeError };
    const path = `daily-answers/${userId}/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("post-images").upload(path, image);
    if (uploadError) return { ok: false, error: uploadError.message };
    const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(path);
    imageUrl = publicUrlData.publicUrl;
  } else {
    // Yeni bir fotoğraf seçilmediyse — daha önce cevabına eklediğin fotoğraf varsa onu koru
    // (upsert'in image_url'i null'layıp mevcut fotoğrafı silmesini önler).
    const { data: existing } = await supabase
      .from("daily_prompt_answers")
      .select("image_url")
      .eq("prompt_id", Number(promptId))
      .eq("author_id", userId)
      .maybeSingle();
    imageUrl = existing?.image_url ?? null;
  }

  const { error } = await supabase
    .from("daily_prompt_answers")
    .upsert(
      { prompt_id: Number(promptId), author_id: userId, body, image_url: imageUrl },
      { onConflict: "prompt_id,author_id" }
    );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/gunun-sorusu");
  return { ok: true };
}
