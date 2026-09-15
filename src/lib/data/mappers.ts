import type { Database } from "@/lib/supabase/types";
import type { AuthorSummary, BookSummary, CommentItem, SwapOffer } from "@/lib/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type BookRow = Database["public"]["Tables"]["books"]["Row"];

/**
 * Supabase satırlarını arayüz görünüm modellerine çeviren küçük yardımcılar.
 * Sorgular bilinçli olarak basit tutuldu (embedded/aggregate select yerine
 * ayrı sorgular + JS'te birleştirme) — okunması ve doğruluğunu gözle
 * denetlemesi daha kolay.
 */

export function mapAuthor(row: ProfileRow): AuthorSummary {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name ?? row.username,
    bio: row.bio,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url,
    city: row.city,
    birthDate: row.birth_date,
    gender: row.gender,
    isAdmin: row.is_admin,
    accountKind: row.account_kind,
    publisherWebsite: row.publisher_website,
  };
}

export function mapBook(row: BookRow): BookSummary {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    spineColor: row.spine_color,
    genre: row.genre,
  };
}

export function mapComment(
  row: Database["public"]["Tables"]["comments"]["Row"],
  author: AuthorSummary
): CommentItem {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author,
  };
}

export function mapSwapOffer(
  row: Database["public"]["Tables"]["swap_offers"]["Row"],
  offerer: AuthorSummary,
  book: BookSummary
): SwapOffer {
  return {
    id: row.id,
    book,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    offerer,
  };
}

/** Bir id listesine göre profilleri çekip id -> AuthorSummary sözlüğü döner. */
export async function fetchAuthorsByIds(
  supabase: import("@supabase/supabase-js").SupabaseClient<Database>,
  ids: string[]
): Promise<Map<string, AuthorSummary>> {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (unique.length === 0) return new Map();
  const { data } = await supabase.from("profiles").select("*").in("id", unique);
  const map = new Map<string, AuthorSummary>();
  (data ?? []).forEach((row) => map.set(row.id, mapAuthor(row)));
  return map;
}

export async function fetchBooksByIds(
  supabase: import("@supabase/supabase-js").SupabaseClient<Database>,
  ids: string[]
): Promise<Map<string, BookSummary>> {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (unique.length === 0) return new Map();
  const { data } = await supabase.from("books").select("*").in("id", unique);
  const map = new Map<string, BookSummary>();
  (data ?? []).forEach((row) => map.set(row.id, mapBook(row)));
  return map;
}
