import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Resolved relative to the current working directory, matching the
// convention already used in scripts/import-cpus.ts. This tool is meant
// to be run via `npm run benchmark` (or directly with `tsx
// tools/benchmark-agent/index.ts`) from the repo root -- see README.md.
function windowsScriptsDir(): string {
    return path.join(process.cwd(), "tools", "benchmark-agent", "windows");
}

// Runs one of the bundled windows/*.ps1 scripts and parses its JSON
// stdout. Every script in windows/ always emits exactly one JSON value on
// stdout, even when it hit an internal problem (e.g. {"ok":false} or
// {"found":false}) -- this only throws if the script couldn't run at all
// (missing powershell.exe, bad arguments, non-JSON output, timeout, ...).
export async function runPowerShellScript<T>(
    scriptName: string,
    args: string[] = [],
): Promise<T> {
    const scriptPath = path.join(windowsScriptsDir(), scriptName);

    const { stdout } = await execFileAsync(
        "powershell.exe",
        [
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            scriptPath,
            ...args,
        ],
        { maxBuffer: 10 * 1024 * 1024, timeout: 15_000, windowsHide: true },
    );

    return JSON.parse(stdout) as T;
}
