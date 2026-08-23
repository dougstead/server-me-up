import fs from "node:fs/promises";
import path from "node:path";
import type { Cpu } from "../lib/cpus";

const CPU_DIRECTORY_API =
    "https://api.github.com/repos/buildcores/buildcores-open-db/contents/open-db/CPU";

type GitHubFile = {
    name: string;
    download_url: string | null;
    type: string;
};

function normalizeCpuName(name: string) {
    return name
        .toLowerCase()
        .replace(/oem\/tray/g, "")
        .replace(/\d+(\.\d+)?\s*ghz/g, "")
        .replace(/\d+-core/g, "")
        .replace(/lga\d+/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

async function importCpus() {
    console.log("Fetching CPU file list...");

    const response = await fetch(CPU_DIRECTORY_API);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch CPU list: ${response.status} ${response.statusText}`,
        );
    }

    const files: GitHubFile[] = await response.json();

    const cpuFiles = files.filter(
        (file) => file.type === "file" && file.name.endsWith(".json"),
    );

    console.log(`Found ${cpuFiles.length} CPU records.`);

    const cpus: Cpu[] = [];

    for (const [index, file] of cpuFiles.entries()) {
        if (!file.download_url) {
            continue;
        }

        console.log(`[${index + 1}/${cpuFiles.length}] ${file.name}`);

        const cpuResponse = await fetch(file.download_url);

        if (!cpuResponse.ok) {
            console.warn(`Skipping ${file.name}: request failed.`);
            continue;
        }

        const source = await cpuResponse.json();

        // We'll adjust these mappings to the exact BuildCores
        // schema after inspecting the first records.
        const cpu: Cpu = {
            id: source.opendb_id ?? file.name.replace(".json", ""),
            manufacturer: source.metadata?.manufacturer ?? "Unknown",
            name: source.metadata?.name ?? "Unknown CPU",
            cores: Number(source.cores?.total ?? 0),
            threads: Number(source.cores?.threads ?? 0),
        };

        cpus.push(cpu);
    }

    const outputPath = path.join(process.cwd(), "data", "cpus.json");

    await fs.mkdir(path.dirname(outputPath), {
        recursive: true,
    });

    const uniqueCpus = new Map<string, Cpu>();

    for (const cpu of cpus) {
        const key = normalizeCpuName(cpu.name);

        const existing = uniqueCpus.get(key);

        if (!existing) {
            uniqueCpus.set(key, cpu);
            continue;
        }

        // Prefer the cleaner/shorter CPU name.
        if (cpu.name.length < existing.name.length) {
            uniqueCpus.set(key, cpu);
        }
    }

    const deduplicatedCpus = [...uniqueCpus.values()];
    console.log(
        `Removed ${cpus.length - deduplicatedCpus.length} duplicate records.`,
    );

    await fs.writeFile(
        outputPath,
        JSON.stringify(deduplicatedCpus, null, 2),
        "utf8",
    );

    console.log(
        `Wrote ${deduplicatedCpus.length} unique CPUs to ${outputPath}`,
    );
}

importCpus().catch((error) => {
    console.error(error);
    process.exit(1);
});