"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { requireUser, isCtx } from "./helpers";
import { checkUploadSize } from "@/lib/uploads";
import type { ActionResult, PostType, CommentTarget } from "@/lib/types";

async function findOrCreateBook(
  supabase: SupabaseClient<Database>,
  title: string,
  author: string,
  addedBy: string
): Promise<{ id: string } | { error: string }> {
  const { data: existing } = await supabase.from("books").select("id").ilike("title", title).maybeSingle();
  if (existing) return { id: existing.id };

  const { data: created, error } = await supabase
    .from("books")
    .insert({ title, author: author || "Bilinmiyor", added_by: addedBy })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: created.id };
}

const SWAP_TYPES: PostType[] = ["takas", "takas_arama"];
// "etkinlik" ve "kulup" sistem gönderileridir — yalnızca createEventAction/createClubAction
// tarafından, gerçek bir etkinlik/kulüp oluşturulduğunda eklenir; kullanıcı akıştan bunları
// bizzat oluşturamaz (spoofing önlemi).
const USER_COMPOSABLE_TYPES: PostType[] = ["text", "quote", "photo", "question", "takas", "takas_arama"];

export async function createPostAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const type = String(formData.get("type") ?? "text") as PostType;
  if (!USER_COMPOSABLE_TYPES.includes(type)) return { ok: false, error: "Geçersiz gönderi türü." };
  const isSwap = SWAP_TYPES.includes(type);
  const body = String(formData.get("body") ?? "").trim();
  const clubId = String(formData.get("clubId") ?? "") || null;
  const bookTitle = String(formData.get("bookTitle") ?? "").trim();
  const bookAuthor = String(formData.get("bookAuthor") ?? "").trim();
  const counterBookTitle = String(formData.get("counterBookTitle") ?? "").trim();
  const counterBookAuthor = String(formData.get("counterBookAuthor") ?? "").trim();
  const image = formData.get("image");

  if (isSwap && !bookTitle) {
    return {
      ok: false,
      error: type === "takas_arama" ? "Aradığın kitabın adını yaz." : "Takas etmek istediğin kitabın adını yaz.",
    };
  }
  if (!body && !(image instanceof File && image.size > 0) && !isSwap) {
    return { ok: false, error: "Bir şeyler yaz ya da bir fotoğraf ekle." };
  }

  let bookId: string | null = null;
  if (bookTitle) {
    const book = await findOrCreateBook(supabase, bookTitle, bookAuthor, userId);
    if ("error" in book) return { ok: false, error: book.error };
    bookId = book.id;
  }

  let counterBookId: string | null = null;
  if (type === "takas_arama" && counterBookTitle) {
    const counterBook = await findOrCreateBook(supabase, counterBookTitle, counterBookAuthor, userId);
    if ("error" in counterBook) return { ok: false, error: counterBook.error };
    counterBookId = counterBook.id;
  }

  let imageUrl: string | null = null;
  if (image instanceof File && image.size > 0) {
    const sizeError = checkUploadSize(image);
    if (sizeError) return { ok: false, error: sizeError };
    const path = `${userId}/${Date.now()}-${image.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("post-images").upload(path, image);
    if (uploadError) return { ok: false, error: uploadError.message };
    const { data: publicUrlData } = supabase.storage.from("post-images").getPublicUrl(path);
    imageUrl = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    author_id: userId,
    club_id: clubId,
    type,
    body: body || null,
    book_id: bookId,
    counter_book_id: counterBookId,
    image_url: imageUrl,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/kulupler");
  return { ok: true };
}

export async function toggleLikeAction(_prev: ActionResult, postId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
  }

  revalidatePath("/");
  return { ok: true };
}

export async function createCommentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const targetType = String(formData.get("targetType") ?? "post") as CommentTarget;
  const targetId = String(formData.get("targetId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!targetId) return { ok: false, error: "Geçersiz hedef." };
  if (!body) return { ok: false, error: "Yorum boş olamaz." };

  const { error } = await supabase
    .from("comments")
    .insert({ author_id: userId, target_type: targetType, target_id: targetId, body });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  return { ok: true };
}
