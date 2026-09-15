import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env, hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Server Component / Server Action içinden kullanılacak Supabase istemcisi.
 * Next.js 16'da `cookies()` async olduğu için bu fonksiyon da async'tir.
 * Ortam değişkenleri tanımlı değilse `null` döner (bkz. src/lib/env.ts).
 */
export async function createClient(): Promise<SupabaseClient<Database> | null> {
  if (!hasSupabaseEnv()) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Salt-okunur bir Server Component'ten çağrıldıysa cookie set edilemez.
          // Oturum tazeleme işini proxy.ts zaten üstleniyor, bu yüzden yutuyoruz.
        }
      },
    },
  });
}
