// Checks that each game's config-template source link is still reachable,
// and prints a per-game reminder of where to look and what to compare
// against when reviewing data/game-configs/*.
//
// Why this doesn't auto-rewrite the config files (unlike update:cpus):
// none of the 16 supported games ship a stable, versioned, machine-fetchable
// "default config" asset that's safe to redistribute:
//   - Most developers don't publish a config file at all -- it's generated
//     the first time you run their server, or documented as prose on a wiki.
//   - The one bulk community repo of example configs we found
//     (GameServerManagers/Game-Server-Configs) has NO LICENSE, so nothing in
//     it can be reused on a commercial site.
//   - Community game wikis (Fandom, wiki.gg) are typically CC BY-NC-SA --
//     NonCommercial -- so their specific write-ups can't be bulk-copied here
//     either, even though the underlying facts (a key's name and default)
//     aren't themselves copyrightable.
//
// So automated, unattended rewriting isn't safely achievable here. Silently
// re-scraping a page's structure and regenerating a template is also its
// own risk: if a source page's layout changes, a scraper can produce
// confidently-wrong output with no signal that anything went wrong -- worse
// than the status quo. Instead, this script checks each source link is
// still alive and prints where a human should look, so reviewing all 16
// games takes a few minutes instead of a fresh research pass each time.
//
// Run with: npm run update:configs

import { configTemplates } from "../lib/config-templates";

type LinkCheckResult = "ok" | "unreachable" | "no-source-url";

async function checkUrl(url: string): Promise<LinkCheckResult> {
    try {
        const response = await fetch(url, { method: "GET", redirect: "follow" });
        return response.ok ? "ok" : "unreachable";
    } catch {
        return "unreachable";
    }
}

async function main() {
    console.log("SelfServr - config template source check");
    console.log("==============================================\n");

    const gameIds = Object.keys(configTemplates).sort();
    let unreachableCount = 0;
    let noSourceCount = 0;

    for (const gameId of gameIds) {
        const template = configTemplates[gameId];
        const dataFile =
            typeof template.dataFile === "function"
                ? "(multiple -- varies by field)"
                : template.dataFile;

        console.log(`${template.configFileLabel} (${gameId})`);
        console.log(`  data file:   data/game-configs/${dataFile}`);
        console.log(`  sourceNote:  ${template.sourceNote}`);

        if (!template.sourceUrl) {
            console.log(`  sourceUrl:   none -- community-documented, no single reference page`);
            noSourceCount += 1;
        } else {
            const result = await checkUrl(template.sourceUrl);

            if (result === "ok") {
                console.log(`  sourceUrl:   ${template.sourceUrl} (reachable)`);
            } else {
                console.log(`  sourceUrl:   ${template.sourceUrl} (UNREACHABLE -- check this)`);
                unreachableCount += 1;
            }
        }

        console.log("");
    }

    console.log("==============================================");
    console.log(
        `Checked ${gameIds.length} games: ${unreachableCount} unreachable source link(s), ${noSourceCount} with no single official source.`,
    );

    if (unreachableCount > 0) {
        console.log(
            "\nFor unreachable sources, find the game's current official docs, re-verify the settings in the matching data/game-configs/ file by hand, and update sourceUrl in lib/config-templates.ts.",
        );
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
