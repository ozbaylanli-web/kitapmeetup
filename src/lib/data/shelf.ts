import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { AUTHORS, SHELVES } from "@/lib/fixtures";
import type { CommunityReadingItem } from "@/lib/types";
import { fetchAuthorsByIds, fetchBooksByIds } from "./mappers";

/** "Şu an ne okunuyor" şeridi için topluluk genelinde en güncel "reading" kayıtları. */
export async function getCommunityReadingNow(limit = 10): Promise<CommunityReadingItem[]> {
  if (!hasSupabaseEnv()) {
    const items: CommunityReadingItem[] = [];
    for (const [username, shelf] of Object.entries(SHELVES)) {
      const author = AUTHORS[username];
      if (!author) continue;
      for (const entry of shelf) {
        if (entry.status === "reading") items.push({ author, book: entry.book });
      }
    }
    return items.slice(0, limit);
  }

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase
    .from("shelf_entries")
    .select("user_id, book_id")
    .eq("status", "reading")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!rows || rows.length === 0) return [];

  const authorMap = await fetchAuthorsByIds(supabase, rows.map((r) => r.user_id));
  const bookMap = await fetchBooksByIds(supabase, rows.map((r) => r.book_id));

  return rows
    .map((r) => {
      const author = authorMap.get(r.user_id);
      const book = bookMap.get(r.book_id);
      if (!author || !book) return null;
      return { author, book };
    })
    .filter((x): x is CommunityReadingItem => Boolean(x));
}
