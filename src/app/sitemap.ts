import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getClubs } from "@/lib/data/clubs";
import { getEvents } from "@/lib/data/events";
import { getBlogPosts } from "@/lib/data/blog";
import { getCourses } from "@/lib/data/academy";

/**
 * Statik sayfalar + herkese açık dinamik içerikler (kulüpler, etkinlikler,
 * blog yazıları, Akademi dersleri). Kitap kataloğu (`/kitaplar`) tek bir
 * arama sayfası olduğu için (binlerce ayrı URL yok) burada tek satırla yer
 * alıyor. Kişisel sayfalar (profil, mesajlar) kasıtlı olarak dışarıda.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const [clubs, events, blogPosts, courses] = await Promise.all([
    getClubs().catch(() => []),
    getEvents().catch(() => []),
    getBlogPosts().catch(() => []),
    getCourses().catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "hourly", priority: 1, lastModified: now },
    { url: `${base}/kulupler`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${base}/etkinlikler`, changeFrequency: "daily", priority: 0.8, lastModified: now },
    { url: `${base}/akademi`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
    { url: `${base}/blog`, changeFrequency: "daily", priority: 0.7, lastModified: now },
    { url: `${base}/kitaplar`, changeFrequency: "weekly", priority: 0.7, lastModified: now },
    { url: `${base}/eslesmeler`, changeFrequency: "weekly", priority: 0.4, lastModified: now },
    { url: `${base}/giris`, changeFrequency: "monthly", priority: 0.3, lastModified: now },
    { url: `${base}/kayit`, changeFrequency: "monthly", priority: 0.3, lastModified: now },
  ];

  const clubEntries: MetadataRoute.Sitemap = clubs.map((c) => ({
    url: `${base}/kulupler/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const eventEntries: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${base}/etkinlikler/${e.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
    lastModified: new Date(e.startsAt),
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
    lastModified: new Date(p.publishedAt),
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${base}/akademi/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...clubEntries, ...eventEntries, ...blogEntries, ...courseEntries];
}
