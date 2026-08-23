import fs from "node:fs";
import path from "node:path";
// Type-only import from the standalone benchmark agent tool -- this is
// erased entirely at compile time (zero runtime code, no bundling), so it
// doesn't create a real dependency between the site and the CLI tool. The
// tiny summary-stat math below is deliberately duplicated rather than
// imported from tools/benchmark-agent/output.ts, to keep that tool free to
// change independently without silently affecting the website.
import type { BenchmarkResult, SummaryStat } from "@/tools/benchmark-agent/types";

export type GameBenchmarkInsights = {
    gameId: string;
    runCount: number;
    totalSampleCount: number;
    earliestRun: string;
    latestRun: string;
    playerCountsTested: number[];
    machinesTested: string[];
    ramMb: SummaryStat | null;
    cpuPercentSingleCore: SummaryStat | null;
    networkUploadBytesPerSecond: SummaryStat | null;
    networkDownloadBytesPerSecond: SummaryStat | null;
};

function benchmarksDir(): string {
    return path.join(process.cwd(), "data", "benchmarks");
}

function percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 1) {
        return sortedValues[0];
    }

    const index = (p / 100) * (sortedValues.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);

    if (lowerIndex === upperIndex) {
        return sortedValues[lowerIndex];
    }

    const weight = index - lowerIndex;

    return (
        sortedValues[lowerIndex] * (1 - weight) +
        sortedValues[upperIndex] * weight
    );
}

function summarize(values: number[]): SummaryStat | null {
    if (values.length === 0) {
        return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const sum = sorted.reduce((total, value) => total + value, 0);

    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: Math.round((sum / sorted.length) * 100) / 100,
        median: Math.round(percentile(sorted, 50) * 100) / 100,
        p95: Math.round(percentile(sorted, 95) * 100) / 100,
    };
}

function numericValues<T>(
    items: T[],
    select: (item: T) => number | null,
): number[] {
    return items
        .map(select)
        .filter(
            (value): value is number =>
                value !== null && Number.isFinite(value),
        );
}

// Reads every data/benchmarks/*.json file. This directory is gitignored --
// it exists only on machines where someone has actually run
// `npm run benchmark`, so on a fresh checkout (or the deployed site) it
// simply won't exist. That's expected, not an error: return an empty list
// rather than throwing, the same way the rest of this codebase treats
// "no data available" as a normal, representable state rather than a
// failure.
function readAllBenchmarkResults(): BenchmarkResult[] {
    let fileNames: string[];

    try {
        fileNames = fs
            .readdirSync(benchmarksDir())
            .filter((name) => name.endsWith(".json"));
    } catch {
        return [];
    }

    const results: BenchmarkResult[] = [];

    for (const fileName of fileNames) {
        try {
            const raw = fs.readFileSync(
                path.join(benchmarksDir(), fileName),
                "utf8",
            );
            const parsed = JSON.parse(raw) as Partial<BenchmarkResult>;

            // Only trust files that at least look like a real benchmark
            // result -- skip anything malformed rather than failing the
            // whole page/build over one bad file.
            if (
                parsed.schemaVersion &&
                parsed.metadata?.game?.id &&
                Array.isArray(parsed.samples)
            ) {
                results.push(parsed as BenchmarkResult);
            }
        } catch {
            // Skip unreadable/corrupt files.
        }
    }

    return results;
}

// Aggregates every local benchmark run, grouped by game id. Computed once
// per call (at build time for the statically-generated pages that use
// this) -- new benchmark runs show up after the next `npm run build`, the
// same way every other build-time-sourced data on this site works (game
// specs, config templates, etc.).
export function getAllBenchmarkInsights(): Record<
    string,
    GameBenchmarkInsights
> {
    const results = readAllBenchmarkResults();
    const runsByGame = new Map<string, BenchmarkResult[]>();

    for (const result of results) {
        const gameId = result.metadata.game.id;
        const existing = runsByGame.get(gameId) ?? [];
        existing.push(result);
        runsByGame.set(gameId, existing);
    }

    const insights: Record<string, GameBenchmarkInsights> = {};

    for (const [gameId, runs] of runsByGame) {
        const samples = runs.flatMap((run) => run.samples);

        const playerCountsTested = [
            ...new Set(
                runs
                    .map((run) => run.metadata.test.expectedPlayerCount)
                    .filter((count): count is number => count !== null),
            ),
        ].sort((a, b) => a - b);

        const machinesTested = [
            ...new Set(runs.map((run) => run.metadata.machine.cpuModel)),
        ].sort();

        const runTimes = runs.map((run) => run.metadata.startTime).sort();

        insights[gameId] = {
            gameId,
            runCount: runs.length,
            totalSampleCount: samples.length,
            earliestRun: runTimes[0],
            latestRun: runTimes[runTimes.length - 1],
            playerCountsTested,
            machinesTested,
            ramMb: summarize(
                numericValues(samples, (s) => s.process.workingSetMb),
            ),
            cpuPercentSingleCore: summarize(
                numericValues(samples, (s) => s.process.cpuPercentSingleCore),
            ),
            networkUploadBytesPerSecond: summarize(
                numericValues(
                    samples,
                    (s) => s.network.transmitBytesPerSecond,
                ),
            ),
            networkDownloadBytesPerSecond: summarize(
                numericValues(samples, (s) => s.network.receiveBytesPerSecond),
            ),
        };
    }

    return insights;
}

export function getBenchmarkInsightsForGame(
    gameId: string,
): GameBenchmarkInsights | null {
    return getAllBenchmarkInsights()[gameId] ?? null;
}
