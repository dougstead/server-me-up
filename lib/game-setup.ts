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
  },
};
