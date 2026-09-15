import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { DAILY_PROMPTS, getTodaysPrompt as getFixtureTodaysPrompt } from "@/lib/fixtures";
import type { DailyPromptAnswer, TodaysPrompt } from "@/lib/types";
import { fetchAuthorsByIds } from "./mappers";
import { getCurrentUser } from "./auth";

function dayOfYear(): number {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/** Bugünün sorusu — herkese aynı, gün-of-year bazlı döngüsel bir soru. */
export async function getTodaysPromptDetail(): Promise<TodaysPrompt> {
  if (!hasSupabaseEnv()) {
    // Önizleme modunda cevaplar kalıcı değil (hiçbir mutasyon kalıcı değil) —
    // sabit, döngüsel bir kimlik yeterli.
    return { id: `day-${dayOfYear() % DAILY_PROMPTS.length}`, question: getFixtureTodaysPrompt(), myAnswer: null };
  }

  const supabase = await createClient();
  if (!supabase) return { id: "fallback", question: getFixtureTodaysPrompt(), myAnswer: null };

  const { data: rows } = await supabase.from("daily_prompts").select("id, question").order("id", { ascending: true });
  if (!rows || rows.length === 0) return { id: "fallback", question: getFixtureTodaysPrompt(), myAnswer: null };

  const row = rows[dayOfYear() % rows.length];
  const currentUser = await getCurrentUser();

  let myAnswer: DailyPromptAnswer | null = null;
  if (currentUser) {
    const { data: mine } = await supabase
      .from("daily_prompt_answers")
      .select("*")
      .eq("prompt_id", row.id)
      .eq("author_id", currentUser.id)
      .maybeSingle();
    if (mine) myAnswer = { id: mine.id, author: currentUser, body: mine.body, imageUrl: mine.image_url, createdAt: mine.created_at };
  }

  return { id: String(row.id), question: row.question, myAnswer };
}

/** Bugünün sorusuna verilen tüm cevaplar, en yeniden eskiye. */
export async function getPromptAnswers(promptId: string): Promise<DailyPromptAnswer[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  if (!supabase) return [];

  const { data: rows } = await supabase
    .from("daily_prompt_answers")
    .select("*")
    .eq("prompt_id", Number(promptId))
    .order("created_at", { ascending: false });
  if (!rows || rows.length === 0) return [];

  const authorMap = await fetchAuthorsByIds(supabase, rows.map((r) => r.author_id));
  return rows
    .map((r): DailyPromptAnswer | null => {
      const author = authorMap.get(r.author_id);
      if (!author) return null;
      return { id: r.id, author, body: r.body, imageUrl: r.image_url ?? null, createdAt: r.created_at };
    })
    .filter((a): a is DailyPromptAnswer => a !== null);
}
