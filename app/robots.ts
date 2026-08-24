import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Named AI-crawler user agents that are explicitly allowed alongside the
// blanket "*" rule below -- belt-and-braces in case any of them ever get a
// more restrictive default treatment than a plain wildcard allow. This list
// covers general-purpose AI search/answer crawlers (the ones that fetch a
// page to answer a live user query), not model-training-only crawlers.
const AI_CRAWLER_USER_AGENTS = [
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT browsing/plugins
  "GPTBot", // OpenAI (general crawling)
  "ClaudeBot", // Anthropic
  "Claude-User", // Claude browsing
  "Claude-SearchBot", // Claude search
  "PerplexityBot", // Perplexity
  "Google-Extended", // Google AI features (Gemini, AI Overviews)
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /api/ is internal plumbing (the CPU search endpoint), not a page
        // -- nothing useful for a crawler to index there.
        disallow: "/api/",
      },
      ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: "/api/",
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
