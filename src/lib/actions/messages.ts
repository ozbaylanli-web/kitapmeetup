"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult } from "@/lib/types";

export async function sendMessageAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const recipientUsername = String(formData.get("recipientUsername") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!recipientUsername) return { ok: false, error: "Alıcı bulunamadı." };
  if (!body) return { ok: false, error: "Mesaj boş olamaz." };

  const { data: recipient } = await supabase.from("profiles").select("id").eq("username", recipientUsername).maybeSingle();
  if (!recipient) return { ok: false, error: "Kullanıcı bulunamadı." };
  if (recipient.id === userId) return { ok: false, error: "Kendine mesaj gönderemezsin." };

  const { error } = await supabase.from("direct_messages").insert({ sender_id: userId, recipient_id: recipient.id, body });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/mesajlar/${recipientUsername}`);
  revalidatePath("/mesajlar");
  return { ok: true };
}
