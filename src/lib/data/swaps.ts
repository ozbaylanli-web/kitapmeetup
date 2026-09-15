import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { SWAP_OFFERS } from "@/lib/fixtures";
import type { SwapOffer } from "@/lib/types";
import { fetchAuthorsByIds, fetchBooksByIds, mapSwapOffer } from "./mappers";

/** Bir takas ilanına (type: "takas" gönderi) yapılan tüm teklifler, en yeniden eskiye. */
export async function getSwapOffers(postId: string): Promise<SwapOffer[]> {
  if (!hasSupabaseEnv()) return SWAP_OFFERS[postId] ?? [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase
    .from("swap_offers")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (!rows || rows.length === 0) return [];

  const [authorMap, bookMap] = await Promise.all([
    fetchAuthorsByIds(supabase, rows.map((r) => r.offerer_id)),
    fetchBooksByIds(supabase, rows.map((r) => r.book_id)),
  ]);

  return rows
    .map((r) => {
      const offerer = authorMap.get(r.offerer_id);
      const book = bookMap.get(r.book_id);
      if (!offerer || !book) return null;
      return mapSwapOffer(r, offerer, book);
    })
    .filter((o): o is SwapOffer => Boolean(o));
}
