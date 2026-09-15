"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { requireUser, isCtx } from "./helpers";
import type { ActionResult } from "@/lib/types";

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

/** Kulübün "şu an resmi olarak okuduğu kitabı" sabitler/değiştirir — sadece yönetici/moderatör (RLS ile korunur). */
export async function setClubCurrentBookAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const clubId = String(formData.get("clubId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!clubId || !title) return { ok: false, error: "Kitap adı gerekli." };

  const book = await findOrCreateBook(supabase, title, author, userId);
  if ("error" in book) return { ok: false, error: book.error };

  const { error } = await supabase
    .from("clubs")
    .update({ current_book_id: book.id, current_book_note: note, current_book_set_at: new Date().toISOString() })
    .eq("id", clubId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/kulupler/[slug]", "page");
  return { ok: true };
}

/** Pinlenen kitap üzerine yeni bir bölüm tartışması açar — herhangi bir kulüp üyesi başlatabilir. */
export async function createReadThreadAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const ctx = await requireUser();
  if (!isCtx(ctx)) return ctx;
  const { supabase, userId } = ctx;

  const clubId = String(formData.get("clubId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!clubId || !title) return { ok: false, error: "Başlık gerekli." };

  const { error } = await supabase.from("club_read_threads").insert({ club_id: clubId, title, created_by: userId });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/kulupler/[slug]", "page");
  return { ok: true };
}
