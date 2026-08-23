import { runPowerShellScript } from "./powershell";

type NetworkSampleScriptResult =
    | { ok: true; receiveBytesPerSecond: number; transmitBytesPerSecond: number }
    | { ok: false };

export type NetworkSample = {
    receiveBytesPerSecond: number | null;
    transmitBytesPerSecond: number | null;
};

// System-wide network throughput (not per-process -- Windows doesn't
// expose reliable per-process network byte counters without significantly
// more complexity than is justified for v1; see windows/get-network-sample.ps1).
export async function sampleNetwork(): Promise<NetworkSample> {
    try {
        const result = await runPowerShellScript<NetworkSampleScriptResult>(
            "get-network-sample.ps1",
        );

        if (result.ok) {
            return {
                receiveBytesPerSecond: Math.round(result.receiveBytesPerSecond),
                transmitBytesPerSecond: Math.round(result.transmitBytesPerSecond),
            };
        }
    } catch {
        // Fall through to null -- see get-network-sample.ps1's header
        // comment for why this can occasionally fail (perf counter
        // provider quirks observed during testing).
    }

    return { receiveBytesPerSecond: null, transmitBytesPerSecond: null };
}
