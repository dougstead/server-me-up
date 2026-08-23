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
          "8 GB can boot the server but Pocketpair warns of increased out-of-memory crash risk. More than 32 GB is recommended for larger servers. RAM use tracks base-building and Pal count more closely than player count -- a small server with sprawling bases can use more RAM than a larger one with modest builds, which is why there's no reliable per-player figure to give here.",
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

  {
    id: "7-days-to-die",
    name: "7 Days to Die",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.4,
        recommendedClockGhz: 3.0,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "The Fun Pimps don't publish official dedicated-server hardware requirements. These figures are common hosting-guide consensus: the server is heavily single-thread-bound, so clock speed matters more than core count.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 8,
        notes:
          "No official RAM spec is published. Community guidance is roughly 4-6 GB for a small vanilla group (1-4 players), 6-8 GB for a full 8-16 player vanilla server, and considerably more for large overhaul modpacks like Darkness Falls or Undead Legacy.",
      },
      storage: {
        minimumGb: 12,
        recommendedGb: 20,
        ssd: "recommended",
        notes:
          "Community-sourced; grows substantially with world saves, backups and mods.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 26900,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 26900,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 26901,
          purpose: "Additional game traffic",
          required: true,
        },
        {
          protocol: "UDP",
          port: 26902,
          purpose: "Additional game traffic",
          required: false,
        },
        {
          protocol: "TCP",
          port: 8081,
          purpose: "Telnet remote admin (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable; no official fixed maximum. Commonly run at 8-16 players, with larger counts possible on stronger hardware.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "ark-survival-ascended",
    name: "ARK: Survival Ascended",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: 8,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Studio Wildcard hasn't published a formal dedicated-server spec. Each map runs as a largely single-threaded process, so community guidance favours a CPU with a high single-core clock speed; 8+ cores mainly helps if you're running multiple maps (a cluster) on one machine.",
      },
      ram: {
        minimumGb: 16,
        recommendedGb: 32,
        notes:
          "No official figure. Each map typically uses around 10 GB at moderate settings -- 16 GB covers a single map comfortably, 32 GB+ is common guidance for a multi-map cluster.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: 60,
        ssd: "recommended",
        notes:
          "The base server install is roughly 11 GB; budget 20-30 GB per map once saves, logs and updates are included. World saves are frequent and disk-intensive, so SSD is strongly recommended.",
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 27020,
          purpose: "RCON (optional; keep closed to the internet)",
          required: false,
        },
      ],
      notes: [
        "The dedicated server is a Windows build. Linux hosting is possible unofficially via Wine/Proton or community Docker images, but isn't supported by Studio Wildcard.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable per map (70 is the common out-of-the-box default); no official fixed maximum.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "conan-exiles",
    name: "Conan Exiles",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: "Intel Core i5 series or equivalent",
        recommendedModel: null,
        notes:
          "Funcom's official dedicated-server system requirements page recommends a quad-core CPU. The server leans on single-thread performance for AI, thrall and building-persistence simulation.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "8 GB is Funcom's officially recommended minimum. Community guidance scales this up to 12-16 GB+ for large or heavily-modded servers.",
      },
      storage: {
        minimumGb: 35,
        recommendedGb: null,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 7778,
          purpose: "Additional game/RakNet traffic",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Steam query port",
          required: false,
        },
        {
          protocol: "TCP",
          port: 25575,
          purpose: "RCON (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "core-keeper",
    name: "Core Keeper",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.4,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Pugstorm/Fireshine haven't published official dedicated-server hardware requirements; this is common hosting-guide consensus.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 8,
        notes:
          "No official figure. 4-8 GB covers up to 4 players; larger or modded groups are commonly given 8-16 GB.",
      },
      storage: {
        minimumGb: 10,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Additional game traffic",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 8,
      notes:
        "8 is the commonly documented player cap for Core Keeper dedicated servers.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "counter-strike-2",
    name: "Counter-Strike 2",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.0,
        recommendedClockGhz: 3.5,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Valve doesn't publish a formal dedicated-server CPU spec; this is common hosting-guide consensus.",
      },
      ram: {
        minimumGb: 6,
        recommendedGb: 8,
        notes:
          "No official figure. Roughly 4 GB covers a 10-12 player server, 8 GB for 24 players, and 16 GB is commonly recommended for a full 64-player community server.",
      },
      storage: {
        minimumGb: 50,
        recommendedGb: 60,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 27015,
          purpose: "RCON / SourceTV (optional)",
          required: false,
        },
      ],
      softwareRequirements: [
        "A free Steam Game Server Login Token (GSLT) from Valve, needed for your server to be visible to other players.",
      ],
    },
    limits: {
      maxPlayers: 64,
      notes:
        "64 is the practical community-server maximum; competitive match servers typically run far fewer (10-12).",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "dayz-standalone",
    name: "DayZ Standalone",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.0,
        recommendedClockGhz: 4.0,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Bohemia Interactive doesn't publish a formal dedicated-server CPU spec; this is common hosting-guide consensus. The server process is largely single-thread-bound, so clock speed matters more than core count.",
      },
      ram: {
        minimumGb: 6,
        recommendedGb: 12,
        notes:
          "No official figure. Roughly 6 GB is the practical minimum for a vanilla server up to 30 players, 8-10 GB for a modded 50-player server, and 12-16 GB for a heavily-modded 60+ player server.",
      },
      storage: {
        minimumGb: 20,
        recommendedGb: null,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 2302,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 2303,
          purpose: "Additional game traffic",
          required: false,
        },
        {
          protocol: "UDP",
          port: 2304,
          purpose: "Additional game traffic",
          required: false,
        },
        {
          protocol: "UDP",
          port: 2305,
          purpose: "BattlEye / RCON",
          required: false,
        },
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Steam query port (needed for server browser visibility)",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 60,
      notes:
        "60 is a commonly cited practical ceiling; configurable via serverDZ.cfg.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "dont-starve-together",
    name: "Don't Starve Together",
    official: {
      cpu: {
        minimumPhysicalCores: 1,
        recommendedPhysicalCores: 2,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 1.7,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Klei's official system requirements page lists a 1.7+ GHz processor as the minimum. Multi-shard setups (e.g. adding a Caves world) need roughly one CPU core per shard.",
      },
      ram: {
        minimumGb: 1,
        recommendedGb: 2,
        notes:
          "Klei's official minimum is 1 GB. Multi-shard setups need roughly 1 GB more per additional shard.",
      },
      storage: {
        minimumGb: 1,
        recommendedGb: 10,
        ssd: "recommended",
        notes:
          "Klei's official minimum is 1 GB; hosting guides commonly suggest budgeting 10 GB for smoother performance with saves and mods.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 10999,
          purpose: "Default master-shard port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 11000,
          purpose: "Caves shard port (only if running a Caves world)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable per server; Klei doesn't publish a fixed hard maximum, though larger player counts need proportionally more CPU/RAM per shard.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "enshrouded",
    name: "Enshrouded",
    official: {
      cpu: {
        minimumPhysicalCores: 6,
        recommendedPhysicalCores: 8,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.2,
        recommendedClockGhz: 3.7,
        minimumModel: "Intel Core i7 or equivalent AMD",
        recommendedModel: "Intel Core i7 or equivalent AMD",
        notes:
          "Keen Games hasn't published a formal dedicated-server spec; this is common hosting-guide consensus for a 4-6 player world (6 cores/3.2 GHz) vs. a full 16-player world (8 cores/3.7 GHz).",
      },
      ram: {
        minimumGb: 16,
        recommendedGb: 16,
        notes:
          "No official figure. The server idles around 4-5 GB, but commonly needs the full 16 GB once a 16-player world is fully explored and built out.",
      },
      storage: {
        minimumGb: 13,
        recommendedGb: 30,
        ssd: "recommended",
        notes:
          "Server files are roughly 13 GB; budget around 30 GB total once saves, backups and updates are included. World saves are write-heavy, so SSD/NVMe is recommended.",
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 15636,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 15637,
          purpose: "Additional game traffic",
          required: true,
        },
      ],
      notes: [
        "The dedicated server is a Windows build (Steam app 2278520). Linux hosts commonly run it via Proton/Wine inside Docker, but this isn't officially supported by Keen Games.",
      ],
    },
    limits: {
      maxPlayers: 16,
      notes: "16 is the documented player cap for Enshrouded dedicated servers.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "satisfactory",
    name: "Satisfactory",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.4,
        recommendedClockGhz: null,
        minimumModel: "Intel Core i5-3570 (3.4 GHz, 4 cores) or equivalent",
        recommendedModel: null,
        notes:
          "Coffee Stain's official minimum spec calls for an i5-3570-class CPU. The server favours high single-core performance over raw core count -- a single-thread benchmark score of roughly 2000+ is commonly cited as the practical bar.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "8 GB is Coffee Stain's official minimum. Community guidance scales this to 12 GB for larger factories and 16 GB for late-game/mega-factory saves or 4+ players.",
      },
      storage: {
        minimumGb: 15,
        recommendedGb: 30,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 15000,
          purpose: "Query port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 15777,
          purpose: "Beacon port (LAN discovery, optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable; no official fixed maximum, though performance degrades well before very high counts since the simulation is largely single-threaded.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "v-rising",
    name: "V Rising",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: 6,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.0,
        recommendedClockGhz: 3.5,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Stunlock Studios hasn't published a formal dedicated-server spec; this is common hosting-guide consensus. The simulation runs on a few hot threads, so clock speed (ideally 4.0 GHz+ boost) matters more than core count.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 12,
        notes:
          "No official figure. The server idles around 4 GB on an empty world; a practical baseline is 8 GB for a small group, 10-12 GB for 10-20 players, and 12-16 GB for a full 40-player server.",
      },
      storage: {
        minimumGb: 10,
        recommendedGb: 20,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 9876,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 9877,
          purpose: "Steam query port (needed for server browser visibility)",
          required: true,
        },
        {
          protocol: "TCP",
          port: 25575,
          purpose: "RCON (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: 40,
      notes: "40 is Stunlock Studios' documented player cap for dedicated servers.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "barotrauma",
    name: "Barotrauma",
    official: {
      cpu: {
        minimumPhysicalCores: 1,
        recommendedPhysicalCores: 2,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 1.8,
        recommendedClockGhz: 2.4,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "FakeFish/Undertow Games haven't published a dedicated-server-only spec -- the official minimum system requirements (a Core2 Duo E4300-class 1.8 GHz dual-core) cover both client and server. Community hosting guides suggest 2 GHz+ is comfortable for a full crew.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "No official dedicated-server-only figure. 2 GB comfortably covers a vanilla 4-8 player crew; 4 GB+ is recommended for 12-16 players or a modded Steam Workshop server.",
      },
      storage: {
        minimumGb: 1,
        recommendedGb: 5,
        ssd: null,
        notes:
          "Server files are small (around 1 GB); a few GB extra covers save files and mods.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Steam query port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable; no official fixed maximum. Community servers commonly run 8-16 players.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "factorio",
    name: "Factorio",
    official: {
      cpu: {
        minimumPhysicalCores: 1,
        recommendedPhysicalCores: 2,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Wube Software hasn't published a formal dedicated-server spec. The server is single-threaded, so one fast CPU core matters far more than core count.",
      },
      ram: {
        minimumGb: 1,
        recommendedGb: 4,
        notes:
          "No official figure. 1-2 GB is plenty for a small factory; large, heavily-modded or high-throughput factories can need considerably more as the save grows.",
      },
      storage: {
        minimumGb: 1,
        recommendedGb: 5,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux", "macos"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 34197,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 27015,
          purpose: "RCON (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable; no official fixed maximum, though very large factories eventually bottleneck on simulation speed rather than player count.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "squad",
    name: "Squad",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: 8,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Offworld Industries hasn't published a formal dedicated-server spec. Squad is heavily single-core intensive at high player counts, so hosting guides favour a high-clock CPU over core count.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "No official figure. A full 100-player server commonly needs 16-24 GB to keep map assets, player state and vehicle physics resident without paging; smaller player counts need proportionally less.",
      },
      storage: {
        minimumGb: 20,
        recommendedGb: 30,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7787,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27165,
          purpose: "Steam query port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 21114,
          purpose: "RCON (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: 100,
      notes: "100 is Squad's documented full server-size cap (50 vs 50).",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "insurgency-sandstorm",
    name: "Insurgency: Sandstorm",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "New World Interactive/Saber hasn't published a formal dedicated-server spec; hosting-guide consensus recommends 2+ cores with good single-thread performance.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 8,
        notes:
          "No official figure. 4 GB covers a small server; 8 GB+ is commonly recommended for a full server with custom maps/mods.",
      },
      storage: {
        minimumGb: 50,
        recommendedGb: null,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27102,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27131,
          purpose: "Query port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable per map/mode; official Checkpoint/Push modes commonly run up to 16v16.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "killing-floor-2",
    name: "Killing Floor 2",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 3.6,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Tripwire hasn't published a formal dedicated-server spec. Community hosting-guide consensus: a modest dual-core handles a small match fine, but a quad-core 3.6 GHz+ is recommended for a full 6-player match with Steam Workshop mods.",
      },
      ram: {
        minimumGb: 3,
        recommendedGb: 4,
        notes:
          "No official figure; measured usage is typically well under 1 GB per server instance, but hosting guides commonly recommend budgeting 3-4 GB, especially with Workshop mods.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
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
          port: 8080,
          purpose: "Web admin (optional)",
          required: false,
        },
      ],
      notes: [
        "The dedicated server requires 64-bit Windows -- Tripwire discontinued the Linux dedicated server.",
      ],
    },
    limits: {
      maxPlayers: 6,
      notes:
        "6 is the standard co-op match player cap (higher counts are possible in some custom game modes).",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "left-4-dead-2",
    name: "Left 4 Dead 2",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.0,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Valve hasn't published a formal dedicated-server spec; this is common hosting-guide consensus.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "No official figure. 2-4 GB comfortably covers a typical 8-slot server.",
      },
      storage: {
        minimumGb: 13,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 27015,
          purpose: "RCON (optional)",
          required: false,
        },
      ],
      softwareRequirements: [
        "A free Steam Game Server Login Token (GSLT) from Valve, needed for your server to be visible to other players.",
      ],
    },
    limits: {
      maxPlayers: 8,
      notes: "8 is the standard co-op/versus lobby size (4v4 in Versus mode).",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "space-engineers",
    name: "Space Engineers",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: 3,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.2,
        recommendedClockGhz: 4.5,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Keen Software House hasn't published a formal dedicated-server spec; hosting-guide consensus favours a high-clock CPU over core count, since voxel physics and collision are largely single-thread-bound.",
      },
      ram: {
        minimumGb: 6,
        recommendedGb: 10,
        notes:
          "No official figure. Community guidance: 6 GB minimum, 8-16 GB depending on world size and the number of players/factions.",
      },
      storage: {
        minimumGb: 10,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Default game port",
          required: true,
        },
      ],
      notes: [
        "Beyond the main port, Keen's own documentation also recommends opening the ephemeral range 49152-65535 (TCP/UDP) for smoother gameplay connections after the initial handshake.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes:
        "Configurable; no official fixed maximum, though performance is heavily CPU-bound as player/faction count grows.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "unturned",
    name: "Unturned",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Smartly Dressed Games hasn't published a formal dedicated-server spec; hosting-guide consensus recommends a quad-core for up to 24 players.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 8,
        notes:
          "No official figure. 2 GB covers a small vanilla map; 8 GB+ is commonly recommended for a full 24-player server with heavy Rocket/OpenMod plugin setups.",
      },
      storage: {
        minimumGb: 10,
        recommendedGb: 20,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Steam query port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27017,
          purpose: "Steam Workshop downloads (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: 24,
      notes:
        "24 is the commonly documented default player cap; configurable in the server's Commands.dat.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "the-forest",
    name: "The Forest",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 1.8,
        recommendedClockGhz: 3.0,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Endnight Games hasn't published a formal dedicated-server spec; hosting-guide consensus is 2 cores/1.8 GHz as an absolute minimum, scaling to a quad-core 3.0 GHz+ for 3+ players.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 4,
        notes:
          "No official figure; 4 GB is the commonly cited figure across both minimum and recommended hosting guides.",
      },
      storage: {
        minimumGb: 2,
        recommendedGb: 5,
        ssd: null,
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 8766,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 8766,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Steam query port",
          required: true,
        },
      ],
      notes: [
        "The full official port list is wider (TCP 27015-27030/27036-27037 and UDP 27000-27031/27036 in addition to the above) -- forward that broader range too if players have trouble connecting.",
      ],
    },
    limits: {
      maxPlayers: 8,
      notes:
        "8 is the commonly documented default player cap for a The Forest dedicated server.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "scum",
    name: "SCUM",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: 4,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Gamepires/Croteam hasn't published a formal dedicated-server CPU spec; 4 logical cores per server instance is common hosting-guide guidance.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "No official figure. 8 GB is commonly cited as the minimum to start the server at all; 16 GB is recommended, and a full 64-player server commonly needs 12-16 GB+.",
      },
      storage: {
        minimumGb: 15,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 7779,
          purpose: "Query port (game port + 2 by default)",
          required: true,
        },
      ],
      notes: [
        "The server's query port can't be set between 27020-27050 -- Steam reserves that range.",
      ],
    },
    limits: {
      maxPlayers: 64,
      notes: "64 is a commonly documented practical server-size cap.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "risk-of-rain-2",
    name: "Risk of Rain 2",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.5,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Hopoo Games/Gearbox hasn't published a formal dedicated-server spec; this is common hosting-guide consensus.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: null,
        notes: "No official figure. 4 GB comfortably covers a typical lobby.",
      },
      storage: {
        minimumGb: 5,
        recommendedGb: 10,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Steam query port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 4,
      notes:
        "4 is the vanilla co-op lobby size; modded servers can support more.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "mordhau",
    name: "Mordhau",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.5,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Triternion hasn't published a formal dedicated-server spec; hosting-guide consensus recommends 4 modern cores with a high clock speed (3.5 GHz+), since the server leans on single-core performance.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 16,
        notes:
          "No official figure. 4 GB can run a small server; 8-16 GB is commonly recommended for a full 64-player server.",
      },
      storage: {
        minimumGb: 20,
        recommendedGb: null,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Steam query port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 64,
      notes: "64 is Mordhau's documented full server-size cap.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "astroneer",
    name: "Astroneer",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.4,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "System Era hasn't published a formal dedicated-server-only spec; this figure is drawn from common hosting-guide consensus.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 8,
        notes:
          "No official figure. 4 GB is a workable minimum; 8 GB is commonly recommended.",
      },
      storage: {
        minimumGb: 4,
        recommendedGb: 14,
        ssd: null,
        notes:
          "Server files are small (around 4 GB); budget extra for the OS and save data.",
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 8777,
          purpose: "Default game port",
          required: true,
        },
      ],
      notes: [
        "System Era's official cross-platform/Xbox-compatible hosting partners are Nitrado and GPORTAL. A self-hosted server works fine for Steam/PC players, but Xbox players can't join a non-authenticated home server.",
      ],
    },
    limits: {
      maxPlayers: 8,
      notes: "Configurable; 8 is the commonly documented default cap.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "icarus",
    name: "Icarus",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.0,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "RocketWerkz hasn't published a formal dedicated-server-only spec; this is common hosting-guide consensus. The server is especially single-thread sensitive.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "No official figure. 8 GB is a workable minimum; 16 GB is commonly recommended.",
      },
      storage: {
        minimumGb: 20,
        recommendedGb: null,
        ssd: "recommended",
        notes: "NVMe SSD significantly improves loading times and world streaming.",
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 17777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Query port",
          required: true,
        },
      ],
      notes: [
        "The dedicated server tool is a Windows build. Linux hosts commonly run it via Wine or a community Docker image, but this isn't officially supported by RocketWerkz.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable per session; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "sons-of-the-forest",
    name: "Sons of the Forest",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: 6,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.3,
        recommendedClockGhz: null,
        minimumModel: "Intel i5-8400 or AMD Ryzen 5 2600",
        recommendedModel: "Intel i7-8700K or AMD Ryzen 7 3700X (higher player counts)",
        notes:
          "Endnight Games hasn't published a formal dedicated-server-only spec; this is common hosting-guide consensus.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 8,
        notes:
          "No official figure. 4 GB is a workable minimum; 8 GB is commonly recommended.",
      },
      storage: {
        minimumGb: 4,
        recommendedGb: 12,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 8766,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Query port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 9700,
          purpose: "BlobSync port",
          required: true,
        },
      ],
      notes: [
        "The dedicated server tool is a Windows build; Linux hosts commonly run it under Wine. The full official port list is wider still (TCP 27015/27036 and UDP 27015/27031-27036 in addition to the above) -- forward that broader range too if players have trouble connecting.",
      ],
    },
    limits: {
      maxPlayers: 8,
      notes: "8 is the commonly documented default player cap.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "soulmask",
    name: "Soulmask",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "The developers haven't published a formal dedicated-server spec; hosting-guide consensus recommends a quad-core CPU (dual-core is the practical floor).",
      },
      ram: {
        minimumGb: 16,
        recommendedGb: 32,
        notes:
          "No official figure. The server process alone commonly uses 12 GB+, making 16 GB a hard practical minimum; 24-32 GB is recommended for a public, long-running server.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: null,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 8777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Query/listing port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 18888,
          purpose: "Telnet admin (optional)",
          required: false,
        },
        {
          protocol: "TCP",
          port: 19000,
          purpose: "RCON (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "the-isle",
    name: "The Isle",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "The developers haven't published a formal dedicated-server spec. The Evrima branch is a single-thread-bound, AI-heavy survival sim, so hosting guides emphasize CPU clock speed over core count.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "No official figure. A server can idle around 4 GB but commonly needs considerably more (16 GB+) once the world fills with AI wildlife and players.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: 70,
        ssd: "recommended",
        notes: "Roughly 30 GB on Linux; budget at least 70 GB on Windows.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 7778,
          purpose: "Additional game traffic",
          required: false,
        },
        {
          protocol: "UDP",
          port: 7779,
          purpose: "Additional game traffic",
          required: false,
        },
      ],
      notes: [
        "The dedicated server currently installs from SteamCMD's evrima beta branch (-beta evrima).",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "scp-secret-laboratory",
    name: "SCP: Secret Laboratory",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 4,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Northwood Studios hasn't published a formal dedicated-server spec; hosting-guide consensus is 2 cores for a small server (up to ~20 slots), 4 cores for 35-40 players.",
      },
      ram: {
        minimumGb: 3,
        recommendedGb: 5,
        notes:
          "No official figure. A standard 30-slot server commonly runs comfortably in around 2 GB; 4-5 GB is recommended headroom, especially with plugins.",
      },
      storage: {
        minimumGb: 4,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
      ],
      notes: ["ARM CPUs (e.g. Raspberry Pi) aren't supported for hosting."],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; 20-40 players is the commonly documented practical range.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "stationeers",
    name: "Stationeers",
    official: {
      cpu: {
        minimumPhysicalCores: 6,
        recommendedPhysicalCores: 8,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "The developers haven't published a formal dedicated-server spec; hosting-guide consensus strongly recommends at least 6 cores due to atmospheric-simulation load -- the server will run on fewer, but becomes unstable under load.",
      },
      ram: {
        minimumGb: 16,
        recommendedGb: null,
        notes:
          "No official figure. 16 GB+ is strongly recommended; the server runs out of RAM quickly with less.",
      },
      storage: {
        minimumGb: 10,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 27016,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Query port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "empyrion-galactic-survival",
    name: "Empyrion - Galactic Survival",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.7,
        recommendedClockGhz: 3.8,
        minimumModel: "Intel Core i5-4590 or equivalent",
        recommendedModel: null,
        notes:
          "Eleon Game Studios' official minimum spec calls for a quad-core CPU around 3.7 GHz. The main game loop is heavily single-core-dependent, so clock speed matters more than core count.",
      },
      ram: {
        minimumGb: 8,
        recommendedGb: 16,
        notes:
          "8 GB is the officially documented minimum. 16 GB+ is commonly recommended for stable, high-performance hosting.",
      },
      storage: {
        minimumGb: 4,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 30000,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 30000,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 30001,
          purpose: "Additional game traffic",
          required: false,
        },
        {
          protocol: "TCP",
          port: 30001,
          purpose: "Additional game traffic",
          required: false,
        },
      ],
      notes: [
        "The official port range is 30000-30004 (TCP+UDP) -- forward the full range if players have connection trouble. Some hosts report better luck with the legacy fallback range 26900-26904 instead.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "nightingale",
    name: "Nightingale",
    official: {
      cpu: {
        minimumPhysicalCores: 4,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Inflexion Games hasn't published a formal dedicated-server-only spec; hosting-guide consensus recommends a modern quad-core.",
      },
      ram: {
        minimumGb: 16,
        recommendedGb: 32,
        notes:
          "No official figure. 16 GB is a common practical minimum, with 32 GB recommended for smooth performance.",
      },
      storage: {
        minimumGb: 5,
        recommendedGb: 40,
        ssd: "required",
        notes:
          "Server files are small, but NVMe SSD is effectively required for fast realm loading and portal transitions, not just recommended.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 8211,
          purpose: "Default game port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: 8,
      notes: "8 is the documented player cap per realm.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "necesse",
    name: "Necesse",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "No official dedicated-server-only spec is published; hosting-guide consensus recommends a modern dual-core, with strong single-core performance mattering most once a world has many automated settlements and NPCs.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "No official figure. 2 GB is workable for small worlds; 4 GB+ is recommended for larger settlements with 50+ NPCs.",
      },
      storage: {
        minimumGb: 2,
        recommendedGb: null,
        ssd: "recommended",
        notes:
          "NVMe recommended -- world save read/write performance affects chunk-loading smoothness.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 14159,
          purpose: "Default game port",
          required: true,
        },
      ],
      softwareRequirements: [
        "Java 17 or newer (Necesse is built with libGDX/Java).",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "rising-storm-2-vietnam",
    name: "Rising Storm 2: Vietnam",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 3.4,
        minimumModel: null,
        recommendedModel: "Intel Xeon E3-1270 (3.4 GHz) or equivalent, for a full 64-player server",
        notes:
          "Tripwire's community guidance is built around a 3.4 GHz-class Xeon for a full 64-player server; clock speed matters more than core count.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "No official figure. Roughly 2 GB per server instance is common guidance for a full 64-player server; budget more for Workshop-modded servers.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27015,
          purpose: "Steam query port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 20560,
          purpose: "Steam communication",
          required: false,
        },
        {
          protocol: "TCP",
          port: 8080,
          purpose: "Web admin (optional)",
          required: false,
        },
      ],
    },
    limits: {
      maxPlayers: 64,
      notes: "64 is Tripwire's documented full server-size cap.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "vintage-story",
    name: "Vintage Story",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: 4,
        recommendedLogicalCores: null,
        minimumClockGhz: 1.0,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Official guidance scales clock speed with player count: roughly 1 GHz base plus 100 MHz per player, across 4 threads.",
      },
      ram: {
        minimumGb: 1,
        recommendedGb: 4,
        baseGb: 1,
        perPlayerGb: 0.3,
        notes:
          "Official guidance is 1 GB base plus 300 MB per player. In practice, budget around 4 GB for a vanilla world and 8 GB+ for a heavily-modded one.",
      },
      storage: {
        minimumGb: 2,
        recommendedGb: null,
        ssd: "required",
        notes:
          "SSD is strongly required for version 1.20+ -- an HDD causes major lag spikes during autosaves and chunk generation.",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 42420,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 42420,
          purpose: "Default game port (version 1.20+)",
          required: true,
        },
      ],
      softwareRequirements: [
        "A .NET 8.0 runtime (Linux hosts need this installed separately).",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "wreckfest",
    name: "Wreckfest",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: 4.2,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Bugbear/THQ Nordic hasn't published a formal dedicated-server spec; community reports running a 24-player server comfortably on a 4.2 GHz-class quad-core. The server favours a single fast core per instance.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 8,
        notes:
          "No official figure. Community guidance suggests 8 GB is comfortable for a full 24-player server.",
      },
      storage: {
        minimumGb: 15,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 30100,
          purpose: "Default game port",
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
          port: 27015,
          purpose: "Steam (optional)",
          required: false,
        },
        {
          protocol: "UDP",
          port: 33540,
          purpose: "Steam communication (optional)",
          required: false,
        },
      ],
      notes: [
        "The dedicated server is a Windows build. Linux hosts commonly run it via Wine, but this isn't officially supported.",
      ],
    },
    limits: {
      maxPlayers: 24,
      notes: "24 is Wreckfest's documented full server-size cap.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "trackmania",
    name: "Trackmania",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 2.0,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes: "Nadeo's officially documented minimum server spec is a 2 GHz+ dual-core.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: null,
        notes: "2 GB is Nadeo's officially documented minimum per server instance.",
      },
      storage: {
        minimumGb: 5,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 2351,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "TCP",
          port: 2351,
          purpose: "Default game port",
          required: true,
        },
      ],
      softwareRequirements: [
        "A free Nadeo/Ubisoft dedicated-server account, created at trackmania.com, is required to run the server.",
      ],
      notes: [
        "The server also opens an XMLRPC port (default 5000/5001) for remote control -- this should never be forwarded to the internet; it's for local admin tools only.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable per server; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "craftopia",
    name: "Craftopia",
    official: {
      cpu: {
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes: "Pocketpair hasn't published a formal dedicated-server spec.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: null,
        notes: "No official figure beyond the commonly-cited 4 GB minimum.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 6587,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 6587,
          purpose: "Default game port",
          required: true,
        },
      ],
      notes: [
        "The full official port list is wider (TCP/UDP 27000-27037 in addition to the above) -- forward that broader range too if players have trouble connecting.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "path-of-titans",
    name: "Path of Titans",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 8,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: 3.0,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Alderon Games hasn't published a formal dedicated-server-only spec; hosting-guide consensus is 2 cores/3 GHz for a small 2-4 player server, scaling to an 8-core CPU for a 100+ player community server.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 16,
        notes:
          "No official figure. 4 GB covers a small server; 16 GB+ is recommended for a 100+ player community server.",
      },
      storage: {
        minimumGb: 30,
        recommendedGb: 50,
        ssd: "recommended",
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 7777,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 7778,
          purpose: "Additional game traffic",
          required: false,
        },
      ],
      notes: [
        "Servers won't start without a free Alderon Games auth token, generated from your Alderon Games account and passed to the server on launch.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "atlas",
    name: "Atlas",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: 8,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Grapeshot Games hasn't published a formal dedicated-server spec; hosting-guide consensus is 2 cores for a single 1x1 grid cell, scaling to 8 cores for a full 2x2 grid.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: 16,
        notes:
          "No official figure. 4 GB covers a single 1x1 grid cell; a 2x2 grid commonly needs 16 GB+.",
      },
      storage: {
        minimumGb: 20,
        recommendedGb: 40,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "UDP",
          port: 5761,
          purpose: "Default game port (example -- must be unique per grid cell)",
          required: true,
        },
        {
          protocol: "UDP",
          port: 57561,
          purpose: "Query port (example -- must be unique per grid cell)",
          required: true,
        },
      ],
      notes: [
        "Atlas' world is a grid of many small servers (one process per grid cell); each needs its own unique Port/QueryPort pair, and the full setup requires a local Redis server to coordinate them.",
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable per grid cell; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },

  {
    id: "colony-survival",
    name: "Colony Survival",
    official: {
      cpu: {
        minimumPhysicalCores: 2,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Pipliz Interactive hasn't published a formal dedicated-server spec; community guidance suggests roughly 2 CPU cores, with fast single-core performance mattering most for pathfinding/worker AI.",
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
        notes:
          "No official figure. Around 2 GB is typical, rising with world size, colonist count and mods.",
      },
      storage: {
        minimumGb: 2,
        recommendedGb: null,
        ssd: null,
      },
      supportedOperatingSystems: ["windows", "linux"],
      requiredPorts: [
        {
          protocol: "TCP",
          port: 27005,
          purpose: "Default game port",
          required: true,
        },
        {
          protocol: "UDP",
          port: 27005,
          purpose: "Default game port",
          required: true,
        },
      ],
    },
    limits: {
      maxPlayers: null,
      notes: "Configurable; no official fixed maximum documented.",
    },
    hosting: [
      {
        providerId: "gtxgaming",
        affiliateUrl: "https://www.gtxgaming.co.uk/clientarea/aff.php?aff=4348",
      },
    ],
  },
];
