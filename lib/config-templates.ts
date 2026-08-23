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
];

export const configTemplates: Record<string, GameConfigTemplate> = Object.fromEntries(
  templates.map((template) => [template.gameId, template]),
);
