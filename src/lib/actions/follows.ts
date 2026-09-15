"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult } from "@/lib/types";

export async function followAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const targetId = String(formData.get("targetId") ?? "");
  const username = String(formData.get("username") ?? "");
  if (!targetId || targetId === userId) return { ok: false, error: "Geçersiz kullanıcı." };

  const { error } = await supabase.from("follows").upsert({ follower_id: userId, following_id: targetId }, { onConflict: "follower_id,following_id" });
  if (error) return { ok: false, error: error.message };

  if (username) revalidatePath(`/profil/${username}`);
  return { ok: true };
}

export async function unfollowAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const targetId = String(formData.get("targetId") ?? "");
  const username = String(formData.get("username") ?? "");
  if (!targetId) return { ok: false, error: "Geçersiz kullanıcı." };

  const { error } = await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", targetId);
  if (error) return { ok: false, error: error.message };

  if (username) revalidatePath(`/profil/${username}`);
  return { ok: true };
}
