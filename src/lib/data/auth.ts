import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { DEMO_USER } from "@/lib/fixtures";
import type { AuthorSummary } from "@/lib/types";
import { mapAuthor } from "./mappers";

/**
 * Giriş yapmış kullanıcının profilini döner.
 * Supabase bağlı değilse (fixture modu) her zaman DEMO_USER döner — böylece
 * uygulama "sanki giriş yapılmış" gibi gezilebilir; mutasyonlar ise
 * src/lib/data/actions.ts içinde nazikçe reddedilir.
 */
export async function getCurrentUser(): Promise<AuthorSummary | null> {
  if (!hasSupabaseEnv()) return DEMO_USER;

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return data ? mapAuthor(data) : null;
}
