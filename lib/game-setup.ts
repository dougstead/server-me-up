// How to actually obtain each game's dedicated-server files and get them
// running. Required ports come from lib/games.ts (already verified there);
// this file only covers "where do I get the files" and "how do I start it".
//
// SteamCMD app IDs are verified against multiple independent sources.
// Exact executable names are given where well-established; where a game's
// launch flags are non-trivial or not independently confirmed here, this
// points to the official/wiki source instead of guessing at exact syntax.

export type GameSetupMethod =
  | {
      type: "steamcmd";
      appId: number;
      installDirExample: string;
      // Only set when the game's actively-played/recommended version lives
      // on a non-default Steam branch (e.g. The Isle's Evrima branch) --
      // omitting this when one is required would make the copy-pasteable
      // app_update command in the setup guide silently install the wrong
      // branch.
      betaBranch?: string;
    }
  | {
      type: "direct-download";
      url: string;
      urlLabel: string;
    };

// The literal command line to run from inside the install directory, per
// platform -- shown in the setup guide as its own copy-pasteable code
// block, separate from startNotes. Left undefined for a platform when no
// exact, independently-confirmed command is available -- guessing wrong
// here is worse than omitting it and pointing to the official guide
// instead (see startNotes/officialGuideUrl for those cases).
export type StartCommand = {
  windows?: string;
  linux?: string;
};

// A single fact worth calling out on its own -- used for both "things to
// know before you host" (performance/scaling behaviour, save-file growth,
// etc.) and game-specific troubleshooting entries. Kept as the same shape
// for both since they're rendered the same way (title + explanation);
// they're two separate arrays below only so a page can label/order them
// differently, not because the data itself needs to differ.
export type GameNote = {
  title: string;
  text: string;
};

export type GameSetup = {
  gameId: string;
  method: GameSetupMethod;
  startCommand?: StartCommand;
  startNotes: string;
  officialGuideUrl?: string;
  officialGuideLabel?: string;

  // Extra detail on the install directory's internal structure, beyond the
  // example path already in `method.installDirExample` -- e.g. "the actual
  // binary lives under ShooterGame\Binaries\Win64, not the install root".
  // Omit when startNotes already covers this clearly enough to not repeat it.
  installDirNotes?: string;

  // Where the main server config file ends up once generated, and what it
  // covers. Deliberately separate from the config generator (which some
  // games don't have) -- this documents the real on-disk file even for
  // games this site doesn't (yet) generate a config for.
  configFileLocation?: {
    path: string;
    description: string;
  };

  // Performance/behaviour facts specific to this game -- how RAM or CPU
  // load actually scales with player count, save-file/world growth over a
  // long-running server, engine-specific quirks. Every entry here should be
  // something independently verifiable (official docs, the developer's own
  // performance guidance, or well-established, consistent community
  // reporting), not a guess at how a game "probably" behaves.
  considerations?: GameNote[];

  // Problems specific to *this* game, as opposed to the generic
  // connectivity issues already covered on /troubleshooting (firewall,
  // port forwarding, CGNAT, etc.) -- e.g. a game requiring a server name
  // rather than a raw IP for console players to find it in-browser.
  commonIssues?: GameNote[];
};

export const gameSetups: Record<string, GameSetup> = {
  minecraft: {
    gameId: "minecraft",
    method: {
      type: "direct-download",
      url: "https://www.minecraft.net/en-us/download/server",
      urlLabel: "minecraft.net/download/server",
    },
    startCommand: {
      windows: 'java -Xmx4G -Xms2G -jar server.jar nogui',
      linux: 'java -Xmx4G -Xms2G -jar server.jar nogui',
    },
    startNotes:
      "Place the downloaded server.jar in its own folder, then run it once so it generates eula.txt -- open that file and change eula=false to eula=true. Then start it with the command below, adjusting -Xmx to the RAM you want to allocate. You need a Java runtime that matches the server version installed first.",
    configFileLocation: {
      path: "server.properties, in the same folder as server.jar",
      description:
        "Generated the first time the server runs. Covers the MOTD, difficulty, gamemode, whitelist, view/simulation distance and more -- restart the server after editing it by hand.",
    },
    considerations: [
      {
        title: "RAM tracks explored chunks, not just player count",
        text: "Memory use is driven by how many chunks are loaded at once -- a function of player count together with view-distance and simulation-distance -- rather than player count on its own. Twelve players spread across a large, well-explored world can use noticeably more RAM than twelve players clustered near spawn. Roughly 3-4 GB covers a small vanilla server; a 10-20 player survival server with a handful of plugins is typically comfortable at 6-8 GB.",
      },
      {
        title: "simulation-distance is the single biggest performance lever",
        text: "In server.properties, simulation-distance controls how many chunks actively run game logic (entities, crop growth, redstone, hoppers) even when no player is standing there, while view-distance only controls how far terrain renders. Dropping simulation-distance from the default of 10 to 4-6 is usually the largest tick-time improvement available on a busy server, with most players never noticing the difference.",
      },
      {
        title: "World size only grows, even after players stop exploring",
        text: "Chunks written to disk are never reclaimed automatically as the map gets explored -- a years-old, heavily-explored survival world routinely reaches tens of GB, well past the ~10 GB a fresh world needs. Budget storage for where the world will end up, not where it starts.",
      },
      {
        title: "More allocated RAM isn't automatically better",
        text: "Setting -Xmx far higher than the server actually needs can hurt performance rather than help it, since Java's garbage collector has more heap to scan and that shows up as periodic freezes. A useful target is roughly double the server's typical actual usage, not \"as much as the machine has\".",
      },
    ],
    commonIssues: [
      {
        title: "\"Can't keep up! Is the server overloaded?\" in the console",
        text: "The server missed its 20-ticks-per-second target (each tick has a 50ms budget). The most common causes, in order, are simulation-distance set too high for the hardware, a plugin doing expensive work every tick, and slow disk I/O during autosave -- rarely a lack of RAM by itself.",
      },
      {
        title: "\"Failed to verify username\" when players try to join",
        text: "With online-mode=true (the default), the server needs outbound HTTPS access to Mojang's session servers to verify each login -- a restrictive firewall or DNS blocking that traffic produces this exact error. It also appears if a player is using a non-purchased (\"cracked\") client against an online-mode server, which online-mode is specifically there to prevent.",
      },
    ],
  },

  "minecraft-bedrock": {
    gameId: "minecraft-bedrock",
    method: {
      type: "direct-download",
      url: "https://www.minecraft.net/en-us/download/server/bedrock",
      urlLabel: "minecraft.net/download/server/bedrock",
    },
    startCommand: {
      windows: "bedrock_server.exe",
      linux: "chmod +x bedrock_server && ./bedrock_server",
    },
    startNotes:
      "Extract the downloaded zip into its own folder, then run the command below. Edit server.properties in the same folder to configure the world name, port and other settings before starting it.",
    configFileLocation: {
      path: "server.properties, in the same folder as bedrock_server",
      description:
        "Covers the world name, gamemode, difficulty, allow-cheats and max players. Restart the server after editing it -- it's only read on startup.",
    },
    considerations: [
      {
        title: "Noticeably lighter on RAM than Java Edition",
        text: "Bedrock's server is written in C++ rather than running on a Java Virtual Machine, so it doesn't need a JVM heap allocated the way Java Edition does. A Bedrock server can comfortably handle 10-20 players on around 2 GB of RAM, where a Java server at the same player count typically needs 3-4 GB.",
      },
      {
        title: "Behaviour packs and add-ons can push RAM usage up substantially",
        text: "A small vanilla server for a handful of players is fine on 2 GB, but servers running behaviour packs, the Script API, or several add-ons commonly need 4-6 GB, and a busy 15+ player server with heavy add-ons can need 4-8 GB plus a stronger CPU.",
      },
    ],
    commonIssues: [
      {
        title: "Xbox, PlayStation or Switch players can't enter your server's IP address",
        text: "Consoles have no built-in way to type a custom server address -- the official server list is the only option normally shown. Getting a console onto a self-hosted Bedrock server usually requires a third-party tool like BedrockConnect, set up by pointing the console's network DNS settings at BedrockConnect's DNS server, which then lets you select \"Add Server\" from a menu inside the game.",
      },
      {
        title: "Java Edition players can't join a Bedrock server (or vice versa)",
        text: "Java and Bedrock are different games under the hood and don't connect to each other natively, regardless of version. The common workaround is hosting a Java server instead and adding the Geyser plugin (plus Floodgate for console players), which lets Bedrock players connect to a Java server -- there's no equivalent path to add Java support to a Bedrock server.",
      },
    ],
  },

  "ark-survival-evolved": {
    gameId: "ark-survival-evolved",
    method: {
      type: "steamcmd",
      appId: 376030,
      installDirExample: "C:\\GameServers\\ARK",
    },
    startCommand: {
      windows: 'ShooterGameServer.exe "TheIsland?listen?SessionName=MyServer?ServerPassword=changeme"',
      linux: './ShooterGameServer "TheIsland?listen?SessionName=MyServer?ServerPassword=changeme"',
    },
    startNotes:
      "Run this from ShooterGame\\Binaries\\Win64 (Windows) or ShooterGame/Binaries/Linux (Linux) inside the install directory. Full launch-option syntax, including all supported maps and flags, is on the official wiki linked below.",
    officialGuideUrl: "https://ark.wiki.gg/wiki/Dedicated_server_setup",
    officialGuideLabel: "ARK Official Community Wiki",
    installDirNotes:
      "The actual server executable lives under ShooterGame\\Binaries\\Win64 (or ShooterGame/Binaries/Linux) inside the install directory, not the install root itself.",
    configFileLocation: {
      path: "ShooterGame\\Saved\\Config\\WindowsServer\\GameUserSettings.ini (and Game.ini for advanced rules)",
      description:
        "Created after the server has been run at least once. Most server-identity and rate settings live in GameUserSettings.ini; per-creature/engram overrides go in the separate Game.ini.",
    },
    considerations: [
      {
        title: "RAM use climbs with tribes and tames, not just players online",
        text: "ARK is unusually memory-hungry because everything built or tamed stays simulated in the world persistently, whether its owner is online or not. Community guidance is to start around 8 GB for a small map, expect to be comfortable at 12 GB, and budget 16 GB+ once a server has an active, long-running population of tribes and tamed creatures.",
      },
      {
        title: "Large save files slow down both startup and world-save pauses",
        text: "A save file at or above roughly 1 GiB (common on an older, heavily-built server) noticeably lengthens both server startup time and the brief hitch every world-autosave causes -- this is a normal consequence of a long-lived, active server rather than a misconfiguration.",
      },
      {
        title: "Ungraceful shutdowns can corrupt the save",
        text: "Killing the server process (rather than letting it shut down cleanly) risks save corruption, particularly on a large map. Keep same-day backups of the Saved directory as routine practice, not just as disaster recovery -- restoring a corrupted save otherwise means losing everything since the last backup.",
      },
    ],
    commonIssues: [
      {
        title: "\"Join Session Failed\" or a mod mismatch error",
        text: "Almost always a mod version mismatch: Steam Workshop mods update automatically on players' clients but not on the server, which updates separately. Reinstalling the server's copy of each mod (or deleting and letting it redownload) resolves a version drift.",
      },
      {
        title: "Cross-ARK transfers work for some players but not others on the same network",
        text: "If the router doesn't support NAT loopback/hairpinning, transfers (and sometimes direct connections) fail specifically for players on the same local network as the server, while everyone connecting from outside works fine -- this is a router limitation, not a server misconfiguration.",
      },
    ],
  },

  rust: {
    gameId: "rust",
    method: {
      type: "steamcmd",
      appId: 258550,
      installDirExample: "C:\\GameServers\\Rust",
    },
    startCommand: {
      windows: 'RustDedicated.exe -server.port 28015 -server.identity "myserver" -server.level "Procedural Map"',
      linux: './RustDedicated -server.port 28015 -server.identity "myserver" -server.level "Procedural Map"',
    },
    startNotes:
      "Run this from the install directory, adjusting the flags for your server name, map seed/size and ports.",
    configFileLocation: {
      path: "server/<identity>/cfg/server.cfg, created under the install directory",
      description:
        "Executed automatically on startup, matching the -server.identity name in the launch command. Console convars set here (or live via RCON) persist across restarts.",
    },
    considerations: [
      {
        title: "One CPU core's clock speed matters more than core count",
        text: "Rust's server simulation loop is bound to a small number of threads, so raw single-core clock speed -- not total core count -- is what determines server FPS (the server's own internal tick rate, separate from player FPS). Server FPS below roughly 15 indicates the CPU is the bottleneck; 30+ is a reasonable target for a stable server.",
      },
      {
        title: "Performance degrades over a wipe cycle, not just with player count",
        text: "Every structure and deployable placed on the map becomes a persistent entity the single-threaded simulation has to track. A server that runs smoothly on day one of a wipe can slow down noticeably by the end of the cycle purely from accumulated base sprawl and entity count, independent of how many players are currently online.",
      },
      {
        title: "Map size trades world variety for entity count",
        text: "server.worldsize (1000-6000) directly affects how many resource nodes, monuments and procedurally-placed entities exist -- a 3500-size map generates meaningfully fewer entities than a 4000+ map at the same settings, which is one of the more effective performance levers before touching hardware.",
      },
    ],
    commonIssues: [
      {
        title: "Players report rubber-banding or delayed hits during busy fights",
        text: "This is usually the single-thread CPU bottleneck showing up under load (see above) rather than a networking problem -- check server FPS via the F1 console (\"perf\" or server owner tools) before assuming it's bandwidth or ping-related.",
      },
      {
        title: "Map regenerates differently after a server restart",
        text: "The same server.seed and server.worldsize combination always generates the same map, but changing either one (even slightly) produces a completely different layout -- if the map looks wrong after an update, check nothing altered those two convars, intentionally or via a config reset.",
      },
    ],
  },

  hytale: {
    gameId: "hytale",
    method: {
      type: "direct-download",
      url: "https://support.hytale.com/hc/en-us/articles/45326769420827-Hytale-Server-Manual",
      urlLabel: "Hytale Server Manual",
    },
    startCommand: {
      windows: "java -jar HytaleServer.jar",
      linux: "java -jar HytaleServer.jar",
    },
    startNotes:
      "The server (HytaleServer.jar) can be copied out of your Hytale launcher's install folder, or fetched with Hypixel Studios' official CLI downloader tool for easier updates. Requires JDK 25 installed. Hytale launched in Early Access in January 2026, so check the official manual for the latest steps.",
    configFileLocation: {
      path: "config.json, at the root of the server folder",
      description:
        "Covers server name, MOTD, password, max players and view radius. Restart the server after editing it.",
    },
    considerations: [
      {
        title: "View distance is the single biggest performance lever",
        text: "The relationship between view distance and server load is exponential, not linear -- doubling the view distance roughly quadruples the amount of world that has to stay loaded and simulated at once, so a modest reduction here has an outsized effect on performance compared to most other settings.",
      },
      {
        title: "RAM scales roughly by player count",
        text: "As a rough guide, 4 GB covers a small group of up to around 4 players, adding roughly 1 GB per additional player, with medium friend groups (10-15 players) needing 6-8 GB and larger communities needing more still. Since Hytale is still in Early Access, treat these as a starting point rather than a fixed rule -- performance characteristics are likely to shift as the game is patched.",
      },
      {
        title: "Being Early Access, expect updates and the occasional crash",
        text: "Hytale entered Early Access in January 2026, so bugs, crashes and frequent updates are expected as normal parts of running a server right now, not necessarily a misconfiguration on your end. Regular backups are worth treating as routine rather than optional while the game stabilises.",
      },
    ],
  },

  starbound: {
    gameId: "starbound",
    method: {
      type: "steamcmd",
      appId: 211820,
      installDirExample: "C:\\GameServers\\Starbound",
    },
    startCommand: {
      windows: "win64\\starbound_server.exe",
      linux: "./linux/starbound_server",
    },
    startNotes:
      "Run this from the install directory -- the dedicated server binary ships inside the regular game install. You'll need a Steam account that owns Starbound to download it via SteamCMD.",
    configFileLocation: {
      path: "storage/starbound_server.config, in the install directory",
      description:
        "Covers server name, port, password and whether anonymous connections are allowed. Restart the server after editing it.",
    },
    considerations: [
      {
        title: "One of the lighter games this site covers",
        text: "2 GB of RAM comfortably fits a vanilla server for around 4 players, 4-6 GB handles a vanilla server at 12-16 slots, and 8 GB+ is comfortable even for a large modded server -- Starbound is noticeably less resource-hungry than most other survival-crafting titles here.",
      },
      {
        title: "Heavy overhaul mods increase memory needs substantially",
        text: "Large content mods (Frackin' Universe is the best-known example) roughly triple the memory needed just to load assets compared to vanilla -- budget at least 4 GB for a server running a major overhaul mod, and 8 GB or more once several additional mods are stacked on top of it.",
      },
    ],
    commonIssues: [
      {
        title: "Players can connect but see invisible walls, missing blocks, or can't pick up items",
        text: "This is a mod mismatch, not a bug -- if the server's allowAssetsMismatch setting is enabled, players with different mods than the server can still connect, but anything from a mod they're missing (blocks, items, assets) won't render or function correctly for them. Publishing the server's exact mod list somewhere players can see before joining (Discord, the server's own page) avoids this confusion entirely.",
      },
    ],
  },

  terraria: {
    gameId: "terraria",
    method: {
      type: "direct-download",
      url: "https://terraria.org/",
      urlLabel: "terraria.org (Dedicated Server link)",
    },
    startCommand: {
      windows: "TerrariaServer.exe -config serverconfig.txt",
      linux: "./TerrariaServer -config serverconfig.txt",
    },
    startNotes:
      "Extract the downloaded package first. Running it without -config opens an interactive console where you set the world, max players and port by hand instead.",
    configFileLocation: {
      path: "serverconfig.txt, in the install directory (referenced via -config)",
      description:
        "Covers the world file, size, difficulty, port, password and MOTD. If it's missing or points at the wrong world file, the server silently generates a brand-new world instead of loading the one you expected.",
    },
    considerations: [
      {
        title: "World size affects save size and generation time more than ongoing RAM use",
        text: "A small world runs comfortably on 2 GB of RAM and a medium world on 4 GB, while a large world needs around 6 GB -- but that figure mostly reflects the bigger map's baseline footprint. During actual play, a large world with many concurrent players simulating NPCs, projectiles and liquids across a wide area uses noticeably more than the same player count on a medium world.",
      },
      {
        title: "The simulation is single-threaded",
        text: "Like several other games this site covers, Terraria's server loop doesn't spread across multiple cores -- a high single-core clock speed helps far more than adding cores, especially with a large world and a full player count active at once.",
      },
    ],
    commonIssues: [
      {
        title: "Players spawn into an unfamiliar, freshly-generated world",
        text: "If the world path in serverconfig.txt (the world= line) doesn't point at the existing .wld file -- a typo, or a path that changed after moving the install -- TerrariaServer.exe generates a brand-new world rather than erroring, and everyone ends up in a different world than expected with no obvious warning that anything went wrong.",
      },
    ],
  },

  valheim: {
    gameId: "valheim",
    method: {
      type: "steamcmd",
      appId: 896660,
      installDirExample: "C:\\GameServers\\Valheim",
    },
    startCommand: {
      windows: 'valheim_server.exe -name "My Server" -port 2456 -world "Dedicated" -password "changeme"',
      linux: './valheim_server.x86_64 -name "My Server" -port 2456 -world "Dedicated" -password "changeme"',
    },
    startNotes:
      "Run this from the install directory, adjusting the name, world and password for your server.",
    configFileLocation: {
      path: "Launch flags only -- there's no separate settings file",
      description:
        "Valheim's dedicated server is entirely configured through the command-line flags in the start command above (name, world, port, password); there's no server.cfg or .ini to edit afterwards.",
    },
    considerations: [
      {
        title: "Crossplay adds real overhead, not just a compatibility toggle",
        text: "A crossplay-enabled server uses PlayFab networking instead of plain Steam networking so Xbox and Microsoft Store players can join, and that extra layer costs roughly 1-2 GB more RAM than a Steam-only server with the same player count. If every player is on Steam/PC, leaving crossplay off is both simpler and lighter.",
      },
      {
        title: "World file size grows with building and terraforming, not just playtime",
        text: "The save file grows steadily as players terraform land and build large bases -- a year-old, heavily-modified world can be substantially bigger than a fresh one. A large enough save can also cause a brief stutter every autosave (roughly every 20 minutes) simply because there's more data to write each time; very large bases (5,000+ build pieces) are the most common trigger.",
      },
      {
        title: "6-8 GB is the practical sweet spot for most groups",
        text: "For a typical vanilla or lightly-modded server of up to around 10 players, 6-8 GB of RAM comfortably covers normal play, active combat and reasonably large bases -- crossplay or heavy building-focused worlds are where it's worth planning for more.",
      },
    ],
    commonIssues: [
      {
        title: "Friends can connect over LAN or via Steam invite, but not by IP",
        text: "Valheim's dedicated server listens across a small port range, not a single port -- 2456-2458, UDP -- and all three need to be forwarded/allowed, not just the one given as -port. A firewall that's disabled locally but re-enabled (or a router only forwarding the single -port number) is a common cause of \"works for me, not for them\".",
      },
      {
        title: "Xbox, PlayStation or Game Pass players can't find the server",
        text: "Console and Game Pass players can only join if crossplay is enabled server-side -- it isn't something a joining player can turn on from their end, and there's no way for them to connect to a Steam-only server regardless of the IP or password.",
      },
    ],
  },

  "arma-3": {
    gameId: "arma-3",
    method: {
      type: "steamcmd",
      appId: 233780,
      installDirExample: "C:\\GameServers\\Arma3",
    },
    startCommand: {
      windows: "arma3server_x64.exe -config=server.cfg -profiles=profiles",
      linux: "./arma3server_x64 -config=server.cfg -profiles=profiles",
    },
    startNotes:
      "Arma 3's dedicated server download requires a Steam account that owns the game -- anonymous SteamCMD login won't work here.",
    officialGuideUrl: "https://community.bistudio.com/wiki/Arma_3:_Dedicated_Server",
    officialGuideLabel: "Bohemia Interactive Community wiki",
    configFileLocation: {
      path: "server.cfg, in the install directory (referenced via -config=)",
      description:
        "Covers the server name, passwords, max players and voting rules. Mission-specific settings (map, difficulty) are set separately through the mission itself or a mission-selection addon.",
    },
    considerations: [
      {
        title: "AI unit count is capped by one CPU core, not by hardware overall",
        text: "Every AI-controlled unit in a mission is processed on a single thread inside the server, regardless of how many cores or how much RAM the machine has -- so a mission with a large number of AI simply won't scale by throwing more hardware at it in the usual sense. A high per-core clock speed matters far more here than core count.",
      },
      {
        title: "Headless clients are the standard fix for AI-heavy missions",
        text: "A headless client is a second copy of the server software, running with no graphics, whose entire job is to take over simulating a portion of the mission's AI so the main server thread isn't doing all of it alone. For missions with large numbers of AI units, this is the officially-supported way to scale beyond what a single server process can handle -- extra cores mainly help here by giving each headless client its own thread to run on.",
      },
      {
        title: "Persistent battlefield debris adds up over a long mission",
        text: "Wrecks, craters and rubble left behind by a long-running mission accumulate and continue costing performance until they're cleaned up (many missions do this automatically after a delay) -- a server that ran smoothly at mission start can slow down hours in purely from battlefield clutter, separate from anything to do with player or AI count at that moment.",
      },
    ],
  },

  "team-fortress-2": {
    gameId: "team-fortress-2",
    method: {
      type: "steamcmd",
      appId: 232250,
      installDirExample: "C:\\GameServers\\TF2",
    },
    startCommand: {
      windows: "srcds.exe -console -game tf +map cp_dustbowl +maxplayers 24",
      linux: "./srcds_run -game tf +map cp_dustbowl +maxplayers 24",
    },
    startNotes:
      "Run this from the install directory, adjusting the map and player count.",
    configFileLocation: {
      path: "tf/cfg/server.cfg, in the install directory",
      description:
        "Executed automatically on startup from tf/cfg. The player-slot count is set with the -maxplayers launch flag shown above, not in this file.",
    },
    considerations: [
      {
        title: "One of the lightest games this site covers to host",
        text: "TF2's Source engine server is comparatively undemanding -- 2 GB of RAM is typically enough even for a full 24-player server -- with single-core CPU speed still mattering more than core count for tick-rate stability under load, same as other Source-engine titles.",
      },
    ],
    commonIssues: [
      {
        title: "Players with custom HUDs or reskins get kicked or blocked from connecting",
        text: "sv_pure enforces file integrity against the server's whitelist, and TF2 has an unusually large community of custom HUDs and cosmetic reskins -- a strict sv_pure 1 (or 2) setting can reject legitimate customization that isn't gameplay-affecting. Community servers commonly relax this with a pure_server_whitelist.txt that explicitly allows cosmetic files while still blocking gameplay-affecting cheats.",
      },
    ],
  },

  bannerlord: {
    gameId: "bannerlord",
    method: {
      type: "steamcmd",
      appId: 1863440,
      installDirExample: "C:\\GameServers\\Bannerlord",
    },
    startNotes:
      "The dedicated-server tool includes its own launcher for configuring modules, scene and player options before starting the server process -- there's no single command line to copy, since the launcher walks you through it.",
    officialGuideUrl: "https://moddocs.bannerlord.com/multiplayer/hosting_server/",
    officialGuideLabel: "Bannerlord modding documentation",
    configFileLocation: {
      path: "ds_config.txt, in the install directory",
      description:
        "A plain-text list of console commands run in order at startup, generated/edited via the dedicated-server launcher. Covers server name, admin password and game type.",
    },
    considerations: [
      {
        title: "The game engine has known RAM growth over long uptimes",
        text: "Bannerlord's engine has documented memory-usage growth the longer a session runs, on both client and dedicated server -- if a long-running server gradually uses more RAM over hours rather than staying flat, that's a widely-reported engine behaviour rather than something specific to your setup. Scheduling a periodic restart (e.g. once every 12-24 hours) is the common mitigation.",
      },
    ],
    commonIssues: [
      {
        title: "\"Module mismatch\" when a player tries to join",
        text: "This means the connecting player has a different set of installed modules (or module versions) than the server is running -- not a corrupted save, and not the same thing as a version mismatch on the base game itself. Make sure any modules the server loads are also installed, and on the same version, on the client side.",
      },
    ],
  },

  "garrys-mod": {
    gameId: "garrys-mod",
    method: {
      type: "steamcmd",
      appId: 4020,
      installDirExample: "C:\\GameServers\\GMod",
    },
    startCommand: {
      windows: "srcds.exe -game garrysmod +gamemode sandbox +map gm_construct +maxplayers 16",
      linux: "./srcds_run -game garrysmod +gamemode sandbox +map gm_construct +maxplayers 16",
    },
    startNotes:
      "You'll also need a Game Server Login Token (GSLT) from Steam for the server to appear in the public server browser.",
    officialGuideUrl: "https://wiki.facepunch.com/gmod/Downloading_a_Dedicated_Server",
    officialGuideLabel: "Garry's Mod Wiki",
    configFileLocation: {
      path: "garrysmod/cfg/server.cfg, in the install directory",
      description:
        "Executed automatically on startup. The active gamemode is chosen with the +gamemode launch flag shown above, not in this file.",
    },
    considerations: [
      {
        title: "RAM depends far more on the gamemode than on player count",
        text: "Plain Sandbox is light on resources, but heavily-scripted gamemodes (DarkRP and similar) run substantially more Lua logic per tick, and each Workshop addon adds its own ongoing overhead -- a 16-player DarkRP server with a large addon list can need noticeably more RAM than a 24-player vanilla Sandbox server.",
      },
    ],
    commonIssues: [
      {
        title: "Players don't download the server's Workshop addons",
        text: "Workshop delivery needs a GSLT set via +sv_setsteamaccount in the launch command -- without it, the server can't authenticate to the Workshop CDN and addons silently fail to serve to clients, typically showing \"Failed to get Workshop addon info\" in the console on boot. The Workshop collection itself also has to be set to Public or Unlisted; a Private collection can't be read by the server at all.",
      },
    ],
  },

  palworld: {
    gameId: "palworld",
    method: {
      type: "steamcmd",
      appId: 2394010,
      installDirExample: "C:\\GameServers\\Palworld",
    },
    startCommand: {
      windows: "PalServer.exe",
      linux: "./PalServer.sh",
    },
    startNotes:
      "Run this from the install directory. Server settings (name, password, difficulty and more) are configured in PalWorldSettings.ini -- see the Palworld config generator on this site to produce one.",
    configFileLocation: {
      path: "Pal\\Saved\\Config\\WindowsServer\\PalWorldSettings.ini",
      description:
        "Generated the first time the server runs. Every setting is packed onto a single OptionSettings=(...) line -- a stray line break or misplaced comma stops the whole file from loading, so edit it carefully or regenerate it with the config generator instead.",
    },
    considerations: [
      {
        title: "RAM and CPU load scale with base building and tamed Pals, not just players",
        text: "Like other persistent survival-crafting servers, ongoing load comes from everything built and tamed staying simulated, not just from who's currently connected -- a server with a handful of active bases and large Pal populations needs meaningfully more headroom than an empty world with the same player count.",
      },
    ],
    commonIssues: [
      {
        title: "Xbox, PS5 or Game Pass players can't connect using your server's IP address",
        text: "Console and Microsoft Store/Game Pass PC players have no way to enter an IP address at all -- they can only browse and join from Palworld's in-game Community Servers list. If your server isn't registered there, those players simply can't find it, regardless of how correctly port forwarding is set up. Launching with the -publiclobby flag (or the equivalent \"list publicly\" setting) registers it on that list; PC players connecting by IP directly are unaffected either way.",
      },
    ],
  },

  "project-zomboid": {
    gameId: "project-zomboid",
    method: {
      type: "steamcmd",
      appId: 380870,
      installDirExample: "C:\\GameServers\\ProjectZomboid",
    },
    startCommand: {
      windows: "StartServer64.bat",
      linux: "./start-server.sh",
    },
    startNotes:
      "Run this from the install directory. On first run it generates config files under your user profile (Zomboid/Server) where you set the server name, password and world options.",
    configFileLocation: {
      path: "Zomboid/Server/servertest.ini, under your user profile",
      description:
        "Named after whatever server name you first launched with, not always literally \"servertest\". Covers the server name, password, PvP and public visibility -- stop the server before editing it by hand.",
    },
    considerations: [
      {
        title: "Zombie population is one of the biggest RAM levers you control",
        text: "Higher zombie population settings (Insane, or a custom high multiplier) mean the server has to actively track far more entities at once -- dropping population from Insane down to Normal can save 1-2 GB of RAM on its own, independent of anything else about the server.",
      },
      {
        title: "RAM needs scale with both player count and mods",
        text: "As a rough baseline, 4-5 GB is a practical starting point for a small-to-medium server (up to around 10 players) with light or no mods. Larger player counts (10-20) or a heavily-modded server push that up to 6-8 GB or more.",
      },
    ],
    commonIssues: [
      {
        title: "The server keeps restarting in a loop right after starting",
        text: "This is almost always a corrupted world save, most often caused by the server being force-stopped (rather than shut down cleanly) while it was in the middle of saving map data, or by it running out of memory and crashing mid-save. Regular backups of both the Saves and Server folders -- especially before adding new mods -- make this recoverable instead of a total loss.",
      },
    ],
  },

  eco: {
    gameId: "eco",
    method: {
      type: "steamcmd",
      appId: 739590,
      installDirExample: "C:\\GameServers\\Eco",
    },
    startCommand: {
      windows: "EcoServer.exe",
      linux: "./EcoServer.sh",
    },
    startNotes:
      "The dedicated-server tool (Steam app 739590) is a separate download from the Eco client. Run this from the install directory; server settings live in the Configs folder generated on first run.",
    configFileLocation: {
      path: "Configs/Network.eco, in the install directory",
      description:
        "Generated on first run. Covers server name, password, public visibility and connection ports -- world simulation settings live in separate config files alongside it.",
    },
    considerations: [
      {
        title: "Eco simulates its whole world continuously, not just around players",
        text: "Unlike most survival games, Eco keeps running a full ecosystem simulation the entire time the server is up -- plant growth, animal populations, pollution spreading, groundwater and temperature all update continuously across the whole map, whether or not anyone is nearby to see it. This is the main reason Eco needs more server headroom than its player count alone would suggest.",
      },
      {
        title: "That simulation runs mostly on a single core",
        text: "Because the world simulation isn't spread evenly across all available cores, a high per-core clock speed generally outperforms a machine with more cores at a lower clock. As active players increase, server-side automation and physics work add further load on top of the baseline simulation cost.",
      },
      {
        title: "RAM needs scale with world size and player count together",
        text: "4-8 GB is the typical range depending on world size and player count, with 8 GB or more recommended once a server regularly has 30+ players, since more players means more of the ecosystem is being actively affected (built on, farmed, polluted) at once.",
      },
    ],
  },

  dragonwilds: {
    gameId: "dragonwilds",
    method: {
      type: "steamcmd",
      appId: 4019830,
      installDirExample: "C:\\GameServers\\Dragonwilds",
    },
    startNotes:
      "The dedicated-server tool (Steam app 4019830, free) is a separate download from the game client. It supports anonymous SteamCMD login, so no Steam account is required to download it. Jagex publishes platform-specific startup steps -- including the exact command -- on the official wiki, linked below.",
    officialGuideUrl: "https://dragonwilds.runescape.wiki/w/Dedicated_Servers",
    officialGuideLabel: "RuneScape: Dragonwilds Wiki",
    considerations: [
      {
        title: "RAM scales with roughly 1 GB per connected player, plus a base amount",
        text: "A common baseline is around 2 GB for the server itself, plus roughly 1 GB per connected player -- a full 6-player server should have around 8 GB available. Runs on Unreal Engine 5, so a high single-core CPU clock speed and NVMe storage matter as much as raw RAM once bases and builds grow larger.",
      },
      {
        title: "How progressed the world is matters as much as player count",
        text: "Dragonwilds layers RuneScape-style skilling progression on top of the usual survival-crafting loop, so server load depends on three things together: player count, how built-up the world is, and how many skills/inventory systems are actively being tracked per character. A small group that's fully explored the map and levelled several skills can load the server more heavily than a larger group still early on.",
      },
      {
        title: "Keep RAM usage comfortably below the limit, not right up against it",
        text: "A server consistently sitting at 90-95% of its allocated RAM won't necessarily crash, but it does cause slower chunk loading, delayed NPC responses and occasional save stutters. Staying under roughly 80% in normal play leaves headroom for spikes during combat or when several players explore new areas at once.",
      },
    ],
    commonIssues: [
      {
        title: "The server disappears from the in-game list after an update",
        text: "Dragonwilds is still under active development, and a game update or hotfix can leave the server running an older version than the client expects -- check the server's own logs to confirm its version actually matches the current game version, and update it if not.",
      },
    ],
  },

  "7-days-to-die": {
    gameId: "7-days-to-die",
    method: {
      type: "steamcmd",
      appId: 294420,
      installDirExample: "C:\\GameServers\\7DaysToDie",
    },
    startCommand: {
      windows: "7DaysToDieServer.exe -configfile=serverconfig.xml",
      linux: "./7DaysToDieServer.x86_64 -configfile=serverconfig.xml",
    },
    startNotes:
      "Run this from the install directory. -configfile points at your server config file, which controls the world, name, password and slots.",
    configFileLocation: {
      path: "serverconfig.xml, in the install directory (referenced via -configfile=)",
      description:
        "Covers world generation, name, password, difficulty and slot count. Edit it directly, or use this site's 7 Days to Die config generator.",
    },
    considerations: [
      {
        title: "The server engine leans on one core, especially during horde night",
        text: "Pathfinding, chunk loading and world simulation run mostly on a single thread, so a high-clock CPU matters more than core count. Every 7th in-game day, a blood-moon horde spawns dozens of zombies at once and runs pathfinding for all of them simultaneously -- this is the single heaviest recurring CPU spike on a 7 Days to Die server, and where a marginal CPU is most likely to show visible lag.",
      },
      {
        title: "RAM needs vary a lot between vanilla and modded/crossplay play",
        text: "A small vanilla server on the default map size runs comfortably on 4-6 GB. Larger player counts, a bigger map, or especially a heavily-modded server (overhaul mods like Darkness Falls or Undead Legacy, or crossplay support) push that up substantially -- 16-24 GB is a reasonable target for a modded server, with 32 GB for a large crossplay-enabled one.",
      },
      {
        title: "Save size grows steadily, not just with playtime",
        text: "A fresh world's save data starts small, but region files, backups and player data accumulate over a server's lifetime -- saves commonly reach 2-5 GB and can exceed 10 GB on a long-running, heavily-explored world. Budget storage for where the save will end up, not its size on day one.",
      },
    ],
    commonIssues: [
      {
        title: "Players are kicked immediately with an EAC-related error",
        text: "7 Days to Die's EasyAntiCheat integration needs to be in the same state (enabled or disabled) on both the server and the connecting client -- a mismatch is one of the most common reasons a specific player can't join while everyone else can. EAC is configured via the EACServer setting in serverconfig.xml.",
      },
    ],
  },

  "ark-survival-ascended": {
    gameId: "ark-survival-ascended",
    method: {
      type: "steamcmd",
      appId: 2430930,
      installDirExample: "C:\\GameServers\\ARKAscended",
    },
    startCommand: {
      windows: 'ArkAscendedServer.exe "TheIsland_WP?listen?SessionName=MyServer" -port=7777 -WinLiveMaxPlayers=50',
    },
    startNotes:
      "Run this from ShooterGame\\Binaries\\Win64 in the install directory -- there's no official Linux binary. Recent versions moved several options from the old ?Key=Value query string to new -Flag=Value command-line flags -- check the official wiki for the current syntax.",
    officialGuideUrl: "https://ark.wiki.gg/wiki/Dedicated_server_setup",
    officialGuideLabel: "ARK Official Community Wiki",
    installDirNotes:
      "The actual server executable lives under ShooterGame\\Binaries\\Win64 inside the install directory, not the install root itself.",
    configFileLocation: {
      path: "ShooterGame\\Saved\\Config\\WindowsServer\\GameUserSettings.ini (and Game.ini for advanced rules)",
      description:
        "Same structure as ARK: Survival Evolved -- created after the server has run once. Most identity/rate settings live in GameUserSettings.ini; per-creature/engram overrides go in the separate Game.ini.",
    },
    considerations: [
      {
        title: "Rebuilding on Unreal Engine 5 roughly doubled the hardware appetite",
        text: "Ascended needs noticeably more RAM and single-core CPU headroom than Survival Evolved did to hold the same stable tick rate with a full tribe roster. As a rough baseline, 16 GB covers a single map with 10 or fewer players; a multi-map cluster needs 12-18 GB per additional map on top of that.",
      },
      {
        title: "Mods add substantially to RAM use, not just download time",
        text: "Installed mods commonly add another 2-8 GB of RAM on top of the baseline above, depending on complexity -- a heavily-modded cluster is one of the more resource-hungry setups covered on this site, and hardware sized for a vanilla server often isn't enough once mods are added.",
      },
    ],
    commonIssues: [
      {
        title: "Mods fail to download, or the server starts without them",
        text: "Ascended installs mods via CurseForge rather than classic Steam Workshop, and that pipeline is less forgiving -- a failed mod download can leave the server running without the expected content instead of erroring clearly. After any mod-related update, check the server's startup log for download failures before assuming the mod itself is broken.",
      },
      {
        title: "Cluster transfers fail for players on the same network as the server",
        text: "A known issue prevents server-to-server transfers within a cluster when the connecting client is on the same local network as the server -- if transfers work for remote players but not for someone on-site, this is a widely-reported bug rather than a configuration mistake on your end.",
      },
    ],
  },

  "conan-exiles": {
    gameId: "conan-exiles",
    method: {
      type: "steamcmd",
      appId: 443030,
      installDirExample: "C:\\GameServers\\ConanExiles",
    },
    startCommand: {
      windows: "ConanSandboxServer.exe -log",
    },
    startNotes:
      "Run this from ConanSandbox\\Binaries\\Win64 in the install directory -- there's no official Linux build. Server settings live in ConanSandbox\\Saved\\Config\\WindowsServer\\ServerSettings.ini, generated after the first run.",
    officialGuideUrl: "https://www.conanexiles.com/dedicated-servers/",
    officialGuideLabel: "Conan Exiles official dedicated servers page",
    configFileLocation: {
      path: "ConanSandbox\\Saved\\Config\\WindowsServer\\ServerSettings.ini",
      description:
        "Generated after the server's first run. Covers server behaviour toggles (BattlEye, creative mode, AFK kick time and more) -- server name and PvE/PvP mode are set via launch parameters instead, not in this file.",
    },
    considerations: [
      {
        title: "CPU single-thread speed matters more than core count",
        text: "The server simulates AI, thralls, the Purge and building persistence on a thread that doesn't scale well across cores -- a fast single-core clock speed keeps things stable as base count, player count and mods grow, where extra cores mostly help you run more processes side by side rather than speeding up any one server.",
      },
      {
        title: "RAM needs roughly double on the newer Enhanced (UE5) build",
        text: "The original UE4 server is comfortable at 6-8 GB for a small vanilla group and 8-12 GB mid-size; the Enhanced Edition's Unreal Engine 5 rebuild runs roughly 30-50% heavier for the same population, so budget accordingly if hosting Enhanced rather than the classic build.",
      },
      {
        title: "Building decay keeps the world from filling up with abandoned bases",
        text: "Every structure has a decay timer that only counts down while its owning clan is fully offline, resetting to maximum the moment any clan member interacts with it. Disabling decay entirely is tempting on a small private server, but on any server that expects to gain and lose players over time it causes permanent world bloat, since nothing else removes abandoned builds.",
      },
    ],
    commonIssues: [
      {
        title: "game.db becomes corrupted after a crash or forced shutdown",
        text: "Conan Exiles' save database is vulnerable to corruption if the server process is killed rather than shut down cleanly (e.g. task-killed instead of stopped) -- keep regular backups of ConanSandbox\\Saved\\Databases\\game.db as routine practice, since a corrupted database with no recent backup usually means restarting the world.",
      },
    ],
  },

  "core-keeper": {
    gameId: "core-keeper",
    method: {
      type: "steamcmd",
      appId: 1963720,
      installDirExample: "C:\\GameServers\\CoreKeeper",
    },
    startCommand: {
      windows: "CoreKeeperServer.exe",
      linux: "./CoreKeeperServer.x86_64",
    },
    startNotes:
      "Run this from the install directory. Create a serverconfig.json file alongside it to set the world name, save folder and password -- port, password and IP can only be set via command-line flags, not the config file.",
    configFileLocation: {
      path: "ServerConfig.json, in the install directory",
      description:
        "Covers world name, save slot, world mode and seed. Password, IP and port are launch flags instead -- see the setup steps above.",
    },
    considerations: [
      {
        title: "RAM needs grow with world size, not just player count",
        text: "Core Keeper's world expands as players dig, and older, more-explored worlds use more memory to keep loaded -- 2-4 GB covers up to 4 players on a newer world, 6 GB is a reasonable target for 8 players, and 16 GB gives headroom for a busy 16-player server with a lot of dug-out map and automation.",
      },
    ],
    commonIssues: [
      {
        title: "The server's memory usage keeps climbing and never drops back down",
        text: "Players have reported RAM usage rising steadily over a server's uptime (jumping noticeably as players connect) and not falling back once they disconnect -- if a long-running server feels sluggish after several days without a restart, restarting the server process itself is a reasonable, known workaround rather than a sign of misconfiguration on your end.",
      },
    ],
  },

  "counter-strike-2": {
    gameId: "counter-strike-2",
    method: {
      type: "steamcmd",
      appId: 730,
      installDirExample: "C:\\GameServers\\CS2",
    },
    startCommand: {
      windows: "cs2.exe -dedicated +map de_dust2 +game_type 0 +game_mode 1",
      linux: "./cs2.sh -dedicated +map de_dust2 +game_type 0 +game_mode 1",
    },
    startNotes:
      "You'll also need a free Game Server Login Token (GSLT) from Valve for your server to be visible in the public server browser.",
    officialGuideUrl:
      "https://developer.valvesoftware.com/wiki/Counter-Strike_2/Dedicated_Servers",
    officialGuideLabel: "Valve Developer Community wiki",
    configFileLocation: {
      path: "game/csgo/cfg/server.cfg, in the install directory",
      description:
        "Executed automatically on startup. Like other Source-engine games, most day-to-day tuning is done live via RCON rather than by restarting to re-read the file.",
    },
    considerations: [
      {
        title: "Lightweight on RAM, but still single-core sensitive",
        text: "Source 2 dedicated servers are comparatively RAM-light -- 2-4 GB comfortably covers a normal server -- but the simulation still leans on single-core performance, so a high-clock CPU keeps tick rate stable under load (bots, plugins, or a full 10v10 lobby) even though total RAM demand stays modest.",
      },
    ],
    commonIssues: [
      {
        title: "A Workshop map times out or fails to load on startup",
        text: "Large Workshop maps can take several minutes to download the first time a server loads them -- what looks like a hung or crashed server immediately after adding +host_workshop_map is often just a slow first download. Double-check the Workshop map ID is correct, watch the console for download errors, and try a clean restart if it still doesn't load after a few minutes.",
      },
      {
        title: "GSLT gets revoked or the server won't authenticate",
        text: "A Game Server Login Token can be blocked by Valve if the account or server it's tied to racks up VAC bans or otherwise violates Valve's game-server policies -- if a previously-working token suddenly stops authenticating, check for that before assuming it's a config mistake, and generate a fresh token tied to this server specifically rather than reusing one from elsewhere.",
      },
    ],
  },

  "dayz-standalone": {
    gameId: "dayz-standalone",
    method: {
      type: "steamcmd",
      appId: 223350,
      installDirExample: "C:\\GameServers\\DayZ",
    },
    startCommand: {
      windows: "DayZServer_x64.exe -config=serverDZ.cfg -port=2302 -profiles=profiles",
      linux: "./DayZServer -config=serverDZ.cfg -port=2302 -profiles=profiles",
    },
    startNotes:
      "Run this from the install directory -- -profiles points at the folder where logs and settings are stored.",
    officialGuideUrl: "https://community.bistudio.com/wiki/DayZ:Server_Configuration",
    officialGuideLabel: "Bohemia Interactive Community wiki",
    configFileLocation: {
      path: "serverDZ.cfg, in the install directory (referenced via -config=)",
      description:
        "Covers server identity, passwords and player slots. Loot spawning and the wider Central Economy are configured separately, in mission-folder files like types.xml and cfgeconomycore.xml, not in serverDZ.cfg.",
    },
    considerations: [
      {
        title: "The game loop is single-threaded, same as several other survival titles",
        text: "DayZ's server simulation runs on one core no matter how many cores the machine has -- extra cores help with OS overhead, mods and network I/O, but a high-clock CPU is what actually raises the population and mod ceiling. Community guidance is roughly 8 GB RAM for 30 slots on Chernarus, 12-16 GB for 60 slots or a mod-heavy server, and 16-32 GB for a fully-modded community server (e.g. Expansion-style overhauls).",
      },
      {
        title: "Fast storage measurably affects restart and persistence speed",
        text: "DayZ writes persistence data to disk frequently, and slow storage turns a normal ~30-second restart into a multi-minute wait -- an NVMe SSD is worth prioritising over raw RAM once a server is mod-heavy or has a large player base.",
      },
      {
        title: "types.xml item counts affect performance more than mod count alone",
        text: "The Central Economy re-checks every item type it's tracking on a cycle -- a mod that adds a modest amount of script logic is usually lighter than one that adds thousands of new types.xml entries with high nominal (spawn count) values, since those add ongoing CPU work rather than a one-off cost.",
      },
    ],
    commonIssues: [
      {
        title: "Players with a specific mod get kicked by BattlEye on connect",
        text: "Every mod loaded via -mod= needs its .bikey file copied into the server's keys/ folder -- with verifySignatures set to require it, even one mod missing its key kicks every player running that mod, with no exceptions. This is the most common cause of \"works for some players, not others\" on a modded server.",
      },
      {
        title: "A mod works for the server owner but not for connecting players",
        text: "Server and clients need to be running the exact same version of every mod -- when a mod updates on the Steam Workshop, clients update automatically but the server-side copy doesn't, so a stale server-side mod version is the first thing to check after any mod-related connection failure.",
      },
    ],
  },

  "dont-starve-together": {
    gameId: "dont-starve-together",
    method: {
      type: "steamcmd",
      appId: 343050,
      installDirExample: "C:\\GameServers\\DoNotStarveTogether",
    },
    startCommand: {
      windows: "dontstarve_dedicated_server_nullrenderer_x64.exe -cluster MyServer -shard Master",
      linux: "./dontstarve_dedicated_server_nullrenderer -cluster MyServer -shard Master",
    },
    startNotes:
      "Run this from the install directory's bin folder, pointing -cluster and -shard at your cluster.ini and server.ini config files under your user's Klei save folder.",
    configFileLocation: {
      path: "<Klei folder>/<cluster name>/cluster.ini (plus Master/server.ini and Caves/server.ini per shard)",
      description:
        "cluster.ini covers cluster-wide identity and gameplay settings; each shard folder (Master, Caves) has its own server.ini for that shard's specific settings.",
    },
    considerations: [
      {
        title: "A standard world is two separate shards, each wanting its own CPU core",
        text: "A normal Don't Starve Together world is actually two linked server processes -- a Master shard (the surface) and a Caves shard -- each running its own single-threaded simulation. Giving each shard its own CPU core is important: if both are forced to share one core, performance roughly halves, and players commonly see a \"Server Not Responding\" message specifically when moving between the surface and the caves.",
      },
      {
        title: "Plan for roughly 1 GB of RAM per shard",
        text: "1 GB available per shard is enough for most setups, so a standard two-shard world (Master + Caves) wants around 2 GB total as a baseline -- more if the world has been running for a long time (several hundred in-game days) or has many mods, since both push RAM usage up further.",
      },
    ],
    commonIssues: [
      {
        title: "A mod works on the surface but not in the caves (or vice versa)",
        text: "Mods have to be enabled separately in each shard's own mod configuration -- enabling a mod for the Master shard doesn't automatically enable it for the Caves shard, and a mod that's supposed to affect both worlds needs to be turned on in both places individually.",
      },
    ],
  },

  enshrouded: {
    gameId: "enshrouded",
    method: {
      type: "steamcmd",
      appId: 2278520,
      installDirExample: "C:\\GameServers\\Enshrouded",
    },
    startCommand: {
      windows: "enshrouded_server.exe",
    },
    startNotes:
      "Run this directly (not via Steam's Launch button) -- the first run generates enshrouded_server.json in the same folder, which controls the server name, save location, slot count and query port.",
    officialGuideUrl:
      "https://enshrouded.zendesk.com/hc/en-us/articles/16051370691485-Dedicated-Server-Installation-on-Steam",
    officialGuideLabel: "Enshrouded official support site",
    configFileLocation: {
      path: "enshrouded_server.json, next to the server executable",
      description:
        "Generated on first run. Covers server identity, ports, slot count, difficulty preset and per-user-group passwords (Admin/Friend/Guest) -- restart the server after editing it, since it's only read at startup.",
    },
    considerations: [
      {
        title: "RAM tracks how much of the world has been explored, not just who's online",
        text: "Every chunk of terrain a player uncovers stays in memory for the life of the server process, so a fresh, mostly-unexplored world is light regardless of player count, while a heavily-explored, fully-built-up map with a full lobby uses substantially more. Dense building areas and Shroud zones (which spawn more entities) are heavier than open surface wilderness.",
      },
      {
        title: "Typical RAM needs by group size",
        text: "In an idle state the server process itself uses around 4-5 GB, plus roughly 100 MB per connected player on top of that baseline -- in practice, community guidance is around 6 GB for a duo, 8 GB as a safe minimum for a small group, and 16-24 GB for a full 16-player server with active building.",
      },
      {
        title: "Save files stay small even on a large server",
        text: "Despite the RAM usage above, the actual save file is modest -- typically 1-100 MB depending on how much has been built -- since it's world *exploration and RAM footprint* that scales heavily, not save-file size. Saves are written roughly every 5 minutes.",
      },
    ],
  },

  satisfactory: {
    gameId: "satisfactory",
    method: {
      type: "steamcmd",
      appId: 1690800,
      installDirExample: "C:\\GameServers\\Satisfactory",
    },
    startCommand: {
      windows: "FactoryServer.exe -log -unattended",
      linux: "./FactoryServer.sh -log -unattended",
    },
    startNotes:
      "Run this from the install directory, adding -Port=, -BeaconPort= and -ServerQueryPort= before -log if you need non-default ports. Server settings are configured afterwards through the in-game Server Manager.",
    officialGuideUrl: "https://satisfactory.wiki.gg/wiki/Dedicated_servers",
    officialGuideLabel: "Official Satisfactory Wiki",
    considerations: [
      {
        title: "RAM needs grow with the factory, not the player count",
        text: "A fresh save runs comfortably under 6 GB. A respectable mid-game factory typically needs 8-10 GB, and a late-game world with nuclear power, drones and a large building count can use 12 GB or more -- plan around how far the save has progressed, not how many people play on it.",
      },
      {
        title: "Autosaves need RAM headroom above the server's normal baseline",
        text: "Every autosave (every 300 seconds by default) serializes the entire world to disk, and needs roughly 2-4 GB of RAM above the server's normal usage while it does. Running near the RAM ceiling day-to-day means an autosave can push the server over the edge and crash it -- the fix is leaving real headroom, not just enough for idle play.",
      },
      {
        title: "The simulation is single-threaded, so tick rate depends on clock speed",
        text: "Satisfactory targets 30 ticks per second, but that's an upper limit the server only reaches with enough single-core headroom -- since the game loop is largely single-threaded, CPU clock speed and per-core performance matter far more for avoiding a lagging factory than adding more cores does.",
      },
    ],
    commonIssues: [
      {
        title: "\"Server already claimed\" or nobody else can administrate it",
        text: "The first account to open the Server Manager and set an admin password \"claims\" the server -- after that, anyone without that password can't manage settings even if they can play on it. Keep the admin password somewhere safe when first setting the server up; there's no simple in-game way to reclaim a server if it's lost.",
      },
    ],
  },

  "v-rising": {
    gameId: "v-rising",
    method: {
      type: "steamcmd",
      appId: 1829350,
      installDirExample: "C:\\GameServers\\VRising",
    },
    startCommand: {
      windows: 'VRisingServer.exe -persistentDataPath ".\\save-data"',
    },
    startNotes:
      "Run this from the install directory (Linux is supported through Steam's Proton runtime, using the same executable). Your save folder contains a Settings\\ServerHostSettings.json for the server name, ports, password and max players.",
    officialGuideUrl:
      "https://github.com/StunlockStudios/vrising-dedicated-server-instructions",
    officialGuideLabel: "Stunlock Studios' official dedicated server instructions",
    installDirNotes:
      "The active config lives under the persistent-data path (typically %USERPROFILE%\\AppData\\LocalLow\\Stunlock Studios\\VRisingServer\\Settings\\), which is separate from the install directory -- editing the template copy under StreamingAssets\\Settings\\ instead has no effect, since the running server never reads that copy.",
    configFileLocation: {
      path: "Settings\\ServerHostSettings.json, under the persistent-data path (not the install directory)",
      description:
        "Server identity, ports, password and player/admin caps. Gameplay rules (PvP/PvE, multipliers, clan size) live in the separate ServerGameSettings.json alongside it. Settings load at boot only -- restart the server for any change to take effect.",
    },
    considerations: [
      {
        title: "Max clan size defaults lower than most groups expect",
        text: "The default maximum clan size is 4 players, which surprises larger friend groups -- it's a ServerGameSettings.json value, commonly raised to 6-10 for community servers that want bigger co-ordinated clans.",
      },
      {
        title: "Castle count and sieges are the main CPU cost, not player count alone",
        text: "Every extra castle and servant adds ongoing pathfinding, AI and physics work, and castle sieges are the heaviest moments for CPU load -- if a core sits near 100% during fights or raids, lowering the tick rate or player cap (or capping castles per clan) helps more directly than adding RAM.",
      },
      {
        title: "Large world saves can cause save-related timeouts",
        text: "A save file above roughly 200 MB can strain SATA SSD write speed enough to cause player timeouts during the autosave -- NVMe storage avoids this, and increasing the autosave interval (e.g. to 600 seconds) reduces how often the stall happens.",
      },
    ],
    commonIssues: [
      {
        title: "Server doesn't appear in the in-game server list",
        text: "Both ListOnSteam and ListOnEOS need to be set to true in ServerHostSettings.json -- setting only one is a common reason a server stays invisible. Double-check you're editing the active copy under the persistent-data path, not the template under StreamingAssets, and restart the server after changing either value, since it's only read at startup.",
      },
    ],
  },

  barotrauma: {
    gameId: "barotrauma",
    method: {
      type: "steamcmd",
      appId: 1026340,
      installDirExample: "C:\\GameServers\\Barotrauma",
    },
    startCommand: {
      windows: "DedicatedServer.exe",
      linux: "./DedicatedServer",
    },
    startNotes:
      "Run this from the install directory. The first run walks you through an interactive setup that generates serversettings.xml, which you can edit directly for future starts.",
    officialGuideUrl: "https://barotraumagame.com/wiki/Hosting_a_Dedicated_Server",
    officialGuideLabel: "Official Barotrauma Wiki",
    considerations: [
      {
        title: "The simulation runs on a single CPU core",
        text: "Barotrauma's server only uses one core no matter how many the machine has, so a fast single-core CPU matters far more than core count for keeping the submarine's systems, water physics and AI responsive under load.",
      },
      {
        title: "Complex modded submarines are the main performance risk, not player count",
        text: "A submarine with a very large number of objects (some heavily-modded subs run into the hundreds) can bog the server down even with relatively few players connected -- reports of \"event count very high\" warnings and rubber-banding are usually tied to a specific complex or modded submarine, not the server's general capacity.",
      },
    ],
    commonIssues: [
      {
        title: "The server fails to start after setting a submarine in serversettings.xml",
        text: "The Submarine value has to match the submarine's filename exactly, including capitalization -- a small typo or mismatched case is a common, easy-to-miss reason the server won't start after this setting is changed by hand.",
      },
      {
        title: "The server crashes after adding a mod",
        text: "If crashes start after installing mods, disable all of them and confirm the server runs cleanly, then re-enable mods one at a time -- this isolates which specific mod (or mod combination) is causing the conflict, rather than guessing.",
      },
    ],
  },

  factorio: {
    gameId: "factorio",
    method: {
      type: "direct-download",
      url: "https://www.factorio.com/download/headless",
      urlLabel: "factorio.com/download/headless",
    },
    startCommand: {
      windows: "bin\\x64\\factorio.exe --start-server my-save.zip --server-settings server-settings.json",
      linux: "bin/x64/factorio --start-server my-save.zip --server-settings server-settings.json",
    },
    startNotes:
      "If you don't have a save yet, generate one first with --create my-save.zip. No Steam account is needed for the official headless build.",
    configFileLocation: {
      path: "server-settings.json, in the install directory",
      description:
        "Passed to the server at startup via --server-settings. Covers server identity, password, visibility and autosave behaviour.",
    },
    considerations: [
      {
        title: "UPS (not FPS) is the number that matters",
        text: "Factorio targets 60 updates per second (UPS) -- one simulation step every 16.67ms. Once a factory grows complex enough that the CPU can't finish a step in that window, UPS drops below 60 and the game visibly slows down for every connected player at once, not just the player whose base is causing it.",
      },
      {
        title: "RAM scales with factory size, not player count",
        text: "A fresh vanilla save uses roughly 300-500 MB. A small 2-4 player server is comfortable on around 3 GB; 4-6 GB is a safer range once the factory is more developed or has 5-10 players. Large, heavily-modded, or multi-planet Space Age factories should plan for 6-8 GB or more -- what drives memory use is how big and complex the factory itself has become.",
      },
      {
        title: "RAM speed matters as much as RAM size on a large factory",
        text: "On a large, developed factory, the practical bottleneck is often how fast the CPU can fetch and update the huge amount of factory data in memory, not the total amount of RAM installed -- faster RAM can measurably help UPS on a big base even without adding more of it.",
      },
    ],
  },

  squad: {
    gameId: "squad",
    method: {
      type: "steamcmd",
      appId: 403240,
      installDirExample: "C:\\GameServers\\Squad",
    },
    startCommand: {
      windows: "SquadGameServer.exe Port=7787 QueryPort=27165",
      linux: "./SquadGameServer.sh Port=7787 QueryPort=27165",
    },
    startNotes:
      "Run this from the install directory. Config files are generated under SquadGame\\ServerConfig on first run.",
    officialGuideUrl: "https://squad.fandom.com/wiki/Server_Installation",
    officialGuideLabel: "Official Squad Wiki",
    configFileLocation: {
      path: "SquadGame\\ServerConfig\\Server.cfg, in the install directory",
      description:
        "Covers server name, player caps and reserved admin slots. Layer rotation, admin permissions and bans live in separate files in the same folder.",
    },
    considerations: [
      {
        title: "RAM and CPU needs scale steeply with player count",
        text: "Squad supports up to 100 players on one server, and hardware needs rise steeply to match -- a mid-sized server is commonly run on 16 GB of RAM, while a full 100-player server is more comfortable with 24-32 GB and several dedicated CPU cores, since large maps, vehicle physics and persistent simulation systems all add up at once.",
      },
      {
        title: "Single-core speed still matters even though Squad is CPU-hungry overall",
        text: "Despite needing several cores at high player counts, Squad is still sensitive to per-core clock speed -- a high-clock, modern CPU generally outperforms a machine with more cores running at a lower clock, particularly during frame-time spikes when a lot happens on the map at once.",
      },
    ],
  },

  "insurgency-sandstorm": {
    gameId: "insurgency-sandstorm",
    method: {
      type: "steamcmd",
      appId: 581330,
      installDirExample: "C:\\GameServers\\InsurgencySandstorm",
    },
    startCommand: {
      windows: 'InsurgencyServer-Win64-Shipping.exe "Oilfield?Scenario=Scenario_Refinery_Push_Security?MaxPlayers=28" -Port=27102 -QueryPort=27131',
    },
    startNotes:
      "A Linux binary is also available in the install directory under a similar name, taking the same map/scenario/port arguments.",
    commonIssues: [
      {
        title: "The server crashes during or right after a map change",
        text: "Crashes clustered specifically around map transitions are a known pattern reported by server admins, rather than something tied to any one particular map. If you're running the server with the -log launch flag, try removing it -- some admins have found that heavy logging around specific in-game actions (like reloads or calling in support) contributes to crashes, and removing -log resolved it for them.",
      },
    ],
  },

  "killing-floor-2": {
    gameId: "killing-floor-2",
    method: {
      type: "steamcmd",
      appId: 232130,
      installDirExample: "C:\\GameServers\\KillingFloor2",
    },
    startCommand: {
      windows: "KFServer.exe KF-BurningParis?MaxPlayers=6",
    },
    startNotes:
      "Run this from Binaries\\Win64 in the install directory. Tripwire discontinued the Linux dedicated server, so Windows is required.",
    officialGuideUrl: "https://wiki.killingfloor2.com/index.php?title=Dedicated_Server_(Killing_Floor_2)",
    officialGuideLabel: "Killing Floor 2 Wiki",
    configFileLocation: {
      path: "KFGame\\Config\\PCServer-KFGame.ini, in the install directory",
      description:
        "Covers server name, admin/join passwords and access control. Difficulty and map rotation are set separately, via launch parameters and a map cycle file.",
    },
    considerations: [
      {
        title: "Lightweight on hardware compared to most games this site covers",
        text: "As a Source-engine-derived title, a single KF2 server instance typically uses well under 1 GB of RAM even under normal play -- it's one of the less demanding games here in terms of raw resource needs.",
      },
    ],
    commonIssues: [
      {
        title: "Server RAM usage climbs the longer the server stays up",
        text: "Server admins have reported memory usage growing gradually over a server's uptime beyond what a fresh instance uses -- if a long-running server feels sluggish or is using far more RAM than expected after days of uptime, a scheduled restart is a practical, known workaround.",
      },
    ],
  },

  "left-4-dead-2": {
    gameId: "left-4-dead-2",
    method: {
      type: "steamcmd",
      appId: 222860,
      installDirExample: "C:\\GameServers\\L4D2",
    },
    startCommand: {
      windows: "srcds.exe -game left4dead2 +map c1m1_hotel +maxplayers 8",
      linux: "./srcds_run -game left4dead2 +map c1m1_hotel +maxplayers 8",
    },
    startNotes:
      "You'll also need a Game Server Login Token (GSLT) from Steam for the server to appear in the public server browser.",
    configFileLocation: {
      path: "left4dead2\\cfg\\server.cfg, in the install directory",
      description:
        "Executed automatically on startup. Like other Source-engine games, most settings can also be changed live via RCON without restarting.",
    },
    considerations: [
      {
        title: "Light on hardware, same as other Source-engine titles here",
        text: "A single L4D2 server instance is comparatively undemanding -- 2 GB of RAM comfortably covers a server, with single-core CPU clock speed mattering more than core count for keeping things smooth during a busy horde encounter.",
      },
    ],
    commonIssues: [
      {
        title: "Players can't see or download a custom campaign/map the server is running",
        text: "Custom campaigns need to be distributed to players separately -- either via the Steam Workshop (with sv_downloadurl/Workshop collection support configured, similar to Garry's Mod) or by having players manually install the same .vpk file the server uses. A player missing the exact same map file simply can't join that map, and won't necessarily get a clear explanation why.",
      },
    ],
  },

  "space-engineers": {
    gameId: "space-engineers",
    method: {
      type: "steamcmd",
      appId: 298740,
      installDirExample: "C:\\GameServers\\SpaceEngineers",
    },
    startCommand: {
      windows: "SpaceEngineersDedicated.exe -console",
    },
    startNotes:
      "Running it without -console opens a configuration UI for creating or loading a world and setting the port instead; -console skips straight to an existing SpaceEngineers-Dedicated.cfg.",
    officialGuideUrl:
      "https://spaceengineers.wiki.gg/wiki/Setting_up_a_Space_Engineers_Dedicated_Server",
    officialGuideLabel: "Official Space Engineers Wiki",
    considerations: [
      {
        title: "Physics simulation runs on a single CPU core",
        text: "Voxel updates, collision detection and grid physics are heavily single-threaded, so per-core CPU speed is by far the most important hardware factor -- a modern CPU with fewer, faster cores will outperform an older CPU with many more, slower ones for this specific game.",
      },
      {
        title: "One large, unrestricted build can tank performance for everyone",
        text: "Sim speed (shown in-game) drops below 1.0 when the server can't keep up, and it slows the game down in real time for every player, not just the one whose ship or base is the cause. A single player building an extremely large, unrestricted grid is a common cause -- setting a sensible block-count limit per grid heads this off before it becomes a problem.",
      },
      {
        title: "Fast storage matters more than it might seem",
        text: "Frequent autosaves combined with a large world file can create a real disk I/O bottleneck, adding to lag and slowing down world loads -- an SSD (ideally NVMe) is worth prioritising here, not just for load times but for ongoing server responsiveness.",
      },
    ],
  },

  unturned: {
    gameId: "unturned",
    method: {
      type: "steamcmd",
      appId: 1110390,
      installDirExample: "C:\\GameServers\\Unturned",
    },
    startCommand: {
      windows: "Unturned Server.exe -nographics -batchmode +secure MyServer",
      linux: "./ServerHelper.sh -nographics -batchmode +secure MyServer",
    },
    startNotes:
      "Commands.dat inside Servers\\MyServer\\Server controls every startup setting -- name, port, map, max players and more -- and takes effect on the next restart.",
    configFileLocation: {
      path: "Servers\\<name>\\Server\\Commands.dat, in the install directory",
      description:
        "A list of server console commands, one per line, run automatically on startup. See the Unturned config generator on this site to produce one.",
    },
    considerations: [
      {
        title: "Single-core CPU speed is the main performance factor",
        text: "Like several other titles this site covers, Unturned's server doesn't spread its main workload across multiple cores, so per-core clock speed matters more than core count for keeping the server responsive under load.",
      },
    ],
    commonIssues: [
      {
        title: "The server's RAM usage climbs steadily and doesn't come back down",
        text: "A gradual, ongoing RAM increase over a server's uptime (rather than RAM staying flat during normal play) has been a recurring, documented issue -- if a server that's been running for a long time is using far more memory than it did shortly after starting, a scheduled restart is the practical workaround rather than a configuration problem to chase down.",
      },
    ],
  },

  "the-forest": {
    gameId: "the-forest",
    method: {
      type: "steamcmd",
      appId: 556450,
      installDirExample: "C:\\GameServers\\TheForest",
    },
    startCommand: {
      windows: "TheForestDedicatedServer.exe -batchmode -showlogs -treeregrowmode -configfilepath ./server.cfg",
    },
    startNotes: "Run this from the install directory -- there's no official Linux build.",
    considerations: [
      {
        title: "Leftover world objects accumulate RAM usage over time",
        text: "Items and debris players leave behind -- fallen logs, extinguished fires, anything built or dropped -- stay in the world and continue costing memory until the server is restarted; nothing clears them automatically. A server left running for a long time without a restart tends to use noticeably more RAM than the same server shortly after starting, simply from world clutter building up.",
      },
    ],
    commonIssues: [
      {
        title: "Players' saved progress doesn't reliably carry over between sessions",
        text: "Player save files are tied to the specific server's identity (its login token) -- a server running fully anonymously, without its own token, can have trouble consistently linking back to the same player save data across sessions. Setting the server up with its own login token avoids this.",
      },
    ],
  },

  scum: {
    gameId: "scum",
    method: {
      type: "steamcmd",
      appId: 3792580,
      installDirExample: "C:\\GameServers\\SCUM",
    },
    startCommand: {
      windows: "SCUMServer.exe -log -port=7777 -MaxPlayers=64",
    },
    startNotes:
      "Run this from SCUM\\Binaries\\Win64 in the install directory. Server settings live in SCUM\\Saved\\Config\\WindowsServer\\ServerSettings.ini, generated after the first run. A Linux build also exists -- check the wiki for its exact binary name and flags.",
    officialGuideUrl: "https://scum.wiki.gg/wiki/Scum_Dedicated_server_setup",
    officialGuideLabel: "Official SCUM Wiki",
    considerations: [
      {
        title: "The island simulation runs regardless of how many players are on",
        text: "A SCUM server uses around 8 GB of RAM even with nobody connected, because the whole island's simulation -- zombies (\"puppets\"), vehicles and loot spawners -- runs continuously in the background. Budget for that baseline first, then add more for player count and base-building on top of it.",
      },
      {
        title: "Zombie count is a direct, adjustable performance lever",
        text: "The puppet (zombie) spawn limit defaults to unlimited. That's fine for a small server, but on a busier one, setting an explicit cap is one of the most effective ways to reduce load without changing anything else.",
      },
      {
        title: "Single-core CPU speed matters more than core count",
        text: "Like most Unreal Engine-based servers this site covers, SCUM leans on per-core clock speed rather than spreading load evenly across many cores -- a modern, high-clock CPU will outperform an older CPU with more cores at a lower clock.",
      },
    ],
    commonIssues: [
      {
        title: "RAM usage keeps climbing the longer the server runs",
        text: "Community reports consistently describe SCUM servers using more RAM the longer they stay up -- partly a natural result of more bases and player progress accumulating over time, and partly reported memory-leak behaviour on long uptimes. Scheduling a regular restart is the standard, practical mitigation.",
      },
    ],
  },

  "risk-of-rain-2": {
    gameId: "risk-of-rain-2",
    method: {
      type: "steamcmd",
      appId: 1180760,
      installDirExample: "C:\\GameServers\\RiskOfRain2",
    },
    startCommand: {
      windows: "start_headless_server.bat",
    },
    startNotes:
      "This launches Risk of Rain 2.exe in headless mode. Linux hosts commonly run the same Windows build under Wine (e.g. via Xvfb), since there's no native Linux server build.",
    considerations: [
      {
        title: "The dedicated server build isn't actively maintained by the developer",
        text: "Hopoo Games/Gearbox stopped updating the standalone dedicated server tool some time ago, so it can lag behind the current game version. If the server won't let clients connect after a game update, mismatched versions between the (older) dedicated server build and the (current) game client is the first thing to suspect.",
      },
    ],
    commonIssues: [
      {
        title: "Everyone gets a black screen when a run actually starts",
        text: "This has been a recurring issue where the pre-game lobby works fine, but a black screen appears for all players the moment a run begins. A commonly reported workaround is disabling headless mode -- open the server's boot.config file and delete the line starting with headless=, then restart the server.",
      },
    ],
  },

  mordhau: {
    gameId: "mordhau",
    method: {
      type: "steamcmd",
      appId: 629800,
      installDirExample: "C:\\GameServers\\Mordhau",
    },
    startCommand: {
      windows: "Mordhau.exe -log",
      linux: "./MordhauServer.sh -log",
    },
    startNotes:
      "Run this from the install directory. Server name, map and settings live in Mordhau\\Saved\\Config\\WindowsServer\\Game.ini.",
    officialGuideUrl: "https://mordhau.fandom.com/wiki/Dedicated_Server_Hosting_Guide",
    officialGuideLabel: "Mordhau Wiki",
    considerations: [
      {
        title: "The server runs on a single CPU core",
        text: "Mordhau's dedicated server doesn't spread its workload across multiple cores, which limits how far its performance scales no matter how much hardware you throw at it -- per-core clock speed is what actually helps here.",
      },
      {
        title: "Raising max players and tick rate together compounds, rather than adds",
        text: "Going much above 64 players causes engine-level performance problems, and increasing tick rate and max players at the same time reduces performance by more than either change would on its own -- if you raise one, keep a close eye on server stats (the m.ShowServerStats console command shows this live) before also raising the other.",
      },
    ],
  },

  astroneer: {
    gameId: "astroneer",
    method: {
      type: "steamcmd",
      appId: 728470,
      installDirExample: "C:\\GameServers\\Astroneer",
    },
    startCommand: {
      windows: "AstroServer.exe",
    },
    startNotes:
      "Run this from the install directory -- there's no official Linux build. The first run generates AstroServerSettings.ini and Engine.ini under Astro\\Saved\\Config\\WindowsServer, where you set the server name, password and save behaviour.",
    officialGuideUrl: "https://astroneer.space/dedicatedserver/",
    officialGuideLabel: "Astroneer official dedicated server page",
    configFileLocation: {
      path: "Astro\\Saved\\Config\\WindowsServer\\AstroServerSettings.ini",
      description:
        "Covers server name, password, max framerate and save behaviour. Generated the first time the server runs -- restart after editing it.",
    },
    considerations: [
      {
        title: "RAM use grows with world/save progress, not just player count",
        text: "As a rough guide, expect somewhere in the 2-6 GB range depending on how far the save has progressed -- more exploring, more bases and more vehicles all add to the world state the server has to keep in memory.",
      },
    ],
    commonIssues: [
      {
        title: "The server closes itself a few seconds after starting",
        text: "This is most often a mistake in one of the generated .ini files (a stray character, or a value in the wrong format) rather than a hardware or install problem -- check the console output right before it closes for the specific line it objected to.",
      },
      {
        title: "The server crashes right after an autosave",
        text: "Save corruption in Astroneer is almost always caused by the server process being forcefully stopped while it was in the middle of autosaving -- always shut the server down cleanly (rather than killing the process) to avoid this, and keep periodic backups regardless.",
      },
    ],
  },

  icarus: {
    gameId: "icarus",
    method: {
      type: "steamcmd",
      appId: 2089300,
      installDirExample: "C:\\GameServers\\Icarus",
    },
    startNotes:
      "Run the dedicated server executable from the install directory (Windows only -- there's no official Linux build; some hosts run it under Wine or Docker unofficially) with -PORT= and -QueryPort= flags. See RocketWerkz's official wiki, linked below, for the exact executable name and current flag list.",
    officialGuideUrl: "https://github.com/RocketWerkz/IcarusDedicatedServer/wiki/Server-Setup",
    officialGuideLabel: "RocketWerkz's official dedicated server wiki",
    considerations: [
      {
        title: "Unusual among this site's games in actually using multiple cores well",
        text: "Unlike most of the other Unreal Engine games covered here, Icarus's server is genuinely multi-threaded -- sustained CPU usage of 150-300% (i.e. more than one full core) during active play with a populated session is normal, not a sign of a problem. Prioritise strong per-core performance first, then extra capacity for running multiple sessions.",
      },
      {
        title: "Plan for a high RAM ceiling",
        text: "32 GB is a reasonable baseline recommendation for a dedicated Icarus server, noticeably more than most other survival titles this site covers.",
      },
    ],
    commonIssues: [
      {
        title: "\"Session Node Timed Out\" (Error Code 36) when players try to join",
        text: "This generally means the map didn't finish loading and initialising within the time the game allows -- it's more likely on an underpowered server or one still under heavy load from a previous session, rather than a client-side connection problem.",
      },
    ],
  },

  "sons-of-the-forest": {
    gameId: "sons-of-the-forest",
    method: {
      type: "steamcmd",
      appId: 2465200,
      installDirExample: "C:\\GameServers\\SonsOfTheForest",
    },
    startCommand: {
      windows: "SonsOfTheForestDS.exe",
    },
    startNotes:
      "Linux hosts commonly run the same build under Wine, since there's no native Linux server. Server settings are generated after the first run.",
    configFileLocation: {
      path: "dedicatedserver.cfg.json, in the server's configurations folder",
      description:
        "Generated on first launch. Covers server name, max players, password, save slot and game mode.",
    },
    considerations: [
      {
        title: "The server runs as a headless simulation -- CPU and RAM are what matter",
        text: "Since it never renders anything, GPU is irrelevant -- CPU (particularly single-core clock speed) and RAM are the two things that actually determine how well it runs. A small 2-4 player world is comfortable on 2 modern CPU cores and 8 GB of RAM.",
      },
      {
        title: "Single-core speed matters more once you're past a small group",
        text: "Past around 4 players, single-core clock speed becomes more important than total core count for keeping the simulation responsive -- a common mistake is undersizing the CPU while over-provisioning player slots, which shows up as world-wide stutter rather than a problem tied to any specific player.",
      },
      {
        title: "RAM use creeps up on long-running, heavily-built worlds",
        text: "A heavily-built world can use an extra 500-800 MB of RAM after 30+ in-game days compared to a fresh one -- a modest but real increase worth accounting for on a server that's expected to run for a long time.",
      },
    ],
  },

  soulmask: {
    gameId: "soulmask",
    method: {
      type: "steamcmd",
      appId: 3017310,
      installDirExample: "C:\\GameServers\\Soulmask",
    },
    startCommand: {
      windows: "WSServer.exe",
      linux: "./WSServer.sh",
    },
    startNotes:
      "Windows uses Steam app 3017310; Linux uses a separate app, 3017300 -- pick the one matching your OS before installing. Server settings are configured via command-line flags and a generated .ini file.",
    considerations: [
      {
        title: "The server needs around 11-12 GB of RAM just to start",
        text: "That's before accounting for world growth or player count -- Soulmask has one of the higher baseline RAM requirements of the games this site covers, so running it comfortably requires planning around that floor rather than a typical \"per player\" estimate.",
      },
      {
        title: "Tribesmen (recruited NPCs), not just player count, drive CPU load",
        text: "Every AI-controlled tribesman a player recruits runs its own pathfinding and task logic every tick, and this adds up faster than player count alone would suggest -- a server with 20 players who've each recruited close to the maximum number of tribesmen can struggle more than a server with 30 players who've recruited very few. Delayed hits, rubber-banding and slow crafting/inventory actions are the typical symptoms of the CPU falling behind.",
      },
    ],
    commonIssues: [
      {
        title: "Performance degrades noticeably after several hours of uptime",
        text: "A gradual slowdown over a few hours, even with plenty of RAM available, is consistent with reported memory-leak behaviour on long-running servers -- a scheduled daily restart is the standard, practical fix.",
      },
    ],
  },

  "the-isle": {
    gameId: "the-isle",
    method: {
      type: "steamcmd",
      appId: 412680,
      installDirExample: "C:\\GameServers\\TheIsle",
      betaBranch: "evrima",
    },
    startCommand: {
      windows: "TheIsleServer.exe ?Port=7777 -log",
      linux: "./TheIsleServer.sh ?Port=7777 -log",
    },
    startNotes: "Run this from the install directory.",
    considerations: [
      {
        title: "AI dinosaurs are the biggest driver of both RAM and CPU load",
        text: "Every AI-controlled dinosaur on the map runs its own pathfinding, behaviour and physics continuously -- a server that idles comfortably at 4 GB of RAM with few AI present can need up to 16 GB once the world fills up with a large population of huntable AI. Game.ini settings like AIDensity and AISpawnInterval directly control this, and turning them down is one of the most effective ways to reduce load on a struggling server.",
      },
      {
        title: "Single-core CPU speed is the main factor in smoothness",
        text: "The Isle's server logic is mostly single-threaded, so a fast individual core matters far more than total core count -- a server on weak single-core hardware will show rubber-banding for players regardless of how much RAM is available.",
      },
      {
        title: "Watch RAM headroom, not just total capacity",
        text: "Running consistently above about 80% RAM usage is a strong sign players will start getting disconnected during normal play -- low available RAM, not a networking issue, is the most common cause of players getting booted mid-session on an Evrima server.",
      },
    ],
  },

  "scp-secret-laboratory": {
    gameId: "scp-secret-laboratory",
    method: {
      type: "steamcmd",
      appId: 996560,
      installDirExample: "C:\\GameServers\\SCPSL",
    },
    startCommand: {
      windows: "LocalAdmin.exe 7777",
      linux: "./LocalAdmin 7777",
    },
    startNotes:
      "LocalAdmin manages the actual game server process and automatically restarts it if it crashes.",
    officialGuideUrl: "https://techwiki.scpslgame.com/books/server-guides/page/1-how-to-create-a-dedicated-server",
    officialGuideLabel: "SCP: Secret Laboratory official tech wiki",
    considerations: [
      {
        title: "Built on Unity, and bound to a single CPU core",
        text: "The main game loop runs on one thread, so it can't spread load across many cores no matter how many are available -- per-core speed is what determines how many players and how much plugin activity the server can comfortably handle.",
      },
      {
        title: "Plugins (especially EXILED) meaningfully raise the RAM floor",
        text: "The base server process alone typically uses 2-3 GB. Adding the EXILED plugin framework with several heavier plugins can push that to 6-8 GB. As a rough guide: 3-4 GB for a small private server (up to 20 players), 5-6 GB for a 20-30 player community server, and 6-8 GB for a larger 30-40 player server running EXILED plugins.",
      },
    ],
  },

  stationeers: {
    gameId: "stationeers",
    method: {
      type: "steamcmd",
      appId: 600760,
      installDirExample: "C:\\GameServers\\Stationeers",
    },
    startCommand: {
      windows: 'rocketstation_DedicatedServer.exe -settings ServerName "My Server" GamePort 27016 ServerMaxPlayers 13',
      linux: './rocketstation_DedicatedServer.x86_64 -settings ServerName "My Server" GamePort 27016 ServerMaxPlayers 13',
    },
    startNotes: "Run this from the install directory.",
    officialGuideUrl: "https://stationeers-wiki.com/Dedicated_Server_Guide",
    officialGuideLabel: "Stationeers Community Wiki",
    considerations: [
      {
        title: "Atmospheric simulation is a major, distinctive CPU cost",
        text: "Stationeers continuously simulates gas mixtures, pressure and temperature throughout every connected room and pipe network on the base -- this atmospheric calculation is one of the heavier, more distinctive CPU costs among the games this site covers, on top of the usual player/entity simulation.",
      },
      {
        title: "Plan for a high RAM ceiling",
        text: "16 GB or more is commonly recommended -- the server will start with less, but tends to run out of headroom quickly and becomes unstable as a result. 6-8 CPU cores is also a common recommendation, reflecting the atmospheric workload above.",
      },
      {
        title: "Very large bases can cause loading interruptions even on well-specced hardware",
        text: "A base with several thousand individual parts can cause loading stutters even on a server with 8 cores and 16 GB of RAM -- this is a known scaling limit of large, complex bases rather than a sign of an undersized server.",
      },
    ],
  },

  "empyrion-galactic-survival": {
    gameId: "empyrion-galactic-survival",
    method: {
      type: "steamcmd",
      appId: 530870,
      installDirExample: "C:\\GameServers\\Empyrion",
    },
    startCommand: {
      windows: "EmpyrionDedicated.exe",
    },
    startNotes:
      "Run this from the install directory -- there's no official Linux build. Server settings live in Content\\Configuration\\dedicated.yaml, generated after the first run.",
    officialGuideUrl: "https://empyrion.fandom.com/wiki/Guide/Setting_Up_Dedicated_Server",
    officialGuideLabel: "Official Empyrion: Galactic Survival Wiki",
    considerations: [
      {
        title: "RAM use scales with how many playfields are loaded, not just player count",
        text: "The server keeps a separate running instance for every playfield (planet, moon or space area) that's currently being visited, typically costing roughly 1-2 GB each while new, and unloading a playfield once nobody's there -- though with several players spread across different playfields at once, many can stay loaded simultaneously. A newly-explored playfield is light; one that's been heavily dug into and built up uses noticeably more.",
      },
      {
        title: "The main simulation loop is single-core bound",
        text: "Empyrion leans on one core per playfield rather than spreading work evenly across all available cores, so per-core clock speed (aim for 3.8 GHz or higher) matters more than raw core count for keeping multiple active playfields running smoothly.",
      },
      {
        title: "Fast storage noticeably affects overall responsiveness",
        text: "How quickly the server can read and write playfield data has a real, direct impact on server speed -- an SSD is a meaningfully better fit than a mechanical hard drive here, not just for load times.",
      },
    ],
  },

  nightingale: {
    gameId: "nightingale",
    method: {
      type: "steamcmd",
      appId: 3796810,
      installDirExample: "C:\\GameServers\\Nightingale",
    },
    startCommand: {
      windows: "NWXServer.exe -log",
      linux: "./NWXServer.sh -log",
    },
    startNotes:
      "Run this from the install directory. Inflexion Games' official self-hosting guide (PDF, linked below) covers realm configuration in full.",
    officialGuideUrl: "https://playnightingale.com/dedicated-servers",
    officialGuideLabel: "Nightingale official self-hosting page",
    considerations: [
      {
        title: "Load scales with realm complexity, not just player count",
        text: "How built-up and explored a realm is affects server load as much as how many players are connected -- a smaller group that's fully developed a complex realm can load the server as much as a larger group still early on. If performance degrades, checking realm complexity alongside player count (rather than player count alone) gives a clearer picture.",
      },
    ],
    commonIssues: [
      {
        title: "Isolating the cause of a performance problem",
        text: "If the server is struggling, temporarily reducing realm complexity or the active mod/extension list, then reintroducing pieces one at a time, is a practical way to identify whether a specific setting, mod, or genuinely just insufficient hardware is behind it -- rather than guessing at a single fix upfront.",
      },
    ],
  },

  necesse: {
    gameId: "necesse",
    method: {
      type: "steamcmd",
      appId: 1169370,
      installDirExample: "C:\\GameServers\\Necesse",
    },
    startCommand: {
      windows: "StartServer.bat",
      linux: "./StartServer-nogui.sh",
    },
    startNotes:
      "Run this from the install directory -- both are generated wrappers around the server's Server.jar and require Java 17+ installed.",
    considerations: [
      {
        title: "Settler/NPC count drives CPU load more than player count",
        text: "Necesse's simulation is tile- and entity-based and runs on a single core, so a colony of around 50 settlers all pathfinding at once can strain even a strong server, independent of how many actual players are connected.",
      },
      {
        title: "Being Java-based, you need to explicitly raise the memory limit",
        text: "Like Minecraft, Necesse runs on the JVM, and the default memory limit is often too low for a real server -- set an explicit -Xmx flag rather than relying on Java's default. Allocating a bit more than the bare minimum gives the server room to avoid frequent garbage-collection pauses, which otherwise show up as brief stutters.",
      },
    ],
    commonIssues: [
      {
        title: "Settlers get stuck and the server slows down",
        text: "A settler stuck in a doorway or a complex maze-like base layout can burn a disproportionate amount of CPU time trying to path around it -- if performance degrades in a specific area of the base, checking for a settler stuck there is worth doing before assuming a broader problem.",
      },
      {
        title: "Islands are simulated even when nobody's on them",
        text: "If the unloadSettlements setting is left at its default of false, the server keeps simulating every island around the clock, whether or not any player is currently there -- setting unloadSettlements=true stops that, and is one of the more effective changes for a server with several settlements spread across different islands.",
      },
    ],
  },

  "rising-storm-2-vietnam": {
    gameId: "rising-storm-2-vietnam",
    method: {
      type: "steamcmd",
      appId: 418480,
      installDirExample: "C:\\GameServers\\RS2Vietnam",
    },
    startNotes:
      "Launch the server using the batch file/script generated alongside the install -- the process is functionally identical to Rising Storm 2's predecessor, Red Orchestra 2. See the official wiki, linked below, for the exact executable name and current launch flags for your version.",
    officialGuideUrl: "https://wiki.rs2vietnam.com/index.php?title=DedicatedServer",
    officialGuideLabel: "Rising Storm 2: Vietnam Wiki",
    considerations: [
      {
        title: "Runs on an older engine that only really uses one core",
        text: "RS2: Vietnam is built on Unreal Engine 3, which predates the multi-core CPU designs common today and effectively runs its main logic on a single core regardless of how many are available -- per-core clock speed is what actually determines how well it performs, same as Killing Floor 2, built on the same engine generation by the same studio.",
      },
    ],
  },

  "vintage-story": {
    gameId: "vintage-story",
    method: {
      type: "direct-download",
      url: "https://www.vintagestory.at/selfhosting/",
      urlLabel: "vintagestory.at/selfhosting",
    },
    startCommand: {
      windows: "VintagestoryServer.exe",
    },
    startNotes:
      "Run this directly from the install folder -- typing /serverconfig upnp 1 in its console window helps punch through router UPnP if available. Linux hosts run the bundled .NET-based server script; see the official wiki, linked below, for its exact name and current flags.",
    officialGuideUrl: "https://wiki.vintagestory.at/Guide:Dedicated_Server",
    officialGuideLabel: "Official Vintage Story Wiki",
    considerations: [
      {
        title: "RAM scales predictably: roughly 1 GB base plus 300 MB per player",
        text: "That's a reasonable starting estimate before mods -- mods can push memory use noticeably higher. Per-core CPU clock speed matters more than core count here, since the server doesn't spread its main workload evenly across many cores.",
      },
      {
        title: "An SSD isn't just recommended, it's required for good performance",
        text: "From version 1.20 onward, running on a mechanical hard drive causes real stuttering during autosaves and chunk generation -- this isn't a minor optimisation, it's close to a hard requirement for a smooth server.",
      },
    ],
    commonIssues: [
      {
        title: "Chunks stop loading, especially on a long-running world",
        text: "This gets more likely the longer a save has been running, and can make the game effectively unplayable after a couple of hours if left unaddressed. If MaxChunkRadius is set high (the default is 12) and several players are spread across the map, the server can be trying to process an unreasonably large number of chunks at once -- lowering MaxChunkRadius to around 8 is a common, effective fix.",
      },
      {
        title: "The server slows down on a world that's been running a long time",
        text: "A large number of accumulated mobs, dropped items or animals in one area (common on a server that's never had them cleaned up) can noticeably tank performance -- this is a separate cause from the chunk-loading issue above, and worth checking independently.",
      },
    ],
  },

  wreckfest: {
    gameId: "wreckfest",
    method: {
      type: "steamcmd",
      appId: 361580,
      installDirExample: "C:\\GameServers\\Wreckfest",
    },
    startCommand: {
      windows: 'server\\Wreckfest.exe -s server_config=server_config.cfg --save-dir=save',
    },
    startNotes:
      "Run this from the install directory -- there's no official Linux build.",
    considerations: [
      {
        title: "Upload bandwidth matters as much as CPU or RAM here",
        text: "Unlike most games this site covers, Wreckfest's bottleneck is often the server's upload connection rather than compute -- constantly streaming the position and physics state of up to 24 cars to every connected player is genuinely bandwidth-heavy. A single-thread-fast CPU is still important, but a narrow upload pipe (well under 100 Mbit) will cause lag and stutter even on otherwise strong hardware.",
      },
      {
        title: "Avoid hosting and playing from the same machine",
        text: "Running a client and the server on the same PC competes for the same CPU and bandwidth, and is a common, avoidable cause of a server feeling laggy specifically to the person hosting it.",
      },
    ],
  },

  trackmania: {
    gameId: "trackmania",
    method: {
      type: "direct-download",
      url: "http://files.v04.maniaplanet.com/server/TrackmaniaServer_Latest.zip",
      urlLabel: "Official Trackmania dedicated server download",
    },
    startCommand: {
      windows: "TrackmaniaServer.exe",
      linux: "./TrackmaniaServer",
    },
    startNotes:
      "Run this once first to generate its folder structure, then create a free dedicated-server account at trackmania.com and add its login/password to dedicated_cfg.txt before starting it for real.",
    officialGuideUrl: "https://wiki.trackmania.io/en/dedicated-server",
    officialGuideLabel: "Official Trackmania Wiki",
    considerations: [
      {
        title: "Lightweight compared to most games this site covers",
        text: "Trackmania's dedicated server has modest hardware needs -- it's built for running many server instances efficiently rather than simulating a large persistent world, so it's a good fit even for fairly modest hardware.",
      },
    ],
    commonIssues: [
      {
        title: "The server rejects your login, or won't authenticate",
        text: "Every dedicated server needs its own free dedicated-server account (separate from a normal player account), created at trackmania.com -- its login and password go into dedicated_cfg.txt's masterserver_account section. Reusing a regular player account here doesn't work.",
      },
      {
        title: "The server misbehaves after a game update",
        text: "Trackmania's dedicated server occasionally needs its own files refreshed after a game update -- if problems start appearing right after an update, replacing the server's data pack file with a fresh copy from the currently-installed game is a known fix worth trying before digging further.",
      },
    ],
  },

  craftopia: {
    gameId: "craftopia",
    method: {
      type: "steamcmd",
      appId: 1670340,
      installDirExample: "C:\\GameServers\\Craftopia",
    },
    startCommand: {
      windows: "Craftopia.exe -batchmode -showlogs",
    },
    startNotes: "Run this from the install directory.",
    considerations: [
      {
        title: "Automation and base complexity drive load more than player count",
        text: "As a factory/automation-focused survival game, a sprawling base full of active production lines can cost more server performance than the number of connected players alone would suggest -- similar in spirit to Factorio and Satisfactory, though Craftopia layers this on top of typical multiplayer survival mechanics too.",
      },
    ],
  },

  "path-of-titans": {
    gameId: "path-of-titans",
    method: {
      type: "direct-download",
      url: "https://hosting.pathoftitans.wiki/setup/server-setup",
      urlLabel: "Official Path of Titans hosting wiki",
    },
    startCommand: {
      windows: "PathOfTitansServer-Win64-Shipping.exe -AuthToken=%AG_AUTH_TOKEN%",
    },
    startNotes:
      "Path of Titans is distributed through Alderon Games' own tool, AlderonGamesCmd, rather than SteamCMD. Generate a free auth token from your Alderon Games account first (setting it as the AG_AUTH_TOKEN environment variable avoids Windows' command-line length limit), then use AlderonGamesCmd to download the server files before running the command above.",
    officialGuideUrl: "https://hosting.pathoftitans.wiki/setup/server-setup",
    officialGuideLabel: "Official Path of Titans hosting wiki",
    considerations: [
      {
        title: "One of the more demanding games this site covers",
        text: "Path of Titans runs a large map filled with complex AI creatures and can support very high player counts on official-style servers -- a modern multi-core CPU (aim for a high clock speed, 4 GHz+) and 16-32 GB of RAM is a reasonable range for a medium-sized 50-100 player server, scaling up further for anything larger.",
      },
      {
        title: "AI and physics work scale up with active players, not just the map itself",
        text: "As more players join, server-side AI behaviour, automation and physics all add proportionally more work -- a server that felt comfortable at low population can show frame-time spikes once it fills up, which is a normal scaling pattern for this game rather than a sign something is misconfigured.",
      },
    ],
  },

  atlas: {
    gameId: "atlas",
    method: {
      type: "steamcmd",
      appId: 1006030,
      installDirExample: "C:\\GameServers\\Atlas",
    },
    startNotes:
      "Atlas' world is split into a grid of separate server processes (one per grid cell), each launched from ShooterGame\\Binaries\\Win64\\ShooterGameServer.exe with its own map, grid coordinates, Port and QueryPort -- plus a local Redis server to coordinate them. See the official wiki, linked below, for the full multi-process setup.",
    officialGuideUrl: "https://atlas.fandom.com/wiki/Server_setup",
    officialGuideLabel: "Official ATLAS Wiki",
    considerations: [
      {
        title: "Hardware needs multiply per grid cell, since each one is a separate process",
        text: "Because every grid cell runs as its own independent server process (sharing the same underlying ARK-derived engine as ARK: Survival Evolved), RAM and CPU needs scale roughly with how many grid cells you run at once, not just with total player count -- a multi-cell Atlas cluster needs meaningfully more hardware than a single-map ARK server with the same population.",
      },
    ],
    commonIssues: [
      {
        title: "Grid cells fail to connect to each other, or fail to start at all",
        text: "Atlas relies on a local Redis server to coordinate all the grid-cell processes together -- if Redis isn't running, isn't reachable, or its config was overwritten by an update, grid cells can fail to start or fail to talk to each other. Confirm the Redis server is actually running and accepting connections before troubleshooting further.",
      },
      {
        title: "In-game server time (\"Age\") looks different between grid cells",
        text: "Grid cells can drift out of sync with each other over time, showing noticeably different in-game ages -- enabling the \"USE UTC TIME\" setting so all cells reference the same clock is a commonly reported fix for this specific symptom.",
      },
    ],
  },

  "colony-survival": {
    gameId: "colony-survival",
    method: {
      type: "steamcmd",
      appId: 748090,
      installDirExample: "C:\\GameServers\\ColonySurvival",
    },
    startCommand: {
      windows: 'colonyserver.exe -batchmode -nographics +server.world "Dedicated" +server.networktype SteamOnline +server.name "My Server"',
      linux: './colonyserver.x86_64 -batchmode -nographics +server.world "Dedicated" +server.networktype SteamOnline +server.name "My Server"',
    },
    startNotes: "Run this from the install directory.",
    considerations: [
      {
        title: "Colonist pathfinding is the main CPU cost, not player count",
        text: "Large colonies with many NPC colonists doing jobs and combat can load the server significantly, and the server has to precalculate pathfinding when a world first loads -- typically taking 5-15 seconds depending on the CPU. Very long roads are a particular edge case: they can cause pathfinding delays of 10-15 minutes before colonists find the correct route across them.",
      },
      {
        title: "RAM needs are modest but grow with colony size",
        text: "A basic server is comfortable around 2 GB of RAM, with 4-6 GB a reasonable planning range for a growing private world -- world growth, colonist count and any mods all push usage upward from that baseline.",
      },
    ],
  },
};
