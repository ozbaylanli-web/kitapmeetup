import type { MetadataRoute } from "next";

/**
 * PWA manifest'i — telefonda "Ana ekrana ekle" ile Kitapmeetup'ı gerçek bir
 * uygulama gibi (adres çubuğu olmadan, kendi ikonu ve marka renkleriyle)
 * açılabilir hale getirir. İkonlar `icon.tsx`/`apple-icon.tsx` üzerinden
 * anlık üretilir — ayrı bir görsel dosyaya gerek yok.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kitapmeetup — Kitap sohbetlerini yeniden buluşturuyoruz",
    short_name: "Kitapmeetup",
    description:
      "Kulüpler, etkinlikler, Akademi ve 'ne okuyorum' akışıyla kitap topluluğu.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf3e6",
    theme_color: "#f0611f",
    lang: "tr",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
