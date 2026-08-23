import { games } from "@/lib/games";

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
