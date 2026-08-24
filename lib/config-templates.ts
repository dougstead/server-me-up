// Per-game dedicated-server config generators.
//
// This file holds only the FORM SCHEMA (field labels/types/defaults) and
// metadata -- it deliberately does not embed any game's actual config
// content. The real template text (a real config file with {{field_id}}
// placeholders swapped in for the values below) lives in data/game-configs/
// as plain data files, kept separate from code for two reasons:
//
//   1. Licensing: raw *facts* about a game's own config format (its key
//      names, defaults, file structure) aren't copyrightable, but wholesale
//      reproducing another site's specific curated write-up of them is a
//      real risk on a commercial site. Templates here are sourced from
//      official/first-party developer documentation wherever it exists;
//      see each template's `sourceNote`/`sourceUrl`. `scripts/update-game-configs.ts`
//      documents exactly which games that automation can and can't cover.
//
//   2. Maintenance: updating a default value is a one-line edit to a data
//      file, not a code change.
//
// Rendering is a single generic function (renderConfigTemplate, below) --
// it works identically across every file format (JSON, INI, cfg, plain
// text) because it's pure text substitution: the template already contains
// the correct quoting/delimiters for its format, so only the sentinel
// tokens need swapping.

export type ConfigFieldType = "text" | "number" | "boolean" | "select";

export type ConfigFieldOption = {
  value: string;
  label: string;
};

// How a field's value should be escaped before being substituted into the
// template, based on what surrounds the {{token}} in that specific file:
//   "none"   - unquoted context (properties/ini `key=value`, plain commands)
//   "double" - wrapped in plain double quotes (`"value"`) in cfg/ini/script files
//   "json"   - wrapped in JSON double quotes (needs full JSON string escaping)
export type ConfigFieldQuoting = "none" | "double" | "json";

export type ConfigField = {
  id: string;
  label: string;
  type: ConfigFieldType;
  defaultValue: string | number | boolean;
  options?: ConfigFieldOption[];
  helpText?: string;
  quoting?: ConfigFieldQuoting;
  // Boolean fields: literal words used for [true, false] in this file's
  // format, e.g. ["true","false"], ["True","False"], or ["1","0"].
  booleanWords?: [string, string];
};

export type ConfigValues = Record<string, string | number | boolean>;

export type GameConfigTemplate = {
  gameId: string;
  configFileLabel: string;
  fileName: string | ((values: ConfigValues) => string);
  description: string;
  sourceNote: string;
  sourceUrl?: string;
  // Path under data/game-configs/ holding the raw sentinel-tagged template,
  // or a function of the current values for templates with more than one
  // variant (Valheim's Windows/Linux launch script).
  dataFile: string | ((values: ConfigValues) => string);
  fields: ConfigField[];
};

function escapeForQuoting(value: string, quoting: ConfigFieldQuoting): string {
  if (quoting === "json") {
    // Produces a fully-escaped JSON string body without the wrapping quotes,
    // since the template already supplies those.
    return JSON.stringify(value).slice(1, -1);
  }

  if (quoting === "double") {
    return value.replace(/"/g, '\\"');
  }

  return value;
}

// Substitutes {{field.id}} tokens in a raw template with the current form
// values. Identical logic regardless of the underlying file format.
export function renderConfigTemplate(
  template: GameConfigTemplate,
  rawTemplate: string,
  values: ConfigValues,
): string {
  let output = rawTemplate;

  for (const field of template.fields) {
    const token = `{{${field.id}}}`;

    if (!output.includes(token)) {
      continue;
    }

    let replacement: string;

    if (field.type === "boolean") {
      const [trueWord, falseWord] = field.booleanWords ?? ["true", "false"];
      replacement = values[field.id] ? trueWord : falseWord;
    } else if (field.type === "number") {
      const numberValue = Number(values[field.id]);
      replacement = String(Number.isFinite(numberValue) ? numberValue : 0);
    } else {
      replacement = escapeForQuoting(
        String(values[field.id] ?? ""),
        field.quoting ?? "none",
      );
    }

    output = output.split(token).join(replacement);
  }

  return output;
}

const templates: GameConfigTemplate[] = [
  {
    gameId: "minecraft",
    configFileLabel: "server.properties",
    description:
      "The most commonly changed settings from server.properties. Mojang doesn't publish these as a single official reference table; the values below reflect the server software's actual shipped defaults.",
    sourceNote:
      "Mojang's official Minecraft Java Edition server download (minecraft.net/download/server) generates this file; defaults confirmed against it.",
    sourceUrl: "https://www.minecraft.net/en-us/download/server",
    dataFile: "minecraft.properties",
    fields: [
      { id: "motd", label: "MOTD", type: "text", defaultValue: "A Minecraft Server" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 20 },
      {
        id: "difficulty",
        label: "Difficulty",
        type: "select",
        defaultValue: "easy",
        options: [
          { value: "peaceful", label: "Peaceful" },
          { value: "easy", label: "Easy" },
          { value: "normal", label: "Normal" },
          { value: "hard", label: "Hard" },
        ],
      },
      {
        id: "gamemode",
        label: "Game Mode",
        type: "select",
        defaultValue: "survival",
        options: [
          { value: "survival", label: "Survival" },
          { value: "creative", label: "Creative" },
          { value: "adventure", label: "Adventure" },
          { value: "spectator", label: "Spectator" },
        ],
      },
      { id: "pvp", label: "Allow PvP", type: "boolean", defaultValue: true },
      { id: "white_list", label: "Whitelist Only", type: "boolean", defaultValue: false },
      { id: "online_mode", label: "Online Mode (Verify Purchased Accounts)", type: "boolean", defaultValue: true },
      { id: "server_port", label: "Server Port", type: "number", defaultValue: 25565 },
    ],
    fileName: () => "server.properties",
  },

  {
    gameId: "minecraft-bedrock",
    configFileLabel: "server.properties",
    description:
      "The most commonly changed settings from the Bedrock Dedicated Server's server.properties.",
    sourceNote: "Mojang's official Bedrock Dedicated Server download page.",
    sourceUrl: "https://www.minecraft.net/en-us/download/server/bedrock",
    dataFile: "minecraft-bedrock.properties",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "Dedicated Server" },
      {
        id: "gamemode",
        label: "Game Mode",
        type: "select",
        defaultValue: "survival",
        options: [
          { value: "survival", label: "Survival" },
          { value: "creative", label: "Creative" },
          { value: "adventure", label: "Adventure" },
        ],
      },
      {
        id: "difficulty",
        label: "Difficulty",
        type: "select",
        defaultValue: "easy",
        options: [
          { value: "peaceful", label: "Peaceful" },
          { value: "easy", label: "Easy" },
          { value: "normal", label: "Normal" },
          { value: "hard", label: "Hard" },
        ],
      },
      { id: "allow_cheats", label: "Allow Cheats", type: "boolean", defaultValue: false },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 10 },
      { id: "server_port", label: "Server Port (IPv4)", type: "number", defaultValue: 19132 },
      { id: "level_name", label: "Level Name", type: "text", defaultValue: "Bedrock level" },
    ],
    fileName: () => "server.properties",
  },

  {
    gameId: "ark-survival-evolved",
    configFileLabel: "GameUserSettings.ini",
    description:
      "The [ServerSettings] and [SessionSettings] entries almost every server sets first. ARK has hundreds of additional tuning options not covered here.",
    sourceNote: "ARK Official Community Wiki server configuration reference (community-documented; Studio Wildcard doesn't publish a formal spec).",
    sourceUrl: "https://ark.wiki.gg/wiki/Server_configuration",
    dataFile: "ark-survival-evolved.ini",
    fields: [
      { id: "session_name", label: "Session Name", type: "text", defaultValue: "My ARK Server" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "server_admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 70 },
      { id: "server_pve", label: "PvE (Disable PvP)", type: "boolean", defaultValue: false, booleanWords: ["True", "False"] },
      { id: "xp_multiplier", label: "XP Multiplier", type: "number", defaultValue: 1 },
    ],
    fileName: () => "GameUserSettings.ini",
  },

  {
    gameId: "rust",
    configFileLabel: "server.cfg",
    description:
      "Console commands (\"convars\") for a Rust server. These can go in server.cfg (applied after boot) or be passed as +flags on the command line (applied at boot).",
    sourceNote: "Facepunch's official Rust Dedicated Server documentation.",
    sourceUrl: "https://developer.valvesoftware.com/wiki/Rust_Dedicated_Server",
    dataFile: "rust.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My Rust Server", quoting: "double" },
      { id: "description", label: "Description", type: "text", defaultValue: "", quoting: "double" },
      { id: "maxplayers", label: "Max Players", type: "number", defaultValue: 50 },
      { id: "worldsize", label: "World Size", type: "number", defaultValue: 3500 },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "", quoting: "double" },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "hytale",
    configFileLabel: "config.json",
    description:
      "The main server config.json file, at the root of the server folder. Hytale entered Early Access in January 2026, so this covers the settings documented so far.",
    sourceNote: "Hypixel Studios' official Hytale Server Manual.",
    sourceUrl: "https://support.hytale.com/hc/en-us/articles/45326769420827-Hytale-Server-Manual",
    dataFile: "hytale.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "Hytale Server", quoting: "json" },
      { id: "motd", label: "MOTD", type: "text", defaultValue: "", quoting: "json" },
      { id: "password", label: "Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 100 },
      { id: "max_view_radius", label: "Max View Radius (Chunks)", type: "number", defaultValue: 32 },
      {
        id: "game_mode",
        label: "Default Game Mode",
        type: "select",
        defaultValue: "Adventure",
        options: [
          { value: "Adventure", label: "Adventure" },
          { value: "Creative", label: "Creative" },
        ],
      },
    ],
    fileName: () => "config.json",
  },

  {
    gameId: "starbound",
    configFileLabel: "starbound_server.config",
    description: "The JSON server config, normally found in the storage folder next to your server binary.",
    sourceNote: "Community-documented; Chucklefish doesn't publish a formal reference for this file.",
    dataFile: "starbound.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "Starbound Server", quoting: "json" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 8 },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "allow_anonymous_connections", label: "Allow Anonymous Connections", type: "boolean", defaultValue: true },
    ],
    fileName: () => "starbound_server.config",
  },

  {
    gameId: "terraria",
    configFileLabel: "serverconfig.txt",
    description:
      "Passed to TerrariaServer with -config serverconfig.txt to skip the interactive setup prompts. This generates a new world on first run -- point \"world=\" at an existing .wld file instead if you'd rather load one.",
    sourceNote: "Official Terraria Wiki server setup guide.",
    sourceUrl: "https://terraria.org/",
    dataFile: "terraria.txt",
    fields: [
      { id: "worldname", label: "World Name", type: "text", defaultValue: "World" },
      {
        id: "autocreate",
        label: "World Size (New World)",
        type: "select",
        defaultValue: "2",
        options: [
          { value: "1", label: "Small" },
          { value: "2", label: "Medium" },
          { value: "3", label: "Large" },
        ],
      },
      {
        id: "difficulty",
        label: "Difficulty",
        type: "select",
        defaultValue: "0",
        options: [
          { value: "0", label: "Classic" },
          { value: "1", label: "Expert" },
          { value: "2", label: "Master" },
          { value: "3", label: "Journey" },
        ],
      },
      { id: "maxplayers", label: "Max Players", type: "number", defaultValue: 16 },
      { id: "port", label: "Port", type: "number", defaultValue: 7777 },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "motd", label: "MOTD", type: "text", defaultValue: "" },
    ],
    fileName: () => "serverconfig.txt",
  },

  {
    gameId: "valheim",
    configFileLabel: "start_server script",
    description:
      "Valheim isn't configured through a settings file -- its dedicated server is launched with command-line flags. This generates the launcher script for your target OS.",
    sourceNote: "Valheim Wiki dedicated server setup guide and Iron Gate's shipped start_headless_server script.",
    dataFile: (values) =>
      values.target_os === "linux" ? "valheim-linux.sh" : "valheim-windows.bat",
    fields: [
      {
        id: "target_os",
        label: "Target OS",
        type: "select",
        defaultValue: "windows",
        options: [
          { value: "windows", label: "Windows (.bat)" },
          { value: "linux", label: "Linux (.sh)" },
        ],
      },
      { id: "name", label: "Server Name", type: "text", defaultValue: "My Valheim Server", quoting: "double" },
      { id: "world", label: "World Name", type: "text", defaultValue: "Dedicated", quoting: "double" },
      { id: "port", label: "Port", type: "number", defaultValue: 2456 },
      { id: "password", label: "Password (Min. 5 Characters)", type: "text", defaultValue: "", quoting: "double" },
    ],
    fileName: (values) =>
      values.target_os === "linux" ? "start_server.sh" : "start_server.bat",
  },

  {
    gameId: "arma-3",
    configFileLabel: "server.cfg",
    description: "The main dedicated-server config file, referenced with -config=server.cfg on startup.",
    sourceNote: "Bohemia Interactive's own official community wiki (community.bistudio.com), hosted on Bohemia's own domain.",
    sourceUrl: "https://community.bistudio.com/wiki/Arma_3:_Server_Config_File",
    dataFile: "arma-3.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My Arma 3 Server", quoting: "double" },
      { id: "password", label: "Join Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "password_admin", label: "Admin Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 32 },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "team-fortress-2",
    configFileLabel: "server.cfg",
    description:
      "Executed automatically on startup from tf/cfg/server.cfg. The actual player-slot count is set with a -maxplayers N launch flag, not in this file.",
    sourceNote: "Official TF2 Wiki and Valve Developer Community (Valve's own official documentation).",
    sourceUrl: "https://developer.valvesoftware.com/wiki/Server.cfg",
    dataFile: "team-fortress-2.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My TF2 Server", quoting: "double" },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "sv_password", label: "Join Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "sv_visiblemaxplayers", label: "Visible Max Players", type: "number", defaultValue: 24 },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "bannerlord",
    configFileLabel: "ds_config.txt",
    description:
      "A dedicated-server config file of plain console commands, one per line, run in order at startup.",
    sourceNote: "TaleWorlds' own official Bannerlord modding documentation.",
    sourceUrl: "https://moddocs.bannerlord.com/multiplayer/hosting_server/",
    dataFile: "bannerlord.txt",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Bannerlord Server" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      {
        id: "game_type",
        label: "Game Type",
        type: "select",
        defaultValue: "TeamDeathmatch",
        options: [
          { value: "TeamDeathmatch", label: "Team Deathmatch" },
          { value: "Siege", label: "Siege" },
          { value: "Captain", label: "Captain" },
          { value: "Skirmish", label: "Skirmish" },
          { value: "Duel", label: "Duel" },
          { value: "Battle", label: "Battle" },
        ],
      },
    ],
    fileName: () => "ds_config.txt",
  },

  {
    gameId: "garrys-mod",
    configFileLabel: "server.cfg",
    description:
      "Executed automatically on startup from garrysmod/cfg/server.cfg. The gamemode is chosen with a +gamemode launch flag, not in this file.",
    sourceNote: "Facepunch's own official Garry's Mod wiki.",
    sourceUrl: "https://wiki.facepunch.com/gmod/Downloading_a_Dedicated_Server",
    dataFile: "garrys-mod.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My Garry's Mod Server", quoting: "double" },
      { id: "sv_password", label: "Join Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "", quoting: "double" },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "palworld",
    configFileLabel: "PalWorldSettings.ini",
    description:
      "Palworld packs every setting onto a single OptionSettings=(...) line -- a stray line break or misplaced comma will stop the file from loading.",
    sourceNote: "Community-documented (Pocketpair doesn't publish a formal reference); verified against real shipped file structure.",
    dataFile: "palworld.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "Default Palworld Server", quoting: "double" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "server_player_max_num", label: "Max Players", type: "number", defaultValue: 32 },
      {
        id: "difficulty",
        label: "Difficulty",
        type: "select",
        defaultValue: "None",
        options: [
          { value: "None", label: "Normal" },
          { value: "Casual", label: "Casual" },
          { value: "Hard", label: "Hard" },
        ],
      },
    ],
    fileName: () => "PalWorldSettings.ini",
  },

  {
    gameId: "project-zomboid",
    configFileLabel: "servertest.ini",
    description:
      "Generated in Zomboid/Server the first time you run the server under a given name; stop the server, edit it, then restart.",
    sourceNote: "Community-documented; The Indie Stone doesn't publish a formal reference for this file.",
    dataFile: "project-zomboid.ini",
    fields: [
      { id: "public_name", label: "Public Server Name", type: "text", defaultValue: "My Zomboid Server" },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 16 },
      { id: "pvp", label: "Allow PvP", type: "boolean", defaultValue: true },
      { id: "public", label: "List Publicly", type: "boolean", defaultValue: false },
    ],
    fileName: () => "servertest.ini",
  },

  {
    gameId: "eco",
    configFileLabel: "Network.eco",
    description: "The main server-identity and networking config, found in the Configs folder.",
    sourceNote: "Eco's own official wiki, hosted on Strange Loop Games' own play.eco domain.",
    sourceUrl: "https://wiki.play.eco/en/Server_Configuration/Network.eco",
    dataFile: "eco.json",
    fields: [
      { id: "description", label: "Server Name / Description", type: "text", defaultValue: "Eco Server", quoting: "json" },
      { id: "password", label: "Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "public_server", label: "List Publicly", type: "boolean", defaultValue: true },
      { id: "max_connections", label: "Max Connections (-1 = Unlimited)", type: "number", defaultValue: -1 },
    ],
    fileName: () => "Network.eco",
  },

  {
    gameId: "dragonwilds",
    configFileLabel: "DedicatedServer.ini",
    description:
      "Found under Saved/Config/WindowsServer (or Linux) in the server install. Jagex's wiki names these settings but doesn't publish a literal example of the file, so double-check key names against the official wiki link before relying on this.",
    sourceNote:
      "RuneScape: Dragonwilds Wiki (community-maintained, officially endorsed by Jagex, but not Jagex-operated) names these settings -- the exact key=value syntax wasn't independently confirmed against a real file. Lower confidence than the other templates here.",
    sourceUrl: "https://dragonwilds.runescape.wiki/w/Dedicated_Servers",
    dataFile: "dragonwilds.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Dragonwilds Server" },
      { id: "default_world_name", label: "Default World Name", type: "text", defaultValue: "World" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      { id: "world_password", label: "World Password (Optional)", type: "text", defaultValue: "" },
    ],
    fileName: () => "DedicatedServer.ini",
  },

  {
    gameId: "7-days-to-die",
    configFileLabel: "serverconfig.xml",
    description:
      "The main dedicated-server config, next to the server executable. Loaded automatically on startup.",
    sourceNote:
      "7 Days to Die Wiki server configuration reference (community-documented; The Fun Pimps don't publish a formal spec).",
    sourceUrl: "https://7daystodie.wiki.gg/wiki/Server:_serverconfig.xml",
    dataFile: "7-days-to-die.xml",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My 7 Days to Die Server" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      {
        id: "server_visibility",
        label: "Server Visibility",
        type: "select",
        defaultValue: "2",
        options: [
          { value: "2", label: "Public" },
          { value: "1", label: "Friends Only" },
          { value: "0", label: "Not Listed" },
        ],
      },
      { id: "server_port", label: "Server Port", type: "number", defaultValue: 26900 },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 8 },
      {
        id: "game_difficulty",
        label: "Game Difficulty",
        type: "select",
        defaultValue: "2",
        options: [
          { value: "0", label: "Easiest" },
          { value: "1", label: "Easy" },
          { value: "2", label: "Medium" },
          { value: "3", label: "Hard" },
          { value: "4", label: "Very Hard" },
          { value: "5", label: "Insane" },
        ],
      },
      { id: "telnet_password", label: "Telnet Admin Password", type: "text", defaultValue: "" },
    ],
    fileName: () => "serverconfig.xml",
  },

  {
    gameId: "ark-survival-ascended",
    configFileLabel: "GameUserSettings.ini",
    description:
      "The [ServerSettings] and [SessionSettings] entries most servers set first. The player cap isn't set in this file -- Survival Ascended reads it from the -WinLiveMaxPlayers launch parameter instead.",
    sourceNote:
      "ARK Official Community Wiki server configuration reference, covering Survival Ascended's GameUserSettings.ini (Studio Wildcard doesn't publish a formal spec).",
    sourceUrl: "https://ark.wiki.gg/wiki/Server_configuration",
    dataFile: "ark-survival-ascended.ini",
    fields: [
      { id: "session_name", label: "Session Name", type: "text", defaultValue: "My ARK Server" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      { id: "server_pve", label: "PvE (Disable PvP)", type: "boolean", defaultValue: false, booleanWords: ["True", "False"] },
      { id: "xp_multiplier", label: "XP Multiplier", type: "number", defaultValue: 1 },
    ],
    fileName: () => "GameUserSettings.ini",
  },

  {
    gameId: "conan-exiles",
    configFileLabel: "ServerSettings.ini",
    description:
      "The behaviour toggles Conan Exiles Dedicated Server generates by default under [ServerSettings]. The server name and PvE/PvP mode aren't set here -- they come from launch parameters and which server module you run.",
    sourceNote:
      "Reflects the ServerSettings.ini structure the Conan Exiles Dedicated Server itself generates; cross-checked against a real shipped copy of the file.",
    sourceUrl: "https://forums.funcom.com/c/conan-exiles/dedicated-servers",
    dataFile: "conan-exiles.ini",
    fields: [
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "motd", label: "Message of the Day", type: "text", defaultValue: "" },
      { id: "creative_mode", label: "Creative Mode", type: "boolean", defaultValue: false, booleanWords: ["True", "False"] },
      { id: "battleye_enabled", label: "BattlEye Anti-Cheat", type: "boolean", defaultValue: false, booleanWords: ["True", "False"] },
      { id: "kick_afk_time", label: "Kick AFK Time (Seconds)", type: "number", defaultValue: 2700 },
      { id: "max_allowed_ping", label: "Max Allowed Ping (0 = Unlimited)", type: "number", defaultValue: 0 },
    ],
    fileName: () => "ServerSettings.ini",
  },

  {
    gameId: "core-keeper",
    configFileLabel: "ServerConfig.json",
    description:
      "Core Keeper's main dedicated-server settings file. Password, IP and port aren't set here -- they're passed as -password, -ip and -port launch flags instead.",
    sourceNote:
      "Community-documented (Pugstorm doesn't publish a formal reference); confirmed against the real shipped ServerConfig.json structure.",
    sourceUrl: "https://core-keeper.fandom.com/wiki/Server_Config",
    dataFile: "core-keeper.json",
    fields: [
      { id: "world_name", label: "World Name", type: "text", defaultValue: "Core Keeper Server", quoting: "json" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 8 },
      { id: "world_slot", label: "World Slot (0-29)", type: "number", defaultValue: 0 },
      {
        id: "world_mode",
        label: "World Mode",
        type: "select",
        defaultValue: "0",
        options: [
          { value: "0", label: "Normal" },
          { value: "1", label: "Hard" },
          { value: "2", label: "Creative" },
          { value: "4", label: "Casual" },
        ],
      },
      { id: "world_seed", label: "World Seed (0 = Random)", type: "number", defaultValue: 0 },
    ],
    fileName: () => "ServerConfig.json",
  },

  {
    gameId: "counter-strike-2",
    configFileLabel: "server.cfg",
    description:
      "Executed automatically on startup from game/csgo/cfg/server.cfg. The player-slot count is a normal convar here, unlike some older Source games.",
    sourceNote: "Valve's own official Counter-Strike 2 Dedicated Servers documentation.",
    sourceUrl: "https://developer.valvesoftware.com/wiki/Counter-Strike_2/Dedicated_Servers",
    dataFile: "counter-strike-2.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My CS2 Server", quoting: "double" },
      { id: "sv_password", label: "Join Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "mp_maxplayers", label: "Max Players", type: "number", defaultValue: 10 },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "dayz-standalone",
    configFileLabel: "serverDZ.cfg",
    description: "The main general-config file, referenced on startup with -config=serverDZ.cfg.",
    sourceNote: "Bohemia Interactive's own official community wiki (community.bistudio.com), hosted on Bohemia's own domain.",
    sourceUrl: "https://community.bistudio.com/wiki/DayZ:Server_Configuration",
    dataFile: "dayz-standalone.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My DayZ Server" },
      { id: "password", label: "Join Password", type: "text", defaultValue: "" },
      { id: "password_admin", label: "Admin Password (#login)", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 60 },
      { id: "verify_signatures", label: "Verify Mod Signatures (0-2)", type: "number", defaultValue: 2 },
      { id: "disable_3rd_person", label: "Disable Third Person View", type: "boolean", defaultValue: false, booleanWords: ["1", "0"] },
    ],
    fileName: () => "serverDZ.cfg",
  },

  {
    gameId: "dont-starve-together",
    configFileLabel: "cluster.ini",
    description:
      "The main cluster identity and gameplay file, in <Your Klei Folder>/MyDediServer/cluster.ini. A DST cluster also needs a cluster_token.txt (from your Klei account) that this generator doesn't produce.",
    sourceNote:
      "Klei's own official Dedicated Server Command Line Options Guide, cross-checked against real shipped cluster.ini files (Klei doesn't publish every cluster.ini key in one single reference).",
    sourceUrl: "https://support.klei.com/hc/en-us/articles/360029556192-Dedicated-Server-Command-Line-Options-Guide",
    dataFile: "dont-starve-together.ini",
    fields: [
      { id: "cluster_name", label: "Server Name", type: "text", defaultValue: "My DST Server" },
      { id: "cluster_description", label: "Server Description", type: "text", defaultValue: "" },
      { id: "cluster_password", label: "Server Password", type: "text", defaultValue: "" },
      {
        id: "cluster_intention",
        label: "Server Intention",
        type: "select",
        defaultValue: "cooperative",
        options: [
          { value: "cooperative", label: "Cooperative" },
          { value: "social", label: "Social" },
          { value: "competitive", label: "Competitive" },
          { value: "madness", label: "Madness" },
        ],
      },
      {
        id: "game_mode",
        label: "Game Mode",
        type: "select",
        defaultValue: "survival",
        options: [
          { value: "survival", label: "Survival" },
          { value: "endless", label: "Endless" },
          { value: "wilderness", label: "Wilderness (No Resurrection)" },
        ],
      },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 6 },
      { id: "pvp", label: "Allow PvP", type: "boolean", defaultValue: false },
      { id: "pause_when_empty", label: "Pause When Empty", type: "boolean", defaultValue: true },
    ],
    fileName: () => "cluster.ini",
  },

  {
    gameId: "enshrouded",
    configFileLabel: "enshrouded_server.json",
    description:
      "The main dedicated-server config, next to the server executable. gameSettings is only read when gameSettingsPreset is \"Custom\" -- any other preset value overrides it with a bundled difficulty preset.",
    sourceNote: "Keen Games' own official server documentation, hosted on Keen Games' own support domain.",
    sourceUrl: "https://enshrouded.zendesk.com/hc/en-us/articles/20453241249821-Server-Gameplay-Settings",
    dataFile: "enshrouded.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "Enshrouded Server", quoting: "json" },
      { id: "query_port", label: "Query Port", type: "number", defaultValue: 15637 },
      { id: "slot_count", label: "Max Players (Up To 16)", type: "number", defaultValue: 16 },
      {
        id: "game_settings_preset",
        label: "Difficulty Preset",
        type: "select",
        defaultValue: "Default",
        options: [
          { value: "Default", label: "Default" },
          { value: "Relaxed", label: "Relaxed" },
          { value: "Hard", label: "Hard" },
          { value: "Survival", label: "Survival" },
          { value: "Custom", label: "Custom" },
        ],
      },
      { id: "admin_password", label: "Admin Group Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "friend_password", label: "Friend Group Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "guest_password", label: "Guest Group Password", type: "text", defaultValue: "", quoting: "json" },
    ],
    fileName: () => "enshrouded_server.json",
  },

  {
    gameId: "satisfactory",
    configFileLabel: "Engine.ini",
    description:
      "Satisfactory's server identity (name) and admin/client passwords aren't set via a config file -- they're claimed through the in-game Server Manager the first time you connect to a fresh server. This covers the two settings that are file-based: network tick rate and the autosave rotation count.",
    sourceNote:
      "Community-documented (Coffee Stain doesn't publish a config-file reference for this tweak, since it's normally done through the Server Manager); cross-checked against real shipped Engine.ini edits.",
    dataFile: "satisfactory.ini",
    fields: [
      { id: "tick_rate", label: "Server Tick Rate", type: "number", defaultValue: 30 },
      { id: "autosave_count", label: "Rotating Autosave Count", type: "number", defaultValue: 5 },
    ],
    fileName: () => "Engine.ini",
  },

  {
    gameId: "v-rising",
    configFileLabel: "ServerHostSettings.json",
    description:
      "The server identity and network file, in the persistent-data path's Settings folder. Gameplay rules (PvP/PvE, multipliers) live in the separate ServerGameSettings.json, not covered here.",
    sourceNote: "Stunlock Studios' own official V Rising Dedicated Server Instructions, published on Stunlock's own GitHub.",
    sourceUrl: "https://github.com/StunlockStudios/vrising-dedicated-server-instructions",
    dataFile: "v-rising.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My V Rising Server", quoting: "json" },
      { id: "description", label: "Server Description", type: "text", defaultValue: "", quoting: "json" },
      { id: "password", label: "Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "max_connected_users", label: "Max Players", type: "number", defaultValue: 40 },
      { id: "list_on_master_server", label: "List Publicly", type: "boolean", defaultValue: true },
    ],
    fileName: () => "ServerHostSettings.json",
  },

  {
    gameId: "factorio",
    configFileLabel: "server-settings.json",
    description: "Passed to the server binary with --server-settings server-settings.json.",
    sourceNote: "Wube's own official example file, published on Wube's own GitHub (factorio-data).",
    sourceUrl: "https://github.com/wube/factorio-data/blob/master/server-settings.example.json",
    dataFile: "factorio.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Factorio Server", quoting: "json" },
      { id: "description", label: "Description", type: "text", defaultValue: "", quoting: "json" },
      { id: "max_players", label: "Max Players (0 = Unlimited)", type: "number", defaultValue: 0 },
      { id: "public_visible", label: "List on Factorio Matchmaking", type: "boolean", defaultValue: true },
      { id: "game_password", label: "Server Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "autosave_interval", label: "Autosave Interval (Minutes)", type: "number", defaultValue: 5 },
    ],
    fileName: () => "server-settings.json",
  },

  {
    gameId: "squad",
    configFileLabel: "Server.cfg",
    description: "The main server-identity file, in SquadGame/ServerConfig/Server.cfg.",
    sourceNote: "Official Squad Wiki server configuration reference (community-maintained on Fandom; Offworld Industries doesn't publish a formal spec of this file).",
    sourceUrl: "https://squad.fandom.com/wiki/Server_Configuration",
    dataFile: "squad.cfg",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Squad Server" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 100 },
      { id: "num_reserved_slots", label: "Reserved Admin Slots", type: "number", defaultValue: 0 },
      { id: "should_advertise", label: "List Publicly", type: "boolean", defaultValue: true, booleanWords: ["True", "False"] },
    ],
    fileName: () => "Server.cfg",
  },

  {
    gameId: "barotrauma",
    configFileLabel: "serversettings.xml",
    description:
      "The main dedicated-server settings file, in the Barotrauma root folder. Always stop the server before editing -- it overwrites this file on shutdown, discarding edits made while it was running.",
    sourceNote:
      "Cross-checked against multiple hosting providers' generated copies of this file rather than a single fetchable page; attribute casing has lower confidence than this generator's other games, so double-check against your own server's generated copy before relying on it.",
    sourceUrl: "https://barotraumagame.com/wiki/Serversettings.xml",
    dataFile: "barotrauma.xml",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Barotrauma Server" },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 16 },
      { id: "public_visible", label: "List Publicly", type: "boolean", defaultValue: true },
      {
        id: "game_mode",
        label: "Game Mode",
        type: "select",
        defaultValue: "mission",
        options: [
          { value: "mission", label: "Mission" },
          { value: "campaign", label: "Campaign" },
          { value: "sandbox", label: "Sandbox" },
          { value: "pvp", label: "PvP" },
        ],
      },
    ],
    fileName: () => "serversettings.xml",
  },

  {
    gameId: "insurgency-sandstorm",
    configFileLabel: "Game.ini",
    description:
      "Covers the server-identity fields most hosts set first. Game.ini also carries dozens of round-timing and bot-difficulty settings not covered here -- see the setup guide for the rest.",
    sourceNote:
      "Community-documented (New World Interactive doesn't publish a single reference file); cross-checked against real shipped Game.ini examples.",
    dataFile: "insurgency-sandstorm.ini",
    fields: [
      { id: "server_hostname", label: "Server Name", type: "text", defaultValue: "My Sandstorm Server" },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "" },
    ],
    fileName: () => "Game.ini",
  },

  {
    gameId: "killing-floor-2",
    configFileLabel: "PCServer-KFGame.ini",
    description: "The main server-identity and access-control file, in KFGame/Config.",
    sourceNote: "Tripwire Interactive's own official Dedicated Server documentation, hosted on Tripwire's own domain.",
    sourceUrl: "https://wiki.tripwireinteractive.com/index.php?title=Dedicated_Server_(Killing_Floor_2)",
    dataFile: "killing-floor-2.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "Killing Floor 2 Server" },
      { id: "short_name", label: "Short Name", type: "text", defaultValue: "KFServer" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      { id: "game_password", label: "Join Password", type: "text", defaultValue: "" },
    ],
    fileName: () => "PCServer-KFGame.ini",
  },

  {
    gameId: "left-4-dead-2",
    configFileLabel: "server.cfg",
    description: "Executed automatically on startup with +exec server.cfg.",
    sourceNote: "Valve's own official Left 4 Dead 2 console commands and variables reference.",
    sourceUrl: "https://developer.valvesoftware.com/wiki/List_of_Left_4_Dead_2_console_commands_and_variables",
    dataFile: "left-4-dead-2.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My L4D2 Server", quoting: "double" },
      { id: "sv_password", label: "Join Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "", quoting: "double" },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "space-engineers",
    configFileLabel: "SpaceEngineers-Dedicated.cfg",
    description: "The main dedicated-server config, alongside the world save folder it points to via LoadWorld.",
    sourceNote:
      "Community-documented (Keen Software House doesn't publish a formal reference); cross-checked against a real shipped SpaceEngineers-Dedicated.cfg.",
    dataFile: "space-engineers.cfg",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Space Engineers Server" },
      { id: "world_name", label: "World Name", type: "text", defaultValue: "New World" },
      {
        id: "game_mode",
        label: "Game Mode",
        type: "select",
        defaultValue: "Survival",
        options: [
          { value: "Survival", label: "Survival" },
          { value: "Creative", label: "Creative" },
        ],
      },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 16 },
      {
        id: "online_mode",
        label: "Visibility",
        type: "select",
        defaultValue: "PUBLIC",
        options: [
          { value: "PUBLIC", label: "Public" },
          { value: "PRIVATE", label: "Private" },
          { value: "FRIENDS", label: "Friends Only" },
        ],
      },
    ],
    fileName: () => "SpaceEngineers-Dedicated.cfg",
  },

  {
    gameId: "unturned",
    configFileLabel: "Commands.dat",
    description: "A list of server console commands, one per line, run automatically on startup.",
    sourceNote: "Cross-checked against Smartly Dressed Games' own server-hosting documentation.",
    sourceUrl: "https://docs.smartlydressedgames.com/en/stable/servers/server-hosting.html",
    dataFile: "unturned.dat",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Unturned Server" },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 24 },
      { id: "map", label: "Map", type: "text", defaultValue: "PEI" },
      {
        id: "perspective",
        label: "Camera Perspective",
        type: "select",
        defaultValue: "Both",
        options: [
          { value: "Both", label: "Both (Player Choice)" },
          { value: "First", label: "First Person Only" },
          { value: "Third", label: "Third Person Only" },
        ],
      },
    ],
    fileName: () => "Commands.dat",
  },

  {
    gameId: "the-forest",
    configFileLabel: "dedicatedserver.cfg",
    description:
      "The main JSON server config, next to the dedicated server executable. Not to be confused with Sons of the Forest's separate config format.",
    sourceNote:
      "Community-documented (Endnight Games doesn't publish a formal reference for this file); exact key names weren't independently confirmed against a fresh install, so double-check against your own server's generated copy before relying on it.",
    dataFile: "the-forest.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Forest Server", quoting: "json" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 4 },
      {
        id: "difficulty",
        label: "Difficulty",
        type: "select",
        defaultValue: "Normal",
        options: [
          { value: "Peaceful", label: "Peaceful" },
          { value: "Normal", label: "Normal" },
          { value: "Hard", label: "Hard" },
        ],
        quoting: "json",
      },
    ],
    fileName: () => "dedicatedserver.cfg",
  },

  {
    gameId: "scum",
    configFileLabel: "ServerSettings.ini",
    description:
      "SCUM has 400+ settings across 6 sections; this covers the [General] server-identity block most people set first.",
    sourceNote:
      "Community-documented (Gamepires doesn't publish a formal reference); cross-checked against real shipped ServerSettings.ini examples.",
    dataFile: "scum.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My SCUM Server" },
      { id: "server_description", label: "Server Description", type: "text", defaultValue: "" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 64 },
      {
        id: "playstyle",
        label: "Playstyle",
        type: "select",
        defaultValue: "PVP",
        options: [
          { value: "PVP", label: "PvP" },
          { value: "PVE", label: "PvE" },
        ],
      },
      { id: "welcome_message", label: "Welcome Message", type: "text", defaultValue: "" },
    ],
    fileName: () => "ServerSettings.ini",
  },

  {
    gameId: "risk-of-rain-2",
    configFileLabel: "server.cfg",
    description: "Placed in Risk of Rain 2_Data/Config/server.cfg and loaded automatically on startup.",
    sourceNote:
      "Community-documented (Hopoo Games/Gearbox don't publish a formal reference); cross-checked against real shipped server.cfg examples.",
    dataFile: "risk-of-rain-2.cfg",
    fields: [
      { id: "hostname", label: "Server Name", type: "text", defaultValue: "My Risk of Rain 2 Dedicated Server", quoting: "double" },
      { id: "password", label: "Join Password", type: "text", defaultValue: "", quoting: "double" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 4 },
      { id: "public_visible", label: "List Publicly", type: "boolean", defaultValue: true, booleanWords: ["1", "0"] },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "mordhau",
    configFileLabel: "Game.ini",
    description: "The [/Script/Mordhau.MordhauGameSession] entries most servers set first.",
    sourceNote: "Community-documented (Triternion doesn't publish a formal reference); cross-checked against real shipped Game.ini examples.",
    dataFile: "mordhau.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Mordhau Server" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 24 },
    ],
    fileName: () => "Game.ini",
  },

  {
    gameId: "astroneer",
    configFileLabel: "AstroServerSettings.ini",
    description: "The main dedicated-server settings file, alongside Engine.ini in the server's saved config folder.",
    sourceNote: "System Era Softworks' own official Astroneer dedicated-server documentation, hosted on Astroneer's own domain.",
    sourceUrl: "https://astroneer.space/dedicatedserver/",
    dataFile: "astroneer.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Astroneer Server" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "max_framerate", label: "Max Server Framerate", type: "number", defaultValue: 30 },
      { id: "public_ip", label: "Public IP", type: "text", defaultValue: "" },
      { id: "owner_name", label: "Owner Steam Username (Grants Admin)", type: "text", defaultValue: "" },
    ],
    fileName: () => "AstroServerSettings.ini",
  },

  {
    gameId: "icarus",
    configFileLabel: "ServerSettings.ini",
    description: "Generated on first launch alongside the server executable.",
    sourceNote: "RocketWerkz's own official Icarus Dedicated Server repository.",
    sourceUrl: "https://github.com/RocketWerkz/IcarusDedicatedServer",
    dataFile: "icarus.ini",
    fields: [
      { id: "session_name", label: "Session Name", type: "text", defaultValue: "My Icarus Server" },
      { id: "join_password", label: "Join Password", type: "text", defaultValue: "" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 8 },
    ],
    fileName: () => "ServerSettings.ini",
  },

  {
    gameId: "sons-of-the-forest",
    configFileLabel: "dedicatedserver.cfg.json",
    description: "The single JSON config file, placed in the server's configurations folder as dedicatedserver.cfg.",
    sourceNote: "Community-documented (Endnight Games doesn't publish a formal reference); cross-checked against real shipped dedicatedserver.cfg.json examples.",
    dataFile: "sons-of-the-forest.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Sons of the Forest Server", quoting: "json" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 8 },
      { id: "password", label: "Password", type: "text", defaultValue: "", quoting: "json" },
      {
        id: "game_mode",
        label: "Game Mode",
        type: "select",
        defaultValue: "Normal",
        options: [
          { value: "Normal", label: "Normal" },
          { value: "Hard", label: "Hard" },
          { value: "Peaceful", label: "Peaceful" },
          { value: "Custom", label: "Custom" },
        ],
        quoting: "json",
      },
    ],
    fileName: () => "dedicatedserver.cfg.json",
  },

  {
    gameId: "the-isle",
    configFileLabel: "Game.ini",
    description:
      "The [/Script/TheIsle.TIGameSession] entries most Evrima servers set first. The server-password feature has had reliability issues on some hosts in recent Evrima builds -- a whitelist may work better than relying on it.",
    sourceNote: "Community-documented (Afterthought Studios doesn't publish a formal reference); cross-checked against real shipped Game.ini examples.",
    dataFile: "the-isle.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Evrima Server" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 100 },
      { id: "password_enabled", label: "Require Password", type: "boolean", defaultValue: false },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "rcon_enabled", label: "Enable RCON", type: "boolean", defaultValue: false },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "" },
    ],
    fileName: () => "Game.ini",
  },

  {
    gameId: "scp-secret-laboratory",
    configFileLabel: "config_gameplay.txt",
    description:
      "The main gameplay-rules file. A separate config_remoteadmin.txt handles admin permissions and isn't covered by this generator.",
    sourceNote: "Cross-checked against a real shipped config_gameplay.txt (Northwood Studios doesn't publish every key in one single reference page).",
    sourceUrl: "https://techwiki.scpslgame.com/books/server-guides/page/2-gameplay-config-setup",
    dataFile: "scp-secret-laboratory.txt",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My SCP:SL Server" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 20 },
      { id: "friendly_fire", label: "Friendly Fire", type: "boolean", defaultValue: false },
    ],
    fileName: () => "config_gameplay.txt",
  },

  {
    gameId: "stationeers",
    configFileLabel: "default.ini",
    description: "Generated the first time you start the dedicated server; stop the server before editing.",
    sourceNote: "Community-documented (RocketWerkz doesn't publish a formal reference); cross-checked against a real shipped default.ini.",
    dataFile: "stationeers.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Stationeers Server" },
      { id: "description", label: "Description", type: "text", defaultValue: "" },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 10 },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "" },
    ],
    fileName: () => "default.ini",
  },

  {
    gameId: "empyrion-galactic-survival",
    configFileLabel: "dedicated.yaml",
    description:
      "The main dedicated-server settings file, in the server root. YAML is whitespace-sensitive -- use spaces, never tabs, when editing further by hand.",
    sourceNote:
      "Eleon Game Studios' own official dedicated servers page, cross-checked against the Empyrion wiki's server setup guide for exact key names.",
    sourceUrl: "https://empyriongame.com/dedicatedservers/",
    dataFile: "empyrion-galactic-survival.yaml",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Empyrion Server" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 8 },
      { id: "description", label: "Description", type: "text", defaultValue: "" },
      { id: "public_visible", label: "List Publicly", type: "boolean", defaultValue: true },
    ],
    fileName: () => "dedicated.yaml",
  },

  {
    gameId: "necesse",
    configFileLabel: "server.cfg",
    description: "The main server-identity block, in the server's cfg/ folder. World rules live in a separate WORLDSETTINGS block, not covered here.",
    sourceNote: "Community-documented (Fair Weather Games doesn't publish a formal reference); cross-checked against real shipped server.cfg examples.",
    dataFile: "necesse.cfg",
    fields: [
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 25 },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "pause_when_empty", label: "Pause When Empty", type: "boolean", defaultValue: false },
      { id: "motd", label: "Message of the Day", type: "text", defaultValue: "Hello", quoting: "double" },
    ],
    fileName: () => "server.cfg",
  },

  {
    gameId: "rising-storm-2-vietnam",
    configFileLabel: "ROGame.ini",
    description: "The main server-identity and access-control file, in ROGame/Config.",
    sourceNote:
      "Tripwire Interactive's own official RS2: Vietnam Dedicated Server wiki, hosted on Tripwire's own domain; section names cross-checked against Killing Floor 2's shared Unreal Engine 3 AccessControl convention (same engine, same publisher).",
    sourceUrl: "https://wiki.tripwireinteractive.com/index.php?redirect=no&title=RS2_DedicatedServer",
    dataFile: "rising-storm-2-vietnam.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My RS2: Vietnam Server" },
      { id: "short_name", label: "Short Name", type: "text", defaultValue: "RS2Server" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      { id: "game_password", label: "Join Password", type: "text", defaultValue: "" },
    ],
    fileName: () => "ROGame.ini",
  },

  {
    gameId: "vintage-story",
    configFileLabel: "serverconfig.json",
    description:
      "Vintage Story writes its in-memory config back to this file on shutdown -- always stop the server before editing it by hand, or your changes are overwritten.",
    sourceNote:
      "Cross-checked against the Vintage Story Wiki's dedicated-server guide and the /serverconfig admin console command names, which map to this file's keys.",
    sourceUrl: "https://wiki.vintagestory.at/Guide:Dedicated_Server",
    dataFile: "vintage-story.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Vintage Story Server", quoting: "json" },
      { id: "welcome_message", label: "Welcome Message", type: "text", defaultValue: "", quoting: "json" },
      { id: "password", label: "Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "max_clients", label: "Max Players", type: "number", defaultValue: 16 },
      { id: "allow_pvp", label: "Allow PvP", type: "boolean", defaultValue: true },
    ],
    fileName: () => "serverconfig.json",
  },

  {
    gameId: "wreckfest",
    configFileLabel: "server_config.cfg",
    description: "The basic server-identity settings. Bugbear ships a fuller SERVER_CONFIG_GUIDE.pdf reference inside the game's own files, not as a public webpage.",
    sourceNote: "Community-documented; cross-checked against real shipped server_config.cfg examples.",
    dataFile: "wreckfest.cfg",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Wreckfest Server" },
      { id: "welcome_message", label: "Welcome Message", type: "text", defaultValue: "" },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 24 },
    ],
    fileName: () => "server_config.cfg",
  },

  {
    gameId: "trackmania",
    configFileLabel: "dedicated_cfg.txt (server_options fragment)",
    description:
      "Just the <server_options> block -- merge it into your full dedicated_cfg.txt (copied from dedicated_cfg.default.txt), which also needs a <masterserver_account> section filled in with your own Nadeo dedicated-server account login, which this generator doesn't produce.",
    sourceNote: "Cross-checked against the Trackmania Wiki's own dedicated-server documentation site.",
    sourceUrl: "https://wiki.trackmania.io/en/dedicated-server/Usage/DedicatedConfig",
    dataFile: "trackmania.xml",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Trackmania Server" },
      { id: "comment", label: "Server Comment", type: "text", defaultValue: "" },
      { id: "password", label: "Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 16 },
    ],
    fileName: () => "server_options_fragment.txt",
  },

  {
    gameId: "craftopia",
    configFileLabel: "ServerSetting.ini",
    description: "The main dedicated-server config, in the serverfiles folder. Note: server passwords can currently only be numeric.",
    sourceNote: "Community-documented (Pocketpair doesn't publish a formal reference); cross-checked against real shipped ServerSetting.ini examples.",
    dataFile: "craftopia.ini",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Craftopia Server" },
      { id: "use_password", label: "Require Password", type: "boolean", defaultValue: false, booleanWords: ["1", "0"] },
      { id: "server_password", label: "Password (Numbers Only)", type: "text", defaultValue: "" },
      {
        id: "world_difficulty",
        label: "World Difficulty",
        type: "select",
        defaultValue: "1",
        options: [
          { value: "0", label: "Easy" },
          { value: "1", label: "Normal" },
          { value: "2", label: "Hard" },
          { value: "3", label: "Very Hard" },
        ],
      },
      {
        id: "world_game_mode",
        label: "Game Mode",
        type: "select",
        defaultValue: "1",
        options: [
          { value: "1", label: "Normal World" },
          { value: "2", label: "Creative World (Build)" },
          { value: "3", label: "Creative World (Play)" },
        ],
      },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 8 },
    ],
    fileName: () => "ServerSetting.ini",
  },

  {
    gameId: "path-of-titans",
    configFileLabel: "Game.ini",
    description:
      "The [/Script/PathOfTitans.IGameSession] entries most servers set first. Spaces in the server name must be written as underscores. Every server also needs its own free authentication token from Alderon Games to appear in the server list -- this generator doesn't produce that.",
    sourceNote: "Alderon Games' own official Community Server Wiki, published on Alderon's own GitHub.",
    sourceUrl: "https://github.com/Alderon-Games/pot-community-servers/wiki/Server-Configuration-Options",
    dataFile: "path-of-titans.ini",
    fields: [
      { id: "server_name", label: "Server Name (Use _ For Spaces)", type: "text", defaultValue: "My_Path_of_Titans_Server" },
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 100 },
    ],
    fileName: () => "Game.ini",
  },

  {
    gameId: "atlas",
    configFileLabel: "GameUserSettings.ini",
    description:
      "ATLAS shares ARK: Survival Evolved's GameUserSettings.ini format (same studio, forked engine). World/grid layout is a separate ServerGrid.json that Grapeshot's own ServerGridEditor tool is meant to generate -- hand-editing that file risks breaking the whole cluster, so it isn't covered here.",
    sourceNote:
      "Community-documented, based on ATLAS sharing ARK: Survival Evolved's GameUserSettings.ini format (same developer, forked engine); Grapeshot doesn't publish a separate formal reference for ATLAS specifically.",
    dataFile: "atlas.ini",
    fields: [
      { id: "server_password", label: "Server Password", type: "text", defaultValue: "" },
      { id: "admin_password", label: "Admin Password", type: "text", defaultValue: "" },
      { id: "max_players", label: "Max Players", type: "number", defaultValue: 40 },
    ],
    fileName: () => "GameUserSettings.ini",
  },

  {
    gameId: "colony-survival",
    configFileLabel: "server.config.json",
    description: "The main dedicated-server settings file, used instead of passing everything as command-line flags.",
    sourceNote:
      "Cross-checked against Pipliz's own public Colony Survival GitHub repo; the +server.name/+server.password-style command-line parameter names map to this file's nested keys.",
    sourceUrl: "https://github.com/pipliz/ColonySurvival/blob/master/gamedata/help/hosting.txt",
    dataFile: "colony-survival.json",
    fields: [
      { id: "server_name", label: "Server Name", type: "text", defaultValue: "My Colony Survival Server", quoting: "json" },
      { id: "password", label: "Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "rcon_password", label: "RCON Password", type: "text", defaultValue: "", quoting: "json" },
      { id: "world_name", label: "World Name", type: "text", defaultValue: "world", quoting: "json" },
    ],
    fileName: () => "server.config.json",
  },
];

export const configTemplates: Record<string, GameConfigTemplate> = Object.fromEntries(
  templates.map((template) => [template.gameId, template]),
);
