"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult } from "@/lib/types";

/**
 * Bir takas ilanına yanıt verirsin. "takas" (elimde var) ilanlarında kendi
 * kitabınla teklif yaparsın; "takas_arama" (arıyorum) ilanlarında ise zaten
 * aranan kitap bellidir — sadece "bende var" diye haber verirsin.
 */
export async function makeOfferAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const postId = String(formData.get("postId") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (!postId) return { ok: false, error: "Geçersiz ilan." };

  const { data: post } = await supabase.from("posts").select("type, book_id").eq("id", postId).maybeSingle();
  if (!post) return { ok: false, error: "İlan bulunamadı." };

  let bookId: string | undefined;
  if (post.type === "takas_arama") {
    // Aranan kitap zaten ilanda tanımlı — yeniden sormaya gerek yok.
    if (!post.book_id) return { ok: false, error: "İlan bir kitaba bağlı değil." };
    bookId = post.book_id;
  } else {
    const title = String(formData.get("title") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    if (!title) return { ok: false, error: "Teklif edeceğin kitabın adını yaz." };

    const { data: existingBook } = await supabase.from("books").select("id").ilike("title", title).maybeSingle();
    bookId = existingBook?.id as string | undefined;
    if (!bookId) {
      const { data: created, error: bookError } = await supabase
        .from("books")
        .insert({ title, author: author || "Bilinmiyor", added_by: userId })
        .select("id")
        .single();
      if (bookError || !created) return { ok: false, error: bookError?.message ?? "Kitap eklenemedi." };
      bookId = created.id;
    }
  }

  const { error } = await supabase.from("swap_offers").insert({ post_id: postId, offerer_id: userId, book_id: bookId, message });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/takas/[postId]", "page");
  revalidatePath("/");
  return { ok: true };
}

/** İlan sahibi bir teklifi kabul eder — aynı ilandaki diğer bekleyen teklifler otomatik reddedilir. */
export async function acceptOfferAction(_prev: ActionResult, offerId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase } = ctx;

  const { data: offer, error: fetchError } = await supabase.from("swap_offers").select("post_id").eq("id", offerId).maybeSingle();
  if (fetchError || !offer) return { ok: false, error: fetchError?.message ?? "Teklif bulunamadı." };

  const { error } = await supabase.from("swap_offers").update({ status: "accepted" }).eq("id", offerId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("swap_offers").update({ status: "declined" }).eq("post_id", offer.post_id).eq("status", "pending").neq("id", offerId);

  revalidatePath("/takas/[postId]", "page");
  return { ok: true };
}

/** İlan sahibi ya da teklifi yapan kişi, bekleyen bir teklifi geri çeker/reddeder. */
export async function declineOfferAction(_prev: ActionResult, offerId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;

  const { error } = await ctx.supabase.from("swap_offers").update({ status: "declined" }).eq("id", offerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/takas/[postId]", "page");
  return { ok: true };
}
