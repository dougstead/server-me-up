#!/usr/bin/env node
import path from "node:path";
import { findGameProfile, gameProfiles } from "./game-profiles";
import { findServerProcess, ProcessMonitor } from "./process-monitor";
import {
    getMachineInfo,
    getSystemMemoryMb,
    SystemCpuSampler,
} from "./system-monitor";
import { sampleNetwork } from "./network-monitor";
import { ManualPlayerCountProvider } from "./player-count";
import {
    computeSummary,
    formatProgressLine,
    printCompletionSummary,
    writeBenchmarkFile,
} from "./output";
import type {
    ActivityLevel,
    BenchmarkResult,
    BenchmarkSample,
    BenchmarkStatus,
} from "./types";

const SCHEMA_VERSION = 1;
const BENCHMARK_VERSION = "0.1.0";
const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_INTERVAL_SECONDS = 5;
// Each sample takes roughly 1-2s to collect on Windows (two PowerShell
// invocations run in parallel -- see process-monitor.ts / network-monitor.ts).
// Below this, sampling will reliably fall behind the requested interval.
const MIN_RECOMMENDED_INTERVAL_SECONDS = 3;
const ACTIVITY_LEVELS: ActivityLevel[] = [
    "idle",
    "light",
    "normal",
    "heavy",
    "unknown",
];

type ParsedArgs = Record<string, string>;

function parseArgs(argv: string[]): ParsedArgs {
    const args: ParsedArgs = {};

    for (let i = 0; i < argv.length; i++) {
        const token = argv[i];

        if (!token.startsWith("--")) {
            continue;
        }

        const key = token.slice(2);
        const next = argv[i + 1];

        if (next !== undefined && !next.startsWith("--")) {
            args[key] = next;
            i++;
        } else {
            args[key] = "true";
        }
    }

    return args;
}

function printUsageAndExit(message?: string): never {
    if (message) {
        console.error(message);
        console.error("");
    }

    console.error("Usage: npm run benchmark -- --game <id> [options]");
    console.error("");
    console.error(
        `Available games: ${gameProfiles.map((p) => p.id).join(", ")}`,
    );
    console.error("");
    console.error("Options:");
    console.error("  --game <id>            Game profile id (required)");
    console.error(
        "  --process <name>       Override the process name to monitor",
    );
    console.error(
        "  --duration <minutes>   How long to run, in minutes (default 60)",
    );
    console.error(
        "  --interval <seconds>   Seconds between samples (default 5)",
    );
    console.error(
        "  --players <n>          Manual player count recorded on every sample",
    );
    console.error(
        "  --output <dir>         Override the output directory (default data/benchmarks)",
    );
    console.error(
        "  --notes <text>         Free-text notes stored in the result file",
    );
    console.error("  --world <name>         World/save name");
    console.error(
        "  --mods <true|false>    Whether mods are enabled (default unknown)",
    );
    console.error(
        "  --server-version <v>   Game/server version string",
    );
    console.error(
        "  --activity <level>     idle | light | normal | heavy (default unknown)",
    );
    console.error(
        '  --description <text>   e.g. "4 players exploring different biomes"',
    );

    process.exit(1);
}

function sleep(ms: number, isCancelled: () => boolean): Promise<void> {
    return new Promise((resolve) => {
        const checkIntervalMs = 200;
        let waited = 0;

        const timer = setInterval(() => {
            waited += checkIntervalMs;

            if (isCancelled() || waited >= ms) {
                clearInterval(timer);
                resolve();
            }
        }, checkIntervalMs);
    });
}

async function main() {
    const args = parseArgs(process.argv.slice(2));

    const gameId = args.game;

    if (!gameId) {
        printUsageAndExit("Missing required --game <id>");
    }

    const profile = findGameProfile(gameId);

    if (!profile) {
        printUsageAndExit(
            `Unknown game "${gameId}". Available: ${gameProfiles.map((p) => p.id).join(", ")}`,
        );
    }

    const durationMinutes = args.duration
        ? Number(args.duration)
        : DEFAULT_DURATION_MINUTES;
    const intervalSeconds = args.interval
        ? Number(args.interval)
        : DEFAULT_INTERVAL_SECONDS;

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
        printUsageAndExit(`Invalid --duration "${args.duration}"`);
    }

    if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
        printUsageAndExit(`Invalid --interval "${args.interval}"`);
    }

    if (intervalSeconds < MIN_RECOMMENDED_INTERVAL_SECONDS) {
        console.warn(
            `Warning: --interval ${intervalSeconds}s is below the recommended minimum of ${MIN_RECOMMENDED_INTERVAL_SECONDS}s. Each sample takes roughly 1-2s to collect on Windows, so a short interval may fall behind real time -- see the README.`,
        );
    }

    let expectedPlayerCount: number | null = null;

    if (args.players !== undefined) {
        expectedPlayerCount = Number(args.players);

        if (!Number.isFinite(expectedPlayerCount)) {
            printUsageAndExit(`Invalid --players "${args.players}"`);
        }
    }

    const activityLevel: ActivityLevel = ACTIVITY_LEVELS.includes(
        args.activity as ActivityLevel,
    )
        ? (args.activity as ActivityLevel)
        : "unknown";

    const modsArg = args.mods?.toLowerCase();
    const modsEnabled: boolean | "unknown" =
        modsArg === "true" ? true : modsArg === "false" ? false : "unknown";

    console.log(`Looking for ${profile.name} server process...`);

    const candidateNames = args.process ? [args.process] : profile.processNames;
    const discovery = await findServerProcess(candidateNames);

    if (discovery.status === "not-found") {
        console.error("");
        console.error(`Could not find ${profile.name} server process.`);
        console.error("Expected one of:");

        for (const name of candidateNames) {
            console.error(`  - ${name}`);
        }

        if (discovery.candidateMatches.length > 0) {
            console.error("");
            console.error("Possible matches:");

            for (const match of discovery.candidateMatches) {
                console.error(`  - ${match.name} (PID ${match.id})`);
            }

            console.error("");
            console.error(
                "If one of these is right, re-run with --process <name>.",
            );
        }

        process.exit(1);
    }

    console.log(
        `Found ${discovery.processName} (PID ${discovery.pid})${
            discovery.executablePath ? ` at ${discovery.executablePath}` : ""
        }`,
    );

    console.log("Collecting machine info...");
    const machineInfo = await getMachineInfo();

    const playerCountProvider = new ManualPlayerCountProvider(
        expectedPlayerCount,
    );
    const processMonitor = new ProcessMonitor(
        discovery.pid,
        machineInfo.logicalThreads,
    );
    const systemCpuSampler = new SystemCpuSampler();

    const samples: BenchmarkSample[] = [];
    const startTime = new Date();
    let cancelled = false;
    let serverExited = false;
    let statusOverride: BenchmarkStatus | null = null;

    const handleSigint = () => {
        if (!cancelled) {
            cancelled = true;
            console.log("\nStopping -- writing collected data...");
        }
    };

    process.on("SIGINT", handleSigint);

    console.log(
        `Benchmarking ${profile.name} for ${durationMinutes}m, sampling every ${intervalSeconds}s. Press Ctrl+C to stop early.`,
    );
    console.log("");

    const durationMs = durationMinutes * 60 * 1000;
    const intervalMs = intervalSeconds * 1000;
    const loopStart = Date.now();

    try {
        while (
            !cancelled &&
            !serverExited &&
            Date.now() - loopStart < durationMs
        ) {
            const sampleStart = Date.now();

            const [processSample, networkSample] = await Promise.all([
                processMonitor.sample(),
                sampleNetwork(),
            ]);

            if (!processSample.found) {
                serverExited = true;
                break;
            }

            const systemCpuPercent = systemCpuSampler.sampleCpuPercent();
            const { usedMemoryMb, availableMemoryMb } = getSystemMemoryMb();
            const playerResult = await playerCountProvider.getPlayerCount();

            const sample: BenchmarkSample = {
                timestamp: new Date().toISOString(),
                process: {
                    cpuPercentMachine: processSample.cpuPercentMachine,
                    cpuPercentSingleCore: processSample.cpuPercentSingleCore,
                    workingSetMb: processSample.workingSetMb,
                    privateMemoryMb: processSample.privateMemoryMb,
                    threadCount: processSample.threadCount,
                },
                system: {
                    cpuPercent: systemCpuPercent,
                    usedMemoryMb,
                    availableMemoryMb,
                },
                disk: {
                    readBytesPerSecond: processSample.diskReadBytesPerSecond,
                    writeBytesPerSecond: processSample.diskWriteBytesPerSecond,
                },
                network: {
                    receiveBytesPerSecond: networkSample.receiveBytesPerSecond,
                    transmitBytesPerSecond: networkSample.transmitBytesPerSecond,
                },
                players: playerResult,
            };

            samples.push(sample);
            console.log(formatProgressLine(Date.now() - loopStart, sample));

            const elapsedThisSample = Date.now() - sampleStart;
            const remainingWait = intervalMs - elapsedThisSample;

            if (remainingWait > 0 && !cancelled) {
                await sleep(remainingWait, () => cancelled);
            }
        }
    } catch (error) {
        statusOverride = "error";
        console.error("");
        console.error("Benchmark stopped due to an error:");
        console.error(error instanceof Error ? error.message : String(error));
    } finally {
        process.off("SIGINT", handleSigint);
    }

    if (serverExited) {
        console.error("");
        console.error(
            `${profile.name} server process (PID ${discovery.pid}) exited during the benchmark -- stopping.`,
        );
    }

    const status: BenchmarkStatus =
        statusOverride ??
        (cancelled ? "cancelled" : serverExited ? "server-exited" : "completed");

    const endTime = new Date();

    const result: BenchmarkResult = {
        schemaVersion: SCHEMA_VERSION,
        metadata: {
            benchmarkVersion: BENCHMARK_VERSION,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationMinutesRequested: durationMinutes,
            durationMinutesActual:
                Math.round(
                    ((endTime.getTime() - startTime.getTime()) / 60000) * 100,
                ) / 100,
            sampleIntervalSeconds: intervalSeconds,
            status,
            game: { id: profile.id, name: profile.name },
            server: {
                processName: discovery.processName,
                executablePath: discovery.executablePath,
                pid: discovery.pid,
            },
            machine: machineInfo,
            test: {
                expectedPlayerCount,
                notes: args.notes ?? null,
                world: args.world ?? null,
                modsEnabled,
                serverVersion: args["server-version"] ?? null,
                activityLevel,
                description: args.description ?? null,
            },
        },
        summary: computeSummary(samples),
        samples,
    };

    const outputDirOverride = args.output ? path.resolve(args.output) : undefined;
    const filePath = await writeBenchmarkFile(result, outputDirOverride);

    printCompletionSummary(result, filePath);

    if (status === "error") {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
