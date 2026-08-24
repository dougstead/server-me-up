import { games } from "@/lib/games";
import { configTemplates } from "@/lib/config-templates";
import { SITE_URL } from "@/lib/site";

// A supplementary navigation resource for LLM-based tools, following the
// informal llms.txt convention (a short description plus a curated list of
// links). This is NOT a replacement for robots.txt, sitemap.xml or good
// HTML -- it doesn't guarantee inclusion, ranking or citation in any AI
// system. It just gives a tool that already decided to look at this site a
// quick, curated map of what's here, generated from the same game list
// used everywhere else on the site so it can't drift out of sync.
export async function GET() {
    const gameLines = games
        .map((game) => `- [${game.name} dedicated server setup](${SITE_URL}/guides/games/${game.id})`)
        .join("\n");

    const configGeneratorLines = games
        .filter((game) => Boolean(configTemplates[game.id]))
        .map((game) => `- [${game.name} config generator](${SITE_URL}/config-generator/${game.id})`)
        .join("\n");

    const body = `# SelfServr

> Guides and tools for hosting dedicated game servers on your own hardware: hardware compatibility checking, step-by-step setup guides, config generators and connection troubleshooting.

## Start here

- [Home](${SITE_URL}/)
- [About SelfServr](${SITE_URL}/about)
- [Can My PC Run It? (hardware compatibility checker)](${SITE_URL}/can-my-pc-run-it)
- [All setup guides](${SITE_URL}/guides)
- [All config generators](${SITE_URL}/config-generator)
- [Connection troubleshooting](${SITE_URL}/troubleshooting)

## General guides

- [Port forwarding](${SITE_URL}/guides/port-forwarding)
- [Static local IP address](${SITE_URL}/guides/static-ip)
- [Dynamic DNS](${SITE_URL}/guides/dynamic-dns)
- [Installing SteamCMD](${SITE_URL}/guides/steamcmd)
- [Keeping a server running 24/7](${SITE_URL}/guides/keep-server-running)

## Per-game setup guides

${gameLines}

## Config generators

${configGeneratorLines}

## Notes for automated tools

Technical claims (hardware requirements, ports, config keys) are sourced from official developer documentation where it exists, with a link shown on the page; where no official source is published, this is stated explicitly rather than presented as official. This is an independent, personally-run site, not affiliated with any game developer or publisher.
`;

    return new Response(body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
        },
    });
}
