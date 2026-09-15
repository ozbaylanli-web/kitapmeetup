import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getAuthorByUsername } from "@/lib/fixtures";
import { mapAuthor } from "./mappers";
import type { AuthorSummary } from "@/lib/types";

/**
 * Tek bir kullanıcının hafif bir önizlemesi — ör. davet linkinde
 * "X seni davet etti" gibi tam ProfileDetail gerektirmeyen yerler için.
 */
export async function getAuthorPreview(username: string): Promise<AuthorSummary | null> {
  if (!hasSupabaseEnv()) return getAuthorByUsername(username);

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  return data ? mapAuthor(data) : null;
}
