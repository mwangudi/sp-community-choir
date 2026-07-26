import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SONGS } from "@/lib/songs";

/** Static routes, newest-changing first. */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/repertoire", priority: 0.9, changeFrequency: "weekly" },
  { path: "/propose", priority: 0.8, changeFrequency: "weekly" },
  { path: "/concerts", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.6, changeFrequency: "monthly" },
  { path: "/join", priority: 0.7, changeFrequency: "monthly" },
  { path: "/support", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...ROUTES.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...SONGS.map((s) => ({
      url: `${SITE_URL}/repertoire/${s.slug}`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];
}
