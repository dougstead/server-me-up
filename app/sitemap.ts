import type { MetadataRoute } from "next";
import { games } from "@/lib/games";
import { guides } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/can-my-pc-run-it`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/palworld/config-generator`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${SITE_URL}${guide.href}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const gameGuideRoutes: MetadataRoute.Sitemap = games.map((game) => ({
    url: `${SITE_URL}/guides/games/${game.id}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...guideRoutes, ...gameGuideRoutes];
}
