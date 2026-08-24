// schema.org JSON-LD builders, shared across the site so every page emits
// structured data through the same functions instead of hand-rolling a raw
// object per page. Pair these with <JsonLd data={...} /> (components/JsonLd)
// to render them. Every builder here reflects content that's actually
// visible on the page it's used on -- nothing here should be used to assert
// something the page doesn't otherwise say.

import { SITE_NAME, SITE_SCHEMA_DESCRIPTION, SITE_URL } from "./site";

// ---------------------------------------------------------------------------
// Site-level: Organization + WebSite, emitted once in the root layout.
// ---------------------------------------------------------------------------

// Intentionally minimal -- SelfServr is a one-person hobby project (see
// /about and the Privacy Policy), not a registered company, so this doesn't
// invent an address, founder, logo or social profiles that don't exist.
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_SCHEMA_DESCRIPTION,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_SCHEMA_DESCRIPTION,
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList -- used by components/Breadcrumbs.tsx.
// ---------------------------------------------------------------------------

export type BreadcrumbSchemaItem = {
  name: string;
  // Omitted for the current page (the trail's last, non-linked crumb).
  url?: string;
};

export function breadcrumbSchema(items: BreadcrumbSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// FAQPage -- used for genuine Q&A sections (e.g. the "Can My PC Run It?"
// per-game pages). Only use this for questions actually rendered as visible
// Q&A content on the page -- schema.org/Google guidance is explicit that
// FAQPage markup must match on-page content, not be added invisibly.
// ---------------------------------------------------------------------------

export type FaqSchemaItem = {
  question: string;
  answer: string;
};

export function faqSchema(faqs: FaqSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// HowTo -- for pages that are genuinely a sequential, numbered set of
// instructions (the per-game setup guides, port forwarding, SteamCMD,
// keep-server-running). Don't use this for reference/lookup pages (the
// compatibility checker, config generators) that aren't "do step 1, then
// step 2" content.
// ---------------------------------------------------------------------------

export type HowToStep = {
  name: string;
  text: string;
  url?: string;
};

export function howToSchema({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------
// TechArticle -- for informational reference content that isn't a numbered
// walkthrough (kept available for future pages; not every guide needs it on
// top of HowTo/FAQ, and a page shouldn't carry both HowTo and TechArticle
// for the same content).
// ---------------------------------------------------------------------------

export function techArticleSchema({
  headline,
  description,
  path,
}: {
  headline: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url: `${SITE_URL}${path}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
