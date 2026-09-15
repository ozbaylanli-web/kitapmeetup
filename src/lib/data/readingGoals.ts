import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { READING_GOALS, SHELVES } from "@/lib/fixtures";
import type { ReadingGoal } from "@/lib/types";

/**
 * Bir kullanıcının belirli bir yıl için okuma hedefi + o yıl "okudum"
 * işaretlediği kitap sayısı. finished_at varsa ona göre, yoksa (eski
 * kayıtlar) created_at'e göre yıl hesaplanır.
 */
export async function getReadingGoal(userId: string, username: string, year: number): Promise<ReadingGoal | null> {
  if (!hasSupabaseEnv()) {
    const target = READING_GOALS[username];
    if (!target) return null;
    const completed = (SHELVES[username] ?? []).filter((s) => s.status === "read").length;
    return { year, target, completed };
  }

  const supabase = await createClient();
  if (!supabase) return null;

  const { data: goalRow } = await supabase
    .from("reading_goals")
    .select("target")
    .eq("user_id", userId)
    .eq("year", year)
    .maybeSingle();
  if (!goalRow) return null;

  const { data: readRows } = await supabase
    .from("shelf_entries")
    .select("finished_at, created_at")
    .eq("user_id", userId)
    .eq("status", "read");
  const completed = (readRows ?? []).filter((r) => new Date(r.finished_at ?? r.created_at).getFullYear() === year).length;

  return { year, target: goalRow.target, completed };
}
