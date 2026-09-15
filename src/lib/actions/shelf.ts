"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult, ShelfStatus } from "@/lib/types";

async function findOrCreateBook(
  supabase: SupabaseClient<Database>,
  title: string,
  author: string,
  addedBy: string,
  genre?: string | null
): Promise<{ id: string } | { error: string }> {
  const { data: existing } = await supabase.from("books").select("id").ilike("title", title).maybeSingle();
  if (existing) return { id: existing.id };

  const { data: created, error } = await supabase
    .from("books")
    .insert({ title, author: author || "Bilinmiyor", genre: genre || null, added_by: addedBy })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: created.id };
}

function parseRating(raw: FormDataEntryValue | null): number | null {
  const n = Number(raw);
  if (!raw || !Number.isFinite(n) || n < 1 || n > 5) return null;
  return Math.round(n);
}

const today = () => new Date().toISOString().slice(0, 10);

export async function addToShelfAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const title = String(formData.get("title") ?? "").trim();
  const authorName = String(formData.get("author") ?? "").trim();
  const status = String(formData.get("status") ?? "reading") as ShelfStatus;
  const note = String(formData.get("note") ?? "").trim() || null;
  const rating = status === "read" ? parseRating(formData.get("rating")) : null;

  if (!title) return { ok: false, error: "Kitap adı gerekli." };

  const book = await findOrCreateBook(supabase, title, authorName, userId);
  if ("error" in book) return { ok: false, error: book.error };

  const { error: shelfError } = await supabase.from("shelf_entries").upsert(
    { user_id: userId, book_id: book.id, status, note, rating, finished_at: status === "read" ? today() : null },
    { onConflict: "user_id,book_id" }
  );
  if (shelfError) return { ok: false, error: shelfError.message };

  revalidatePath("/profil/[username]", "page");
  return { ok: true };
}

/**
 * Rafa zaten eklenmiş bir kitabı düzenlemek için (durum/puan/not) —
 * "Kataloğdan seç" ile tek dokunuşla eklenip sonradan puanlanan kitaplar dahil.
 */
export async function updateShelfEntryAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const entryId = String(formData.get("entryId") ?? "");
  const status = String(formData.get("status") ?? "reading") as ShelfStatus;
  const note = String(formData.get("note") ?? "").trim() || null;
  const rating = status === "read" ? parseRating(formData.get("rating")) : null;
  if (!entryId) return { ok: false, error: "Geçersiz kayıt." };

  const { data: existing } = await supabase
    .from("shelf_entries")
    .select("finished_at")
    .eq("id", entryId)
    .eq("user_id", userId)
    .maybeSingle();

  const update: { status: ShelfStatus; note: string | null; rating: number | null; finished_at?: string } = {
    status,
    note,
    rating,
  };
  if (status === "read" && !existing?.finished_at) update.finished_at = today();

  const { error } = await supabase.from("shelf_entries").update(update).eq("id", entryId).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil/[username]", "page");
  return { ok: true };
}

export async function removeShelfEntryAction(_prev: ActionResult, entryId: string): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const { error } = await supabase.from("shelf_entries").delete().eq("id", entryId).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/profil/[username]", "page");
  return { ok: true };
}

/**
 * Kitap Kataloğu'ndaki (/kitaplar) "tek dokunuşla ekle" butonu için —
 * FormData yerine doğrudan bir payload alır (LikeButton'daki gibi).
 */
export async function quickAddToShelfAction(
  _prev: ActionResult,
  payload: { title: string; author: string; status: ShelfStatus; genre?: string | null }
): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  if (!payload.title) return { ok: false, error: "Kitap adı gerekli." };

  const book = await findOrCreateBook(supabase, payload.title, payload.author, userId, payload.genre);
  if ("error" in book) return { ok: false, error: book.error };

  const { error: shelfError } = await supabase
    .from("shelf_entries")
    .upsert({ user_id: userId, book_id: book.id, status: payload.status }, { onConflict: "user_id,book_id" });
  if (shelfError) return { ok: false, error: shelfError.message };

  revalidatePath("/profil/[username]", "page");
  return { ok: true };
}
