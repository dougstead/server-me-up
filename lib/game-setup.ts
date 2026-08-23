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

export type GameSetup = {
  gameId: string;
  method: GameSetupMethod;
  startCommand?: StartCommand;
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
    startCommand: {
      windows: 'java -Xmx4G -Xms2G -jar server.jar nogui',
      linux: 'java -Xmx4G -Xms2G -jar server.jar nogui',
    },
    startNotes:
      "Place the downloaded server.jar in its own folder, then run it once so it generates eula.txt -- open that file and change eula=false to eula=true. Then start it with the command below, adjusting -Xmx to the RAM you want to allocate. You need a Java runtime that matches the server version installed first.",
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
