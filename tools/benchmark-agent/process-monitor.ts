import { runPowerShellScript } from "./powershell";

type ProcessSampleScriptResult =
    | {
          found: true;
          pid: number;
          processName: string;
          path: string | null;
          totalProcessorTimeMs: number;
          workingSet64: number;
          privateMemorySize64: number;
          threadCount: number;
          startTimeIso: string;
          ioReadBytesPerSec: number | null;
          ioWriteBytesPerSec: number | null;
      }
    | { found: false };

export type ListedProcess = {
    id: number;
    name: string;
    path: string | null;
};

export type ProcessDiscoveryResult =
    | {
          status: "found";
          pid: number;
          processName: string;
          executablePath: string | null;
      }
    | { status: "not-found"; candidateMatches: ListedProcess[] };

function normalizeProcessName(name: string): string {
    return name.toLowerCase().replace(/\.exe$/, "");
}

export async function listProcesses(): Promise<ListedProcess[]> {
    return runPowerShellScript<ListedProcess[]>("list-processes.ps1");
}

// Finds the target server process from a list of candidate names (either
// the game profile's processNames, or a single-element list from
// --process). Returns partial-match candidates when nothing matches
// exactly, so the CLI can print a "possible matches" list instead of just
// failing outright -- see index.ts.
export async function findServerProcess(
    candidateNames: string[],
): Promise<ProcessDiscoveryResult> {
    const processes = await listProcesses();
    const normalizedCandidates = candidateNames.map(normalizeProcessName);

    const exactMatch = processes.find((process) =>
        normalizedCandidates.includes(normalizeProcessName(process.name)),
    );

    if (exactMatch) {
        return {
            status: "found",
            pid: exactMatch.id,
            processName: exactMatch.name,
            executablePath: exactMatch.path,
        };
    }

    const candidateMatches = processes.filter((process) => {
        const normalizedProcessName = normalizeProcessName(process.name);

        return normalizedCandidates.some(
            (candidate) =>
                normalizedProcessName.includes(candidate) ||
                candidate.includes(normalizedProcessName),
        );
    });

    return { status: "not-found", candidateMatches };
}

export type ProcessSample = {
    found: boolean;
    workingSetMb: number | null;
    privateMemoryMb: number | null;
    threadCount: number | null;
    cpuPercentMachine: number | null;
    cpuPercentSingleCore: number | null;
    diskReadBytesPerSecond: number | null;
    diskWriteBytesPerSecond: number | null;
};

// Samples one process by PID over time. CPU% is derived by diffing
// TotalProcessorTime (a cumulative counter) between this call and the
// previous one -- see README.md "How CPU percentages are calculated" for
// the full explanation. That means the first sample() call always returns
// null CPU values, since there's nothing to diff against yet.
export class ProcessMonitor {
    private readonly pid: number;
    private readonly logicalThreads: number;
    private previousCpuMs: number | null = null;
    private previousSampleTime: number | null = null;

    constructor(pid: number, logicalThreads: number) {
        this.pid = pid;
        this.logicalThreads = logicalThreads;
    }

    async sample(): Promise<ProcessSample> {
        const result = await runPowerShellScript<ProcessSampleScriptResult>(
            "get-process-sample.ps1",
            ["-ProcessId", String(this.pid)],
        );

        const now = Date.now();

        if (!result.found) {
            return {
                found: false,
                workingSetMb: null,
                privateMemoryMb: null,
                threadCount: null,
                cpuPercentMachine: null,
                cpuPercentSingleCore: null,
                diskReadBytesPerSecond: null,
                diskWriteBytesPerSecond: null,
            };
        }

        let cpuPercentSingleCore: number | null = null;
        let cpuPercentMachine: number | null = null;

        if (this.previousCpuMs !== null && this.previousSampleTime !== null) {
            const deltaCpuMs = result.totalProcessorTimeMs - this.previousCpuMs;
            const deltaWallMs = now - this.previousSampleTime;

            if (deltaWallMs > 0) {
                // "Single core" convention: 100% means one logical core
                // fully busy. Can exceed 100 if the process is using more
                // than one core at once (e.g. 350% = ~3.5 cores).
                const rawPercent = (deltaCpuMs / deltaWallMs) * 100;
                cpuPercentSingleCore = Math.max(0, Math.round(rawPercent * 10) / 10);

                // "Machine" convention: normalized to the whole machine's
                // total capacity, so it never exceeds 100.
                const machinePercent = rawPercent / this.logicalThreads;
                cpuPercentMachine = Math.max(
                    0,
                    Math.min(100, Math.round(machinePercent * 10) / 10),
                );
            }
        }

        this.previousCpuMs = result.totalProcessorTimeMs;
        this.previousSampleTime = now;

        return {
            found: true,
            workingSetMb: Math.round(result.workingSet64 / (1024 * 1024)),
            privateMemoryMb: Math.round(
                result.privateMemorySize64 / (1024 * 1024),
            ),
            threadCount: result.threadCount,
            cpuPercentMachine,
            cpuPercentSingleCore,
            diskReadBytesPerSecond:
                result.ioReadBytesPerSec !== null
                    ? Math.round(result.ioReadBytesPerSec)
                    : null,
            diskWriteBytesPerSecond:
                result.ioWriteBytesPerSec !== null
                    ? Math.round(result.ioWriteBytesPerSec)
                    : null,
        };
    }
}
