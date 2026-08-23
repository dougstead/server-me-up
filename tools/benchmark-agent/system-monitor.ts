import os from "node:os";
import { runPowerShellScript } from "./powershell";
import type { MachineInfo } from "./types";

type MachineInfoScriptResult =
    | {
          ok: true;
          cpuModel: string;
          physicalCores: number;
          logicalThreads: number;
          totalRamBytes: number;
          osCaption: string;
          osVersion: string;
          hostname: string;
      }
    | { ok: false; error: string };

// Static hardware info, collected once at startup (not per sample) via a
// single CIM query -- see windows/get-machine-info.ps1. Physical core
// count specifically isn't available from Node's own os module, which is
// the only reason this shells out at all; everything else here could also
// come from os.cpus()/os.totalmem().
export async function getMachineInfo(): Promise<MachineInfo> {
    try {
        const result = await runPowerShellScript<MachineInfoScriptResult>(
            "get-machine-info.ps1",
        );

        if (result.ok) {
            return {
                hostname: result.hostname,
                os: `${result.osCaption} (${result.osVersion})`,
                cpuModel: result.cpuModel,
                physicalCores: result.physicalCores,
                logicalThreads: result.logicalThreads,
                totalRamGb:
                    Math.round((result.totalRamBytes / 1024 ** 3) * 10) / 10,
            };
        }
    } catch {
        // Fall through to the Node-only fallback below.
    }

    // If PowerShell is unavailable for some reason, fall back to what
    // Node's own os module can tell us -- less complete (no physical core
    // count, since hyperthreading isn't visible to it) but keeps the tool
    // usable rather than failing outright.
    const cpus = os.cpus();

    return {
        hostname: os.hostname(),
        os: `${os.type()} ${os.release()}`,
        cpuModel: cpus[0]?.model ?? "Unknown",
        physicalCores: null,
        logicalThreads: cpus.length,
        totalRamGb: Math.round((os.totalmem() / 1024 ** 3) * 10) / 10,
    };
}

// System-wide CPU%, computed from Node's own os.cpus() -- no subprocess
// needed. Works the same way process CPU% does (see process-monitor.ts):
// diff cumulative tick counts between two calls, divide the non-idle delta
// by the total delta. Call sampleCpuPercent() once per interval; the first
// call always returns null since there's nothing to diff against yet.
export class SystemCpuSampler {
    private previous: os.CpuInfo[] | null = null;

    sampleCpuPercent(): number | null {
        const current = os.cpus();

        if (!this.previous || this.previous.length !== current.length) {
            this.previous = current;
            return null;
        }

        let idleDelta = 0;
        let totalDelta = 0;

        for (let i = 0; i < current.length; i++) {
            const prevTimes = this.previous[i].times;
            const currTimes = current[i].times;

            const prevTotal =
                prevTimes.user +
                prevTimes.nice +
                prevTimes.sys +
                prevTimes.idle +
                prevTimes.irq;
            const currTotal =
                currTimes.user +
                currTimes.nice +
                currTimes.sys +
                currTimes.idle +
                currTimes.irq;

            idleDelta += currTimes.idle - prevTimes.idle;
            totalDelta += currTotal - prevTotal;
        }

        this.previous = current;

        if (totalDelta <= 0) {
            return null;
        }

        return Math.round((1 - idleDelta / totalDelta) * 1000) / 10;
    }
}

export function getSystemMemoryMb(): {
    usedMemoryMb: number;
    availableMemoryMb: number;
} {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();

    return {
        usedMemoryMb: Math.round((totalBytes - freeBytes) / (1024 * 1024)),
        availableMemoryMb: Math.round(freeBytes / (1024 * 1024)),
    };
}
