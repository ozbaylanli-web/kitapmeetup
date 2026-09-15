import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { InstagramPostRecord } from "@/lib/types";

/**
 * Bağlantı durumu — sadece yöneticiler görebilir (RLS: instagram_connections
 * tablosu admin-only). Bu yüzden bu fonksiyon yalnızca zaten `isAdmin` olduğu
 * bilinen bir kullanıcı bağlamında anlamlıdır; admin olmayan biri çağırırsa
 * RLS satırı gizler ve sessizce "bağlı değil" döner (güvenlik açığı değil,
 * sadece görünürlük).
 */
export async function getInstagramConnectionStatus(): Promise<{ connected: boolean; username: string | null }> {
  if (!hasSupabaseEnv()) return { connected: false, username: null };

  const supabase = await createClient();
  if (!supabase) return { connected: false, username: null };

  const { data } = await supabase.from("instagram_connections").select("ig_username").limit(1).maybeSingle();
  return { connected: Boolean(data), username: data?.ig_username ?? null };
}

/** Bir etkinliğin/gönderinin en son Instagram paylaşım denemesi — herkese görünür (RLS: select-all). */
export async function getInstagramPostRecord(sourceType: "event" | "post", sourceId: string): Promise<InstagramPostRecord | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("instagram_posts")
    .select("*")
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;

  return { status: data.status, permalink: data.ig_permalink, error: data.error, createdAt: data.created_at };
}
