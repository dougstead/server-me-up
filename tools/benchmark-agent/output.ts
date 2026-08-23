import fs from "node:fs/promises";
import path from "node:path";
import type {
    BenchmarkResult,
    BenchmarkSample,
    BenchmarkSummary,
    SummaryStat,
} from "./types";

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

export function computeSummaryStat(values: number[]): SummaryStat | null {
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

function collectNumeric(
    samples: BenchmarkSample[],
    select: (sample: BenchmarkSample) => number | null,
): number[] {
    return samples
        .map(select)
        .filter(
            (value): value is number =>
                value !== null && Number.isFinite(value),
        );
}

export function computeSummary(samples: BenchmarkSample[]): BenchmarkSummary {
    return {
        sampleCount: samples.length,
        processRamMb: computeSummaryStat(
            collectNumeric(samples, (s) => s.process.workingSetMb),
        ),
        processCpuPercentSingleCore: computeSummaryStat(
            collectNumeric(samples, (s) => s.process.cpuPercentSingleCore),
        ),
        processCpuPercentMachine: computeSummaryStat(
            collectNumeric(samples, (s) => s.process.cpuPercentMachine),
        ),
        systemCpuPercent: computeSummaryStat(
            collectNumeric(samples, (s) => s.system.cpuPercent),
        ),
        systemUsedMemoryMb: computeSummaryStat(
            collectNumeric(samples, (s) => s.system.usedMemoryMb),
        ),
        networkUploadBytesPerSecond: computeSummaryStat(
            collectNumeric(samples, (s) => s.network.transmitBytesPerSecond),
        ),
        networkDownloadBytesPerSecond: computeSummaryStat(
            collectNumeric(samples, (s) => s.network.receiveBytesPerSecond),
        ),
    };
}

// "2026-08-23T18:15:00.123Z" -> "2026-08-23T181500"
function formatTimestampForFilename(isoString: string): string {
    return isoString.replace(/\.\d{3}Z$/, "").replace(/:/g, "");
}

export async function writeBenchmarkFile(
    result: BenchmarkResult,
    outputDirOverride?: string,
): Promise<string> {
    const outputDir = outputDirOverride
        ? path.resolve(outputDirOverride)
        : path.join(process.cwd(), "data", "benchmarks");

    await fs.mkdir(outputDir, { recursive: true });

    const timestamp = formatTimestampForFilename(result.metadata.startTime);
    const fileName = `${result.metadata.game.id}-${timestamp}.json`;
    const filePath = path.join(outputDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(result, null, 2), "utf8");

    return filePath;
}

export function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, "0"))
        .join(":");
}

export function formatProgressLine(
    elapsedMs: number,
    sample: BenchmarkSample,
): string {
    const time = formatDuration(elapsedMs);
    const players =
        sample.players.count !== null ? sample.players.count : "?";
    const ram =
        sample.process.workingSetMb !== null
            ? `${sample.process.workingSetMb} MB`
            : "n/a";
    const cpu =
        sample.process.cpuPercentSingleCore !== null
            ? `${sample.process.cpuPercentSingleCore}% core`
            : "n/a";
    const upload =
        sample.network.transmitBytesPerSecond !== null
            ? `${((sample.network.transmitBytesPerSecond * 8) / 1_000_000).toFixed(1)} Mbps`
            : "n/a";

    return `[${time}] players=${players} | RAM=${ram} | CPU=${cpu} | upload=${upload}`;
}

export function printCompletionSummary(
    result: BenchmarkResult,
    filePath: string,
): void {
    const { metadata, summary } = result;

    console.log("");
    console.log("Benchmark complete");
    console.log("");
    console.log(`Game: ${metadata.game.name}`);
    console.log(`Duration: ${metadata.durationMinutesActual}m`);
    console.log(`Samples: ${summary.sampleCount}`);
    console.log(`Status: ${metadata.status}`);

    if (summary.processRamMb) {
        console.log("");
        console.log("RAM:");
        console.log(
            `  Average: ${(summary.processRamMb.mean / 1024).toFixed(1)} GB`,
        );
        console.log(
            `  Peak: ${(summary.processRamMb.max / 1024).toFixed(1)} GB`,
        );
    }

    if (summary.processCpuPercentSingleCore) {
        console.log("");
        console.log("CPU:");
        console.log(
            `  Average single-core: ${summary.processCpuPercentSingleCore.mean.toFixed(0)}%`,
        );
        console.log(
            `  Peak single-core: ${summary.processCpuPercentSingleCore.max.toFixed(0)}%`,
        );
    }

    console.log("");
    console.log("Result:");
    console.log(filePath);
}
