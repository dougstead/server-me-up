export type OperatingSystem = "windows" | "linux" | "macos";

export type StoragePreference =
  | "required"
  | "recommended"
  | "not-required"
  | null;

export type NetworkProtocol = "TCP" | "UDP";

export type GameServerRequirements = {
  id: string;
  name: string;

  official: {
    cpu: {
      minimumPhysicalCores: number | null;
      recommendedPhysicalCores: number | null;
      minimumLogicalCores: number | null;
      recommendedLogicalCores: number | null;
      minimumClockGhz: number | null;
      recommendedClockGhz: number | null;
      minimumModel: string | null;
      recommendedModel: string | null;
      notes?: string;
    };

    ram: {
      minimumGb: number | null;
      recommendedGb: number | null;
      baseGb?: number | null;
      perPlayerGb?: number | null;
      notes?: string;
    };

    storage: {
      minimumGb: number | null;
      recommendedGb: number | null;
      ssd: StoragePreference;
      notes?: string;
    };

    supportedOperatingSystems: OperatingSystem[];

    requiredPorts: {
      protocol: NetworkProtocol;
      port: number;
      purpose?: string;
      required: boolean;
    }[];

    softwareRequirements?: string[];
    notes?: string[];
  };

  limits: {
    maxPlayers: number | null;
    notes?: string;
  };

  hosting: {
    providerId: string;
    affiliateUrl: string;
    note?: string;
  }[];
};

export const games: GameServerRequirements[] = [
  {
    id: "minecraft",
    name: "Minecraft",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel:
          "Dual-core CPU (e.g. Intel Core 2 Duo / AMD Athlon 64 X2) or better",
        recommendedModel:
          "Intel Nehalem-based or AMD K10-based (or newer) at 3.6 GHz+ for 8+ players",
        notes:
          "Mojang does not publish a formal dedicated-server CPU spec for Java Edition. The figures here are the commonly cited Minecraft Wiki server-requirements tiers, not an official Mojang document.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 8,
        notes:
          "Mojang does not publish a formal dedicated-server RAM spec for Java Edition. 2 GB is workable for a handful of players; the Minecraft Wiki's \"optimal\" tier for 8+ players suggests 8 GB. Plugins, mods and large explored areas increase usage well beyond this.",
      },
      storage: {
        minimumGb: 10,
        recommendedGb: 35,
        ssd: "recommended",
        notes:
          "Community-sourced (Minecraft Wiki), not an official Mojang figure. World size, backups and plugin data grow this substantially over time.",
      },
      supportedOperatingSystems: ["windows", "linux", "macos"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 25565,
          purpose: "Default Java Edition server port",
          required: true,
        },
      ],
      softwareRequirements: [
        "A Java runtime compatible with the current Minecraft server release",
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "The Java server player limit is configurable; Mojang does not publish a fixed hard maximum for normal server hosting.",
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_minecraft/6212169",
      },
    ],
  },

  {
    id: "minecraft-bedrock",
    name: "Bedrock",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel:
          "Intel Core i3-3210 or AMD A8-7600 APU, or equivalent",
        recommendedModel:
          "Quad-core x86/64-bit CPU at 3 GHz or higher (Intel i5 Ivy Bridge or newer, or AMD FX-4100 or higher)",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: null,
        notes: "Microsoft's official download page notes this may need to be higher with more than 10 players connected at once.",
      },
      storage: {
        minimumGb: 0.18,
        recommendedGb: 1,
        ssd: null,
        notes:
          "Official download page lists approximately 180 MB to 1 GB available space.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 19132,
          purpose: "Default IPv4 Bedrock server port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 19133,
          purpose: "Default IPv6 Bedrock server port",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "max-players accepts a positive integer. Microsoft documents a soft connected-player limit rather than a fixed normal maximum.",
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_minecraft-pe/6212169",
      },
    ],
  },

  {
    id: "ark-survival-evolved",
    name: "ARK: Survival Evolved",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: 2,
        minimumClockGhz: null,
        recommendedClockGhz: 3.5,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "The ARK Official Community Wiki (a community-maintained resource, not operated by Studio Wildcard, despite the name) recommends 2 logical cores per Survival Evolved server instance and favours strong single-thread performance; scaling beyond 4 logical cores provides little benefit. The 3.5 GHz clock-speed figure is separate community-sourced hosting guidance.",
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
        notes:
          "RAM varies heavily by map and world age. Official figures for an empty map range from roughly 3 GB to 12.5 GB depending on the map, with approximately 50-150 MiB additional memory per connected player. Community hosting guides commonly suggest starting at 8-12 GB as a practical floor.",
      },
      storage: {
        minimumGb: 18,
        recommendedGb: null,
        ssd: null,
        notes:
          "18 GiB is approximately the base Survival Evolved server installation size. Saves, logs, updates and mods require additional space.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 7778,
          purpose: "Peer port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Steam query port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 27020,
          purpose: "RCON",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_ark/6212169",
      },
    ],
  },

  {
    id: "rust",
    name: "Rust",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 3.4,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Facepunch does not publish a fixed CPU minimum; CPU demand increases with player count, world size and server activity. Rust is largely single-thread bound, so hosting guides commonly recommend at least 3.4 GHz single-core performance (community-sourced, not an official Facepunch figure).",
      },
      ram: {
        minimumGb: 12,
        recommendedGb: null,
        notes:
          "Facepunch lists 12 GB free RAM; larger maps and higher populations can require more.",
      },
      storage: {
        minimumGb: 15,
        recommendedGb: null,
        ssd: "recommended",
        notes: "SSD/NVMe is highly preferred by Facepunch.",
      },
      supportedOperatingSystems: ["windows", "linux", "macos"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 28015,
          purpose: "Default game port",
          required: true,
        },
      ],
      notes: [
        "A separate UDP query port is also required for server-browser visibility. Its value depends on the configured game and RCON ports.",
      ],
    },
    limits: {
      maxPlayers: null,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_rust/6212169",
      },
    ],
  },

  {
    id: "hytale",
    name: "Hytale",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 3.5,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Hytale entered Early Access in January 2026. Hypixel Studios' own Server Manual document was unreachable during research (it returned an access-denied response), so these figures are reconstructed from multiple independent hosting-provider summaries of that manual, not verified against the primary source directly. Larger servers (20-30 players) are commonly cited as needing a 6-core CPU.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 6,
        notes:
          "At least 4 GB memory is required, 6 GB recommended. RAM use depends strongly on loaded world area and view distance; sources cite 8-10 GB for 20-30 player servers. See the CPU note above regarding sourcing.",
      },
      storage: {
        minimumGb: 20,
        recommendedGb: null,
        ssd: "recommended",
        notes:
          "Cited as \"20 GB SSD (NVMe preferred)\" across secondary sources summarizing the official Server Manual; not independently verified against the primary document.",
      },
      supportedOperatingSystems: ["windows", "linux", "macos"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 5520,
          purpose: "Default QUIC game-server port",
          required: true,
        },
      ],
      softwareRequirements: ["Java 25"],
    },
    limits: {
      maxPlayers: null,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_hytale/6212169",
      },
    ],
  },

  {
    id: "starbound",
    name: "Starbound",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: "Intel Core 2 Duo or equivalent",
        recommendedModel: "Intel Core i3 or equivalent",
        notes:
          "Chucklefish has not published a formal dedicated-server hardware spec; these figures are community consensus from Starbound hosting guides and the Chucklefish forums, not an official document.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "Community-sourced, not officially published. Actual usage depends on world count, player count and installed mods.",
      },
      storage: {
        minimumGb: 3,
        recommendedGb: null,
        ssd: null,
        notes: "Community-sourced; grows with the number of stored worlds and any mods.",
      },
      supportedOperatingSystems: ["windows", "linux", "macos"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 21025,
          purpose: "Default game-server port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "The official configuration defaults to 8 simultaneous sessions, but this is configurable and is not documented as a fixed hard maximum.",
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_starbound/6212169",
      },
    ],
  },

  {
    id: "terraria",
    name: "Terraria",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 3,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Re-Logic does not publish a CPU spec. Terraria's server is effectively single-threaded, so hosting guides commonly recommend 3 GHz+ single-core performance for 10+ player worlds (community-sourced, not official).",
      },
      ram: {
        minimumGb: 0.5,
        recommendedGb: 4,
        notes:
          "Terraria Wiki guidance: roughly 512 MB for a small world with few players, 1-2 GB for 10+ players, and 4 GB or more recommended once you're expecting 50+ players. tModLoader's default 32-bit build is capped at 4 GB regardless of server RAM.",
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
        notes:
          "No official storage figure is published. The server executable and a world file together typically use well under 1 GB, though this grows with world size, backups and any mods (e.g. tModLoader).",
      },
      supportedOperatingSystems: ["windows", "linux", "macos"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 7777,
          purpose: "Default Terraria server port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 255,
      notes:
        "The default is 16 players. The official server configuration accepts maxplayers values from 1 to 255.",
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_terraria/6212169",
      },
    ],
  },

  {
    id: "valheim",
    name: "Valheim",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 3,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Iron Gate does not publish a formal dedicated-server CPU spec. The 4-core figure and 3 GHz+ guidance are community-sourced (Valheim Wiki and hosting guides), commonly cited to avoid exploration lag on full 10-player vanilla servers.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "Iron Gate does not publish a formal dedicated-server RAM requirement. The Valheim Wiki lists 2 GB as a bare minimum, but real-world usage is commonly reported starting around 3-4 GB even for small worlds, with 8 GB+ recommended for modded servers.",
      },
      storage: {
        minimumGb: 2,
        recommendedGb: null,
        ssd: null,
        notes: "Community-sourced; grows with world size, backups and any mods.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 2456,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 2457,
          purpose: "Second port in the default Steam-backend range",
          required: true,
        },
      ],
      notes: [
        "When using the Crossplay backend, Valheim uses a relay service and does not require router port forwarding.",
      ],
    },
    limits: {
      maxPlayers: 10,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_valheim/6212169",
      },
    ],
  },

  {
    id: "arma-3",
    name: "Arma 3",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.4,
        recommendedClockGhz: 3.5,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Bohemia Interactive has confirmed it does not publish official dedicated-server hardware requirements -- load depends heavily on player count, AI, mods and mission complexity. These figures approximate Arma 3's general (client) system requirements as a rough floor; Arma 3 is largely single-thread bound, so community hosting guides commonly recommend well beyond this (e.g. a fast 4-6 core CPU) for a populated modded server.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "Not officially published for dedicated servers -- these approximate Arma 3's general system requirements. Community guidance suggests roughly an extra 1 GB per 10 additional players, with 16 GB commonly recommended for 10-20 players with light-to-medium mods.",
      },
      storage: {
        minimumGb: 32,
        recommendedGb: 32,
        ssd: "recommended",
        notes:
          "Not officially published for dedicated servers specifically; NVMe/SSD storage is commonly recommended by the community for performance.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 2302,
          purpose: "Game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 2303,
          purpose: "Steam query port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 2304,
          purpose: "Steam master port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 2305,
          purpose: "Reserved VON port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 2306,
          purpose: "BattlEye traffic",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Player capacity depends heavily on mission complexity, AI, server performance and bandwidth.",
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_arma-3/6212169",
      },
    ],
  },

  {
    id: "team-fortress-2",
    name: "Team Fortress 2",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 1,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "TF2 runs on Valve's Source Dedicated Server (SRCDS). The Valve Developer Community wiki gives a general SRCDS baseline of a 1.0 GHz CPU for a basic 20-slot server; this isn't a TF2-specific figure, and requirements rise with player/bot count and plugins.",
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
        notes:
          "Valve does not publish a fixed RAM requirement for TF2 dedicated servers; usage scales with player/bot count and any SourceMod plugins.",
      },
      storage: {
        minimumGb: 5.8,
        recommendedGb: null,
        ssd: null,
        notes:
          "The official TF2 dedicated-server guide currently describes the server content as roughly 5.8 GB.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default Source dedicated-server game port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_team-fortress-2/6212169",
      },
    ],
  },

  {
    id: "bannerlord",
    name: "Mount & Blade II: Bannerlord",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2,
        recommendedClockGhz: 2,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "TaleWorlds says smaller battles use 2-core CPUs around 2-3 GHz, while larger battles use 4-core CPUs around 2-3 GHz.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 8,
        notes:
          "TaleWorlds uses 4 GB for smaller battles and 8 GB for larger battles in its default hosting examples. Community hosting guides report up to 15 GB for a full, heavily populated server.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: null,
        ssd: null,
        notes:
          "Not officially published in GB terms; commonly cited across hosting guides as roughly 30 GB for the SteamCMD dedicated-server download (app ID 1863440) plus save/config data.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7210,
          purpose: "Default dedicated-server game port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 7210,
          purpose: "Administration web panel / map transfer features",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_mount-blade-2/6212169",
      },
    ],
  },

  {
    id: "garrys-mod",
    name: "Garry's Mod",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 1.8,
        recommendedClockGhz: 2.5,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Facepunch's own wiki (wiki.facepunch.com/gmod) does not publish hardware requirements for dedicated servers. These figures are community-sourced from hosting-provider guides, not an official document.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 8,
        notes: "Community-sourced, not officially published; scales heavily with gamemode and addons.",
      },
      storage: {
        minimumGb: 5,
        recommendedGb: 10,
        ssd: "recommended",
        notes: "Community-sourced, not officially published.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default Source server game port",
          required: true,
        },
      ],
      notes: [
        "Actual Garry's Mod server requirements vary substantially with gamemode, map, addons and player count.",
      ],
    },
    limits: {
      maxPlayers: null,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_garrys-mod/6212169",
      },
    ],
  },

  {
    id: "palworld",
    name: "Palworld",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
      },
      ram: {
        minimumGb: 16,
        recommendedGb: 32,
        notes:
          "8 GB can boot the server but Pocketpair warns of increased out-of-memory crash risk. More than 32 GB is recommended for larger servers.",
      },
      storage: {
        minimumGb: 15,
        recommendedGb: 40,
        ssd: "recommended",
        notes:
          "Pocketpair recommends fast SSD storage and warns that slow storage can contribute to save-data corruption. Pocketpair doesn't publish a storage size in GB; the dedicated server download itself is roughly 12-15 GB (community-reported), and hosting guides commonly suggest budgeting 40 GB+ once player bases, captures and backups accumulate.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 8211,
          purpose: "Default Palworld game-server port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 32,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_palworld/6212169",
      },
    ],
  },

  {
    id: "project-zomboid",
    name: "Project Zomboid",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 4,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "The Indie Stone does not publish a dedicated-server CPU minimum. Project Zomboid's zombie-pathing load is concentrated on one or two threads, so community hosting guides emphasize high single-thread clock speed (4+ GHz) over core count; this is not an official figure.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "No official minimum is published. Community hosting guides converge on roughly 8 GB as a floor for a small group and 12-16 GB for 8-16 players, more with mods.",
      },
      storage: {
        minimumGb: 2,
        recommendedGb: null,
        ssd: "recommended",
        notes:
          "Community-sourced; roughly 2 GB for the base server files, growing with mods, saves and map data. Faster storage measurably reduces autosave/backup stutter.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 16261,
          purpose: "Default server/game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 16262,
          purpose: "Additional direct-connection/player port in current Steam setups",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_project-zomboid/6212169",
      },
    ],
  },

  {
    id: "eco",
    name: "Eco",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: "Intel Core i5 or AMD equivalent",
        recommendedModel: null,
        notes:
          "Eco's server documentation says higher CPU frequency is better because the main server process primarily uses a single CPU core.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: null,
        notes:
          "The published 4 GB requirement is for the default 72x72 world size; requirements vary with world size.",
      },
      storage: {
        minimumGb: 10,
        recommendedGb: null,
        ssd: "recommended",
        notes:
          "SSD is recommended for complex law systems that cause heavy database access. 10 GB is Eco's general published storage requirement; a dedicated-server-only figure isn't separately published, so actual server-only usage may be lower.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 3000,
          purpose: "Default game-server port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 3001,
          purpose: "Default web-server port",
          required: true,
        },
      ],
      softwareRequirements: [
        "Microsoft .NET 4.6.2 or newer on Windows",
        "Microsoft Visual C++ Redistributable 2019-2022 on Windows",
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Eco supports configurable slots; the current network configuration uses -1 to represent unlimited slots.",
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_eco/6212169",
      },
    ],
  },

  {
    id: "dragonwilds",
    name: "RuneScape: Dragonwilds",
    official: {
      cpu: {
        minimumPhysicalCores: 1,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Jagex's official container image documents a minimum of 1 CPU core. The 4-core recommendation is community/hosting-guide guidance for smooth performance at the full 6-player cap, not an official Jagex figure.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: null,
        baseGb: 2,
        perPlayerGb: 1,
        notes:
          "Jagex's hosting guide states 2 GB base RAM plus 1 GB per player. Its official container image lists 4 GiB as the minimum system requirement.",
      },
      storage: {
        minimumGb: 20,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default dedicated-server port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 6,
      notes: "Dedicated servers support up to 6 players as of version 0.11.",
    },
    hosting: [
      {
        providerId: "scalacube",
        affiliateUrl: "https://scalacube.com/p/_hosting_server_dragonwilds/6212169",
      },
    ],
  },
];
