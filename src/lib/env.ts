/**
 * Kitapmeetup, Supabase ortam değişkenleri tanımlı olmadan da (yerel önizleme,
 * ilk kurulum) `src/lib/fixtures` altındaki örnek verilerle çalışır.
 * Gerçek bir Supabase projesi bağlandığında (bkz. README) aynı kod otomatik
 * olarak gerçek veritabanına geçer — tek satır kod değişikliği gerekmez.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  /** Canlı alan adı — sitemap/robots/OG etiketleri için. Ayarlanmazsa geliştirme için makul bir varsayılana düşer. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};

export function hasSupabaseEnv(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/** Sondaki "/" olmadan, her zaman geçerli bir origin döner (SEO/OG dosyaları için). */
export function getSiteUrl(): string {
  return (env.siteUrl || "https://kitapmeetup.com").replace(/\/$/, "");
}
