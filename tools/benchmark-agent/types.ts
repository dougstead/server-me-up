// Shared types for the Server Me Up benchmark agent.
//
// This tool is deliberately standalone -- it has zero dependency on the
// Next.js app and is meant to be run directly from the command line
// against a real dedicated server process. See README.md for usage.

export type PlayerCountSource = "manual" | "rcon" | "log" | "unknown";

export type PlayerCountResult = {
    count: number | null;
    source: PlayerCountSource;
};

// Player-count collection is behind this interface so game-specific
// methods (Minecraft query protocol, RCON, log-tail parsing, ...) can be
// added later without changing anything else. Only ManualPlayerCountProvider
// exists today -- see player-count.ts.
export interface PlayerCountProvider {
    getPlayerCount(): Promise<PlayerCountResult>;
}

export type ActivityLevel = "idle" | "light" | "normal" | "heavy" | "unknown";

export type GameBenchmarkProfile = {
    id: string;
    name: string;
    // Candidate server process image names, matched case-insensitively
    // and with/without a trailing ".exe" -- see process-monitor.ts.
    processNames: string[];
    defaultPorts?: number[];
    playerCountMethod?: "manual" | "rcon" | "log" | "unknown";
};

export type BenchmarkStatus =
    | "completed"
    | "cancelled"
    | "server-exited"
    | "error";

// One sample, taken every --interval seconds. Every numeric field is
// nullable rather than faked when a metric can't be reliably obtained --
// see README.md "What this does NOT measure".
export type BenchmarkSample = {
    timestamp: string;

    process: {
        // See process-monitor.ts for exactly how these two are derived
        // from consecutive samples, and README.md for what they mean.
        cpuPercentMachine: number | null;
        cpuPercentSingleCore: number | null;
        workingSetMb: number | null;
        privateMemoryMb: number | null;
        threadCount: number | null;
    };

    system: {
        cpuPercent: number | null;
        usedMemoryMb: number | null;
        availableMemoryMb: number | null;
    };

    disk: {
        readBytesPerSecond: number | null;
        writeBytesPerSecond: number | null;
    };

    network: {
        receiveBytesPerSecond: number | null;
        transmitBytesPerSecond: number | null;
    };

    players: {
        count: number | null;
        source: PlayerCountSource;
    };
};

export type SummaryStat = {
    min: number;
    max: number;
    mean: number;
    median: number;
    p95: number;
};

export type BenchmarkSummary = {
    sampleCount: number;
    processRamMb: SummaryStat | null;
    processCpuPercentSingleCore: SummaryStat | null;
    processCpuPercentMachine: SummaryStat | null;
    systemCpuPercent: SummaryStat | null;
    systemUsedMemoryMb: SummaryStat | null;
    networkUploadBytesPerSecond: SummaryStat | null;
    networkDownloadBytesPerSecond: SummaryStat | null;
};

export type MachineInfo = {
    hostname: string;
    os: string;
    cpuModel: string;
    // Null only if even the Node os-module fallback couldn't determine
    // this (physical core count specifically needs WMI on Windows).
    physicalCores: number | null;
    logicalThreads: number;
    totalRamGb: number;
};

export type ServerInfo = {
    processName: string;
    executablePath: string | null;
    pid: number;
};

export type TestMetadata = {
    expectedPlayerCount: number | null;
    notes: string | null;
    world: string | null;
    modsEnabled: boolean | "unknown";
    serverVersion: string | null;
    activityLevel: ActivityLevel;
    description: string | null;
};

export type BenchmarkMetadata = {
    benchmarkVersion: string;
    startTime: string;
    endTime: string;
    durationMinutesRequested: number;
    durationMinutesActual: number;
    sampleIntervalSeconds: number;
    status: BenchmarkStatus;
    game: {
        id: string;
        name: string;
    };
    server: ServerInfo;
    machine: MachineInfo;
    test: TestMetadata;
};

// Top-level shape of a written benchmark JSON file. `schemaVersion` is
// here (and only here) specifically so a future Server Me Up ingestion API
// can tell which shape it's looking at -- see README.md "Future design".
export type BenchmarkResult = {
    schemaVersion: number;
    metadata: BenchmarkMetadata;
    summary: BenchmarkSummary;
    samples: BenchmarkSample[];
};
