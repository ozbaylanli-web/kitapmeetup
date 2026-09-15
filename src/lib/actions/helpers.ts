import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/types";

export type ActionCtx = { supabase: SupabaseClient<Database>; userId: string };

/**
 * Tüm mutasyon Server Action'larının başında çağrılır.
 * - Supabase bağlı değilse -> { ok:false, demo:true } (önizleme modu)
 * - Giriş yapılmamışsa -> { ok:false, error: "..." }
 * - Aksi halde -> { supabase, userId }
 */
export async function requireUser(): Promise<ActionCtx | ActionResult> {
  if (!hasSupabaseEnv()) return { ok: false, demo: true };
  const supabase = await createClient();
  if (!supabase) return { ok: false, demo: true };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Bu işlem için giriş yapmalısın." };

  return { supabase, userId: user.id };
}

export function isCtx(value: ActionCtx | ActionResult): value is ActionCtx {
  return "supabase" in value;
}
