import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";

// Central page-metadata builder -- every route's `metadata`/`generateMetadata`
// should go through this instead of hand-assembling a Metadata object, so
// canonical URLs, Open Graph and Twitter cards stay consistent everywhere.
//
// Why this exists: the root layout sets a title *template* ("%s | SelfServr")
// and its own openGraph/twitter blocks, but Next.js does not cascade a page's
// plain `title`/`description` into `openGraph.title`/`openGraph.description`
// -- those are separate fields that fall back to whatever the *parent*
// segment set if the child omits them. Without this helper, every page below
// the root would show the generic site title/description in link previews
// (Slack, Discord, Twitter/X, iMessage) instead of its own -- correct
// <title> tag, wrong social preview.
export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
}: {
  // Page-specific title, WITHOUT the "| SelfServr" suffix -- the root
  // layout's title.template adds that automatically for the <title> tag.
  title: string;
  description: string;
  // Canonical path, e.g. "/guides/games/minecraft" (leading slash, no
  // origin -- resolved against metadataBase, matching the existing
  // alternates.canonical convention used across the site).
  path: string;
  // Open Graph/Twitter previews don't get the title.template treatment,
  // so this builds "<title> | SelfServr" for them by default. Override only
  // if a page genuinely wants a different social-preview title.
  ogTitle?: string;
}): Metadata {
  const resolvedOgTitle = ogTitle ?? `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: resolvedOgTitle,
      description,
    },
    twitter: {
      card: "summary",
      title: resolvedOgTitle,
      description,
    },
  };
}
