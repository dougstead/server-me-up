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
    }
  | {
      type: "direct-download";
      url: string;
      urlLabel: string;
    };

export type GameSetup = {
  gameId: string;
  method: GameSetupMethod;
  startNotes: string;
  officialGuideUrl?: string;
  officialGuideLabel?: string;
};

export const gameSetups: Record<string, GameSetup> = {
  minecraft: {
    gameId: "minecraft",
    method: {
      type: "direct-download",
      url: "https://www.minecraft.net/en-us/download/server",
      urlLabel: "minecraft.net/download/server",
    },
    startNotes:
      'Place the downloaded server.jar in its own folder, then run it once so it generates eula.txt -- open that file and change eula=false to eula=true. Start the server with something like java -Xmx4G -Xms2G -jar server.jar nogui (adjust -Xmx to the RAM you want to allocate). You need a Java runtime that matches the server version installed first.',
  },

  "minecraft-bedrock": {
    gameId: "minecraft-bedrock",
    method: {
      type: "direct-download",
      url: "https://www.minecraft.net/en-us/download/server/bedrock",
      urlLabel: "minecraft.net/download/server/bedrock",
    },
    startNotes:
      "Extract the downloaded zip into its own folder, then run bedrock_server.exe (Windows) or ./bedrock_server (Linux, after chmod +x). Edit server.properties in the same folder to configure the world name, port and other settings before starting it.",
  },

  "ark-survival-evolved": {
    gameId: "ark-survival-evolved",
    method: {
      type: "steamcmd",
      appId: 376030,
      installDirExample: "C:\\GameServers\\ARK",
    },
    startNotes:
      "Launch ShooterGameServer.exe (Windows) or ShooterGameServer (Linux) from ShooterGame\\Binaries\\Win64 or ShooterGame/Binaries/Linux inside the install directory, with map and session options on the command line (e.g. TheIsland?listen?SessionName=MyServer?ServerPassword=...). Full launch-option syntax is on the official wiki.",
    officialGuideUrl: "https://ark.wiki.gg/wiki/Dedicated_server_setup",
    officialGuideLabel: "ARK Official Community Wiki",
  },

  rust: {
    gameId: "rust",
    method: {
      type: "steamcmd",
      appId: 258550,
      installDirExample: "C:\\GameServers\\Rust",
    },
    startNotes:
      "Launch RustDedicated.exe (Windows) or ./RustDedicated (Linux) from the install directory with startup flags for the server name, map seed/size, and ports, e.g. -server.port 28015 -server.identity \"myserver\" -server.level \"Procedural Map\".",
  },

  hytale: {
    gameId: "hytale",
    method: {
      type: "direct-download",
      url: "https://support.hytale.com/hc/en-us/articles/45326769420827-Hytale-Server-Manual",
      urlLabel: "Hytale Server Manual",
    },
    startNotes:
      "The server (HytaleServer.jar) can be copied out of your Hytale launcher's install folder, or fetched with Hypixel Studios' official CLI downloader tool for easier updates. Requires JDK 25 installed. Start it with java -jar HytaleServer.jar. Hytale launched in Early Access in January 2026, so check the official manual for the latest steps.",
  },

  starbound: {
    gameId: "starbound",
    method: {
      type: "steamcmd",
      appId: 211820,
      installDirExample: "C:\\GameServers\\Starbound",
    },
    startNotes:
      "The dedicated server binary ships inside the regular game install: run win64\\starbound_server.exe (Windows) or linux/starbound_server (Linux) from the install directory. You'll need a Steam account that owns Starbound to download it via SteamCMD.",
  },

  terraria: {
    gameId: "terraria",
    method: {
      type: "direct-download",
      url: "https://terraria.org/",
      urlLabel: "terraria.org (Dedicated Server link)",
    },
    startNotes:
      "Extract the downloaded package and run TerrariaServer.exe (Windows) or the TerrariaServer script (Linux/macOS), which launches the correct binary for your system. It opens an interactive console where you set the world, max players and port, or you can pass a serverconfig.txt file on the command line to skip the prompts.",
  },

  valheim: {
    gameId: "valheim",
    method: {
      type: "steamcmd",
      appId: 896660,
      installDirExample: "C:\\GameServers\\Valheim",
    },
    startNotes:
      "Launch valheim_server.exe (Windows) or ./valheim_server.x86_64 (Linux) with flags for name, world and port, e.g. -name \"My Server\" -port 2456 -world \"Dedicated\" -password \"changeme\".",
  },

  "arma-3": {
    gameId: "arma-3",
    method: {
      type: "steamcmd",
      appId: 233780,
      installDirExample: "C:\\GameServers\\Arma3",
    },
    startNotes:
      "Launch arma3server_x64.exe (Windows) or ./arma3server_x64 (Linux) with a -config and -profiles path pointing at your server config files. Arma 3's dedicated server download requires a Steam account that owns the game -- anonymous SteamCMD login won't work here.",
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
    startNotes:
      "Launch srcds.exe (Windows) or ./srcds_run (Linux) with -game tf, plus +map and +maxplayers flags, e.g. srcds.exe -console -game tf +map cp_dustbowl +maxplayers 24.",
  },

  bannerlord: {
    gameId: "bannerlord",
    method: {
      type: "steamcmd",
      appId: 1863440,
      installDirExample: "C:\\GameServers\\Bannerlord",
    },
    startNotes:
      "The dedicated-server tool includes its own launcher for configuring modules, scene and player options before starting the server process.",
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
    startNotes:
      "Launch srcds.exe (Windows) or ./srcds_run (Linux) with -game garrysmod, plus +gamemode, +map and +maxplayers flags, and a Game Server Login Token (GSLT) from Steam for the server to appear in the public server browser.",
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
    startNotes:
      "Launch PalServer.exe (Windows) or ./PalServer.sh (Linux) from the install directory. Server settings (name, password, difficulty and more) are configured in PalWorldSettings.ini -- see the Palworld config generator on this site to produce one.",
  },

  "project-zomboid": {
    gameId: "project-zomboid",
    method: {
      type: "steamcmd",
      appId: 380870,
      installDirExample: "C:\\GameServers\\ProjectZomboid",
    },
    startNotes:
      "Run StartServer64.bat (Windows) or ./start-server.sh (Linux) from the install directory. On first run it generates config files under your user profile (Zomboid/Server) where you set the server name, password and world options.",
  },

  eco: {
    gameId: "eco",
    method: {
      type: "steamcmd",
      appId: 739590,
      installDirExample: "C:\\GameServers\\Eco",
    },
    startNotes:
      "The dedicated-server tool (Steam app 739590) is a separate download from the Eco client. Run EcoServer.exe (Windows) or ./EcoServer.sh (Linux) from the install directory; server settings live in the Configs folder generated on first run.",
  },

  dragonwilds: {
    gameId: "dragonwilds",
    method: {
      type: "steamcmd",
      appId: 4019830,
      installDirExample: "C:\\GameServers\\Dragonwilds",
    },
    startNotes:
      "The dedicated-server tool (Steam app 4019830, free) is a separate download from the game client. It supports anonymous SteamCMD login, so no Steam account is required to download it. Jagex publishes platform-specific startup steps on the official wiki, linked below.",
    officialGuideUrl: "https://dragonwilds.runescape.wiki/w/Dedicated_Servers",
    officialGuideLabel: "RuneScape: Dragonwilds Wiki",
  },
};
