import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { BOOK_CATALOG } from "@/lib/fixtures/catalog";
import type { BookSummary } from "@/lib/types";
import { colorForText, slugify } from "@/lib/utils";

const RESULT_LIMIT = 60;

/**
 * Kitap kataloğunda arar (başlık ya da yazar). Sorgu boşsa alfabetik ilk
 * sonuçları döner — "gözat" hissi için.
 */
export async function searchCatalog(query?: string): Promise<BookSummary[]> {
  const q = (query ?? "").trim().toLowerCase();

  if (!hasSupabaseEnv()) {
    const filtered = q
      ? BOOK_CATALOG.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
      : BOOK_CATALOG;
    return filtered.slice(0, RESULT_LIMIT).map((b) => ({
      id: `cat_${slugify(b.title)}`,
      title: b.title,
      author: b.author,
      spineColor: colorForText(b.title),
      genre: b.genre,
    }));
  }

  const supabase = await createClient();
  if (!supabase) return [];

  let dbQuery = supabase.from("books").select("*").order("title", { ascending: true }).limit(RESULT_LIMIT);
  if (q) {
    dbQuery = dbQuery.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
  }
  const { data } = await dbQuery;
  return (data ?? []).map((b) => ({ id: b.id, title: b.title, author: b.author, spineColor: b.spine_color, genre: b.genre }));
}

export function catalogSize(): number {
  return BOOK_CATALOG.length;
}
