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
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Mojang does not currently publish dedicated-server CPU hardware requirements for Java Edition.",
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
        notes:
          "Mojang does not currently publish a dedicated-server RAM requirement for Java Edition.",
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
        recommendedModel: null,
      },
      ram: {
        minimumGb: 4,
        recommendedGb: null,
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
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Official community documentation recommends 2 logical cores per Survival Evolved server instance and favours strong single-thread performance. Scaling beyond 4 logical cores provides little benefit.",
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
        notes:
          "RAM varies heavily by map and world age. Official figures for an empty map range from roughly 3 GB to 12.5 GB depending on the map, with approximately 50-150 MiB additional memory per connected player.",
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
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Facepunch does not publish a fixed CPU minimum; CPU demand increases with player count, world size and server activity.",
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
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Hypixel Studios does not give a fixed CPU minimum. CPU usage is driven mainly by player and entity counts.",
      },
      ram: {
        minimumGb: 4,
        recommendedGb: null,
        notes:
          "At least 4 GB memory is required. RAM use depends strongly on loaded world area and view distance.",
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
        minimumModel: null,
        recommendedModel: null,
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
        minimumPhysicalCores: null,
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Iron Gate does not currently publish dedicated-server CPU hardware requirements.",
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
        notes:
          "Iron Gate does not currently publish a dedicated-server RAM requirement.",
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
      },
      ram: {
        minimumGb: 2,
        recommendedGb: 4,
      },
      storage: {
        minimumGb: 32,
        recommendedGb: 32,
        ssd: "recommended",
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
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
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
          "TaleWorlds uses 4 GB for smaller battles and 8 GB for larger battles in its default hosting examples.",
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
        minimumGb: null,
        recommendedGb: null,
        ssd: "recommended",
        notes:
          "Pocketpair recommends fast SSD storage and warns that slow storage can contribute to save-data corruption.",
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
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "The Indie Stone does not currently publish a simple dedicated-server CPU minimum.",
      },
      ram: {
        minimumGb: null,
        recommendedGb: null,
        notes:
          "RAM needs vary with player count, mods and world state; no current simple official minimum is published.",
      },
      storage: {
        minimumGb: null,
        recommendedGb: null,
        ssd: null,
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
        minimumGb: 1,
        recommendedGb: null,
        ssd: "recommended",
        notes:
          "SSD is recommended for complex law systems that cause heavy database access.",
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
        recommendedPhysicalCores: null,
        minimumLogicalCores: null,
        recommendedLogicalCores: null,
        minimumClockGhz: null,
        recommendedClockGhz: null,
        minimumModel: null,
        recommendedModel: null,
        notes:
          "Jagex's official container image documents a minimum of 1 CPU core.",
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
