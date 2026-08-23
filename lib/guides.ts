import { games } from "@/lib/games";
import { configTemplates } from "@/lib/config-templates";

export type Guide = {
  id: string;
  title: string;
  href: string;
};

// General home-networking / server-ops guides, shown directly under
// "Guides" in the burger menu. Add new guide pages here as they're written.
export const guides: Guide[] = [
  {
    id: "port-forwarding",
    title: "How to Set Up Port Forwarding",
    href: "/guides/port-forwarding",
  },
  {
    id: "static-ip",
    title: "Setting a Static Local IP Address",
    href: "/guides/static-ip",
  },
  {
    id: "dynamic-dns",
    title: "Dynamic DNS for a Changing IP Address",
    href: "/guides/dynamic-dns",
  },
  {
    id: "steamcmd",
    title: "Installing SteamCMD",
    href: "/guides/steamcmd",
  },
  {
    id: "keep-server-running",
    title: "Keeping Your Server Running 24/7",
    href: "/guides/keep-server-running",
  },
];

// Per-game setup guides, shown in a nested "Games" submenu under "Guides".
// Generated from the games list so it stays in sync automatically -- the
// actual page content lives in app/guides/games/[gameId]/page.tsx, sourced
// from lib/game-setup.ts.
export const gameGuides: Guide[] = games.map((game) => ({
  id: game.id,
  title: game.name,
  href: `/guides/games/${game.id}`,
}));

// Per-game config generators, shown in their own top-level "Config
// Generators" burger-menu section. Only includes games that actually have a
// template -- see lib/config-templates.ts.
export const configGeneratorGuides: Guide[] = games
  .filter((game) => Boolean(configTemplates[game.id]))
  .map((game) => ({
    id: game.id,
    title: game.name,
    href: `/config-generator/${game.id}`,
  }));

// Per-game "Can My PC Run It?" landing pages, used for sitemap generation.
// Not shown in the burger menu (it already links to the general
// /can-my-pc-run-it page) -- these exist mainly so each game gets its own
// crawlable, indexable URL.
export const compatibilityGuides: Guide[] = games.map((game) => ({
  id: game.id,
  title: game.name,
  href: `/can-my-pc-run-it/${game.id}`,
}));
