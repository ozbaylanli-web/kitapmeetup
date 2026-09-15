"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Tarayıcıda kullanılacak Supabase istemcisi. Ortam değişkenleri yoksa
 * `null` döner — çağıran taraf mock/fixture veriye düşer.
 */
export function createClient(): SupabaseClient<Database> | null {
  if (!hasSupabaseEnv()) return null;
  return createBrowserClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!);
}
