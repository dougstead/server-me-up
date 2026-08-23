"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
    games,
    type GameServerRequirements,
} from "@/lib/games";
import type { Cpu } from "@/lib/cpus";
import Link from "next/link";
import { hostingProviders } from "@/lib/hosting-providers";
import { detectHardware } from "@/lib/hardware-detection";
import { configTemplates } from "@/lib/config-templates";

type MachineSpecs = {
    cpu: string;
    ramGb: number;
    storageType: "ssd" | "hdd";
    operatingSystem: "windows" | "linux" | "macos" | "other";
    canPortForward: boolean;
    players: number;
};

const VALID_OPERATING_SYSTEMS: MachineSpecs["operatingSystem"][] = [
    "windows",
    "linux",
    "macos",
    "other",
];

function isValidOperatingSystem(
    value: string | null,
): value is MachineSpecs["operatingSystem"] {
    return (
        value !== null &&
        (VALID_OPERATING_SYSTEMS as string[]).includes(value)
    );
}

// Builds the initial form state from URL query params, so links (e.g. from
// the downloadable hardware-scan utility) can arrive pre-filled. CPU is
// handled separately since matching it against the CPU database requires
// an async lookup -- see the effect in the component below.
function buildInitialSpecs(searchParams: URLSearchParams): MachineSpecs {
    const cpuParam = searchParams.get("cpu") ?? "";
    const ramParam = Number(searchParams.get("ram"));
    const storageParam = searchParams.get("storage");
    const osParam = searchParams.get("os");

    return {
        cpu: cpuParam,
        ramGb: Number.isFinite(ramParam) && ramParam > 0 ? ramParam : 16,
        storageType: storageParam === "hdd" ? "hdd" : "ssd",
        operatingSystem: isValidOperatingSystem(osParam) ? osParam : "windows",
        canPortForward: false,
        players: 4,
    };
}

type RequirementStatus = "good" | "warning" | "fail" | "unknown";

type RequirementEvaluation = {
  status: RequirementStatus;
  message: string;
};

type ServerEvaluation = {
  cpu: RequirementEvaluation;
  ram: RequirementEvaluation;
  storage: RequirementEvaluation;
  operatingSystem: RequirementEvaluation;
  network: RequirementEvaluation;
};

function formatOperatingSystem(
  operatingSystem: MachineSpecs["operatingSystem"],
) {
  switch (operatingSystem) {
    case "windows":
      return "Windows";
    case "linux":
      return "Linux";
    case "macos":
      return "macOS";
    case "other":
      return "Other";
  }
}

function evaluateServer(
  specs: MachineSpecs,
  cpu: Cpu | null,
  requirements: GameServerRequirements,
): ServerEvaluation {
  const cpuRequirements = requirements.official.cpu;
  const ramRequirements = requirements.official.ram;
  const storageRequirements = requirements.official.storage;
  const requiredPorts = requirements.official.requiredPorts.filter(
    (port) => port.required,
  );

  let cpuEvaluation: RequirementEvaluation;

  if (!cpu) {
    cpuEvaluation = {
      status: "unknown",
      message: "Select a CPU to check the published CPU requirements.",
    };
  } else if (
    cpuRequirements.minimumPhysicalCores === null &&
    cpuRequirements.recommendedPhysicalCores === null &&
    cpuRequirements.minimumLogicalCores === null &&
    cpuRequirements.recommendedLogicalCores === null
  ) {
    cpuEvaluation = {
      status: "unknown",
      message:
        cpuRequirements.notes ??
        `${requirements.name} does not publish a CPU core-count requirement that we can compare automatically.`,
    };
  } else {
    const failsMinimumPhysical =
      cpuRequirements.minimumPhysicalCores !== null &&
      cpu.cores < cpuRequirements.minimumPhysicalCores;

    const failsMinimumLogical =
      cpuRequirements.minimumLogicalCores !== null &&
      cpu.threads < cpuRequirements.minimumLogicalCores;

    const meetsRecommendedPhysical =
      cpuRequirements.recommendedPhysicalCores === null ||
      cpu.cores >= cpuRequirements.recommendedPhysicalCores;

    const meetsRecommendedLogical =
      cpuRequirements.recommendedLogicalCores === null ||
      cpu.threads >= cpuRequirements.recommendedLogicalCores;

    const requirementsText = [
      cpuRequirements.recommendedPhysicalCores !== null
        ? `${cpuRequirements.recommendedPhysicalCores} physical cores recommended`
        : cpuRequirements.minimumPhysicalCores !== null
          ? `${cpuRequirements.minimumPhysicalCores} physical cores minimum`
          : null,
      cpuRequirements.recommendedLogicalCores !== null
        ? `${cpuRequirements.recommendedLogicalCores} logical cores recommended`
        : cpuRequirements.minimumLogicalCores !== null
          ? `${cpuRequirements.minimumLogicalCores} logical cores minimum`
          : null,
    ]
      .filter(Boolean)
      .join(" and ");

    if (failsMinimumPhysical || failsMinimumLogical) {
      cpuEvaluation = {
        status: "fail",
        message: `${cpu.name} has ${cpu.cores} cores and ${cpu.threads} threads. ${requirements.name} specifies ${requirementsText}.`,
      };
    } else if (meetsRecommendedPhysical && meetsRecommendedLogical) {
      cpuEvaluation = {
        status: "good",
        message: `${cpu.name} has ${cpu.cores} cores and ${cpu.threads} threads. It meets the published core-count guidance for ${requirements.name}: ${requirementsText}.`,
      };
    } else {
      cpuEvaluation = {
        status: "warning",
        message: `${cpu.name} meets the published minimum core-count guidance but does not meet all recommended core-count guidance for ${requirements.name}.`,
      };
    }
  }

  let ramEvaluation: RequirementEvaluation;

  if (
    ramRequirements.minimumGb === null &&
    ramRequirements.recommendedGb === null &&
    ramRequirements.baseGb == null &&
    ramRequirements.perPlayerGb == null
  ) {
    ramEvaluation = {
      status: "unknown",
      message:
        ramRequirements.notes ??
        `${requirements.name} does not publish a RAM figure that we can compare automatically.`,
    };
  } else {
    const playerBasedRam =
      ramRequirements.baseGb != null && ramRequirements.perPlayerGb != null
        ? ramRequirements.baseGb + ramRequirements.perPlayerGb * specs.players
        : null;

    const effectiveMinimum =
      playerBasedRam !== null
        ? Math.max(ramRequirements.minimumGb ?? 0, playerBasedRam)
        : ramRequirements.minimumGb;

    if (effectiveMinimum !== null && specs.ramGb < effectiveMinimum) {
      ramEvaluation = {
        status: "fail",
        message:
          playerBasedRam !== null
            ? `For ${specs.players} players, the published guidance works out to about ${playerBasedRam} GB of RAM. You entered ${specs.ramGb} GB.`
            : `You have ${specs.ramGb} GB of RAM. ${requirements.name} requires at least ${effectiveMinimum} GB.`,
      };
    } else if (
      ramRequirements.recommendedGb !== null &&
      specs.ramGb < ramRequirements.recommendedGb
    ) {
      ramEvaluation = {
        status: "warning",
        message: `You have ${specs.ramGb} GB of RAM. This meets the published minimum, but ${ramRequirements.recommendedGb} GB or more is recommended.`,
      };
    } else {
      ramEvaluation = {
        status: "good",
        message:
          playerBasedRam !== null
            ? `You have ${specs.ramGb} GB of RAM. The published guidance for ${specs.players} players is about ${playerBasedRam} GB.`
            : ramRequirements.recommendedGb !== null
              ? `You have ${specs.ramGb} GB of RAM. ${requirements.name} recommends ${ramRequirements.recommendedGb} GB or more.`
              : `You have ${specs.ramGb} GB of RAM, which meets the published minimum of ${ramRequirements.minimumGb} GB.`,
      };
    }
  }

  let storageEvaluation: RequirementEvaluation;

  if (storageRequirements.ssd === null) {
    storageEvaluation = {
      status: "unknown",
      message:
        storageRequirements.notes ??
        `${requirements.name} does not publish an SSD/HDD recommendation that we can compare automatically.`,
    };
  } else if (storageRequirements.ssd === "required") {
    storageEvaluation =
      specs.storageType === "ssd"
        ? {
            status: "good",
            message: `${requirements.name} requires SSD storage, and you selected SSD.`,
          }
        : {
            status: "fail",
            message: `${requirements.name} requires SSD storage. You selected HDD.`,
          };
  } else if (storageRequirements.ssd === "recommended") {
    storageEvaluation =
      specs.storageType === "ssd"
        ? {
            status: "good",
            message: `${requirements.name} recommends SSD storage, and you selected SSD.`,
          }
        : {
            status: "warning",
            message: `${requirements.name} recommends SSD storage. You selected HDD.`,
          };
  } else {
    storageEvaluation = {
      status: "good",
      message: `${requirements.name} does not require SSD storage.`,
    };
  }

  const supportedOperatingSystems =
    requirements.official.supportedOperatingSystems;

  const operatingSystemEvaluation: RequirementEvaluation =
    specs.operatingSystem === "other"
      ? {
          status: "fail",
          message: `"Other" is not listed as a supported dedicated-server operating system for ${requirements.name}.`,
        }
      : supportedOperatingSystems.includes(specs.operatingSystem)
        ? {
            status: "good",
            message: `${formatOperatingSystem(specs.operatingSystem)} is supported.`,
          }
        : {
            status: "fail",
            message: `${formatOperatingSystem(specs.operatingSystem)} is not listed as a supported dedicated-server operating system.`,
          };

  let networkEvaluation: RequirementEvaluation;

  if (requiredPorts.length === 0) {
    networkEvaluation = {
      status: "unknown",
      message: `We do not currently have a required port configured for ${requirements.name}.`,
    };
  } else {
    const portText = requiredPorts
      .map((port) => `${port.protocol} ${port.port}`)
      .join(", ");

    networkEvaluation = specs.canPortForward
      ? {
          status: "good",
          message: `You can configure port forwarding. ${requirements.name} uses ${portText} by default.`,
        }
      : {
          status: "warning",
          message: `External players may not be able to connect until the required ports are reachable. Default required ports: ${portText}.`,
        };
  }

  return {
    cpu: cpuEvaluation,
    ram: ramEvaluation,
    storage: storageEvaluation,
    operatingSystem: operatingSystemEvaluation,
    network: networkEvaluation,
  };
}

function RequirementResult({
  label,
  evaluation,
}: {
  label: string;
  evaluation: RequirementEvaluation;
}) {
  const statusText: Record<RequirementStatus, string> = {
    good: "Meets recommendation",
    warning: "Needs attention",
    fail: "Below requirement",
    unknown: "Unknown",
  };

  const statusSymbol: Record<RequirementStatus, string> = {
    good: "✓",
    warning: "⚠",
    fail: "✕",
    unknown: "?",
  };

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-white">
            {label}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-300 break-words">
            {evaluation.message}
          </p>
        </div>

        <div className="shrink-0 text-sm font-medium text-white">
          <span className="mr-1">
            {statusSymbol[evaluation.status]}
          </span>

          {statusText[evaluation.status]}
        </div>
      </div>
    </div>
  );
}

export default function CanMyMachineRunIt({
    defaultGameId,
}: {
    // Pre-selects a game (used by the per-game landing pages at
    // /can-my-pc-run-it/[gameId]). Falls back to the first game when
    // omitted or unrecognized, same as before.
    defaultGameId?: string;
} = {}) {
    const searchParams = useSearchParams();

    const [specs, setSpecs] = useState<MachineSpecs>(() =>
        buildInitialSpecs(searchParams),
    );

    const [cpuResults, setCpuResults] = useState<Cpu[]>([]);
    const [selectedCpu, setSelectedCpu] = useState<Cpu | null>(null);
    const [hardwareNote, setHardwareNote] = useState<string | null>(null);

    const [selectedGame, setSelectedGame] = useState<GameServerRequirements>(
        () => games.find((game) => game.id === defaultGameId) ?? games[0],
    )

    // Runs once, on mount: if a `cpu` query param arrived (e.g. from the
    // downloadable hardware-scan utility), look it up against the CPU
    // database the same way the search box does, and auto-select it when
    // there's a single/exact match.
    useEffect(() => {
        const cpuQuery = searchParams.get("cpu");

        if (!cpuQuery) {
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const response = await fetch(
                    `/api/cpus?q=${encodeURIComponent(cpuQuery)}`,
                );
                const results: Cpu[] = await response.json();

                if (cancelled) {
                    return;
                }

                const exactMatch =
                    results.length === 1
                        ? results[0]
                        : results.find(
                              (cpu) =>
                                  cpu.name.toLowerCase() ===
                                  cpuQuery.toLowerCase(),
                          );

                if (exactMatch) {
                    setSelectedCpu(exactMatch);
                    setSpecs((previous) => ({
                        ...previous,
                        cpu: exactMatch.name,
                    }));
                } else {
                    setCpuResults(results);
                }
            } catch {
                // The user can still search for their CPU manually.
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleDetectHardware() {
        const detected = detectHardware();

        setSpecs((previous) => ({
            ...previous,
            ramGb: detected.ramGb ?? previous.ramGb,
            operatingSystem: detected.operatingSystem ?? previous.operatingSystem,
        }));

        const lines: string[] = [];

        lines.push(
            detected.ramGb !== null
                ? `RAM: ~${detected.ramGb} GB reported. Chromium-based browsers cap this at 8 GB for privacy, so correct it manually if you actually have more.`
                : "RAM: this browser doesn't expose this -- left unchanged.",
        );

        lines.push(
            detected.operatingSystem !== null
                ? `Operating System: detected ${formatOperatingSystem(detected.operatingSystem)}.`
                : "Operating System: couldn't be determined -- left unchanged.",
        );

        lines.push(
            detected.cpuLogicalProcessors !== null
                ? `CPU: this browser can only report a logical processor count (${detected.cpuLogicalProcessors}), not the exact model -- search for your CPU above, or use the downloadable scanner below for a fully automatic match.`
                : "CPU: this browser doesn't expose this -- search for your CPU above.",
        );

        lines.push(
            "Storage type can't be detected from a browser and was left unchanged.",
        );

        setHardwareNote(lines.join(" "));
    }

    const evaluation = evaluateServer(
        specs,
        selectedCpu,
        selectedGame,
    );

    return (
        <div>
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-8">
            <div>
            <div>
                <label
                    htmlFor="game"
                    className="block text-sm font-medium text-slate-200"
                >
                    Game
                </label>

                <select
                    id="game"
                    value={selectedGame.id}
                    onChange={(event) => {
                        const game = games.find(
                            (game) => game.id === event.target.value,
                        );

                        if (game) {
                            setSelectedGame(game);
                        }
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                >
                    {games.map((game) => (
                        <option key={game.id} value={game.id}>
                            {game.name}
                        </option>
                    ))}
                </select>

                <p className="mt-2 text-sm">
                    <Link
                        href={`/guides/games/${selectedGame.id}`}
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        {selectedGame.name} setup guide →
                    </Link>

                    {configTemplates[selectedGame.id] && (
                        <>
                            {" "}
                            <span className="text-slate-600">·</span>{" "}
                            <Link
                                href={`/config-generator/${selectedGame.id}`}
                                className="text-sky-400 hover:text-sky-300 hover:underline"
                            >
                                Config generator →
                            </Link>
                        </>
                    )}
                </p>
            </div>

            <div className="mt-6 max-w-xl rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-300">
                        Let this browser fill in what it can (RAM and OS).
                    </p>

                    <button
                        type="button"
                        onClick={handleDetectHardware}
                        className="shrink-0 rounded-lg border border-sky-500 px-4 py-2 text-sm font-semibold text-sky-400 hover:bg-sky-500 hover:text-white"
                    >
                        Detect my hardware
                    </button>
                </div>

                {hardwareNote && (
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        {hardwareNote}
                    </p>
                )}
            </div>

            <div className="mt-10 max-w-xl space-y-6">
                <div>
                    <label
                        htmlFor="cpu"
                        className="block text-sm font-medium text-slate-200"
                    >
                        CPU
                    </label>

                    <input
                        id="cpu"
                        type="text"
                        value={specs.cpu}
                        onChange={async (event) => {
                            const value = event.target.value;

                            setSpecs({
                                ...specs,
                                cpu: value,
                            });

                            setSelectedCpu(null);

                            if (value.length < 2) {
                                setCpuResults([]);
                                return;
                            }

                            const response = await fetch(`/api/cpus?q=${encodeURIComponent(value)}`);
                            const results: Cpu[] = await response.json();

                            setCpuResults(results);
                        }}
                        placeholder="e.g. Intel i5-6500T"
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                    />
                    {cpuResults.length > 0 && (
                        <div className="mt-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900">
                            {cpuResults.map((cpu) => (
                                <button
                                    key={cpu.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCpu(cpu);

                                        setSpecs({
                                            ...specs,
                                            cpu: cpu.name,
                                        });

                                        setCpuResults([]);
                                    }}
                                    className="block w-full px-4 py-3 text-left hover:bg-slate-800"
                                >
                                    <div className="font-medium">{cpu.name}</div>

                                    <div className="mt-1 text-sm text-slate-400">
                                        {cpu.cores} cores · {cpu.threads} threads
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="ram"
                        className="block text-sm font-medium text-slate-200"
                    >
                        RAM (GB)
                    </label>

                    <input
                        id="ram"
                        type="number"
                        min={1}
                        value={specs.ramGb}
                        onChange={(event) =>
                            setSpecs({
                                ...specs,
                                ramGb: Number(event.target.value),
                            })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                    />
                </div>

                <div>
                    <label
                        htmlFor="storage-type"
                        className="block text-sm font-medium text-slate-200"
                    >
                        Storage Type
                    </label>

                    <select
                        id="storage-type"
                        value={specs.storageType}
                        onChange={(event) =>
                            setSpecs({
                                ...specs,
                                storageType: event.target.value as MachineSpecs["storageType"],
                            })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                    >
                        <option value="ssd">SSD</option>
                        <option value="hdd">HDD</option>
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="operating-system"
                        className="block text-sm font-medium text-slate-200"
                    >
                        Operating System
                    </label>

                    <select
                        id="operating-system"
                        value={specs.operatingSystem}
                        onChange={(event) =>
                            setSpecs({
                                ...specs,
                                operatingSystem:
                                    event.target.value as MachineSpecs["operatingSystem"],
                            })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                    >
                        <option value="windows">Windows</option>
                        <option value="linux">Linux</option>
                        <option value="macos">macOS</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div>
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
                        <input
                            type="checkbox"
                            checked={specs.canPortForward}
                            onChange={(event) =>
                                setSpecs({
                                    ...specs,
                                    canPortForward: event.target.checked,
                                })
                            }
                            className="h-4 w-4"
                        />

                        I can configure port forwarding on my router
                    </label>

                    <Link
                        href="/guides/port-forwarding"
                        className="mt-2 inline-block text-sm text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        Not sure? Read our port forwarding guide
                    </Link>
                </div>

                <div>
                    <label
                        htmlFor="players"
                        className="block text-sm font-medium text-slate-200"
                    >
                        Expected Players
                    </label>

                    <input
                        id="players"
                        type="number"
                        min={1}
                        value={specs.players}
                        onChange={(event) =>
                            setSpecs({
                                ...specs,
                                players: Number(event.target.value),
                            })
                        }
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                    />
                </div>
            </div>
            </div>

            <div className="mt-10 space-y-8 lg:mt-0">
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
                <h2 className="text-lg font-semibold">
                    Want a fully automatic scan?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                    A browser can&apos;t see your exact CPU model or storage
                    type. For a complete, automatic result, download the
                    hardware-scan utility below -- it reads your CPU, RAM,
                    storage type and OS directly from Windows, then opens
                    this page with everything filled in for you.
                </p>

                <a
                    href="/downloads/server-me-up-hardware-scan.bat"
                    download
                    className="mt-5 inline-block rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
                >
                    Download for Windows (.bat)
                </a>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                    Windows only for now. The script only reads local
                    hardware info and opens your browser -- nothing is
                    uploaded anywhere. Since it&apos;s unsigned, Windows may
                    show a SmartScreen warning; you can review the plain-text
                    script yourself before running it.
                </p>
            </div>

            {selectedGame.hosting?.length > 0 && (
                <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
                    <h2 className="text-lg font-semibold">
                        Prefer a hosted server?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        These providers offer hosting for {selectedGame.name}.
                        Links below are affiliate links, which means Server Me Up
                        may earn a commission if you make a purchase.
                    </p>

                    <div className="mt-5 space-y-3">
                        {selectedGame.hosting.map((hostingOption) => {
                            const provider = hostingProviders.find(
                                (provider) => provider.id === hostingOption.providerId,
                            );

                            if (!provider) {
                                return null;
                            }

                            return (
                                <a
                                    key={provider.id}
                                    href={hostingOption.affiliateUrl}
                                    target="_blank"
                                    rel="sponsored noopener noreferrer"
                                    className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 transition hover:border-sky-500"
                                >
                                    <div>
                                        <div className="font-semibold text-white">
                                            Host {selectedGame.name} with {provider.name}
                                        </div>

                                        {hostingOption.note && (
                                            <div className="mt-1 text-sm text-slate-400">
                                                {hostingOption.note}
                                            </div>
                                        )}
                                    </div>

                                    <span className="ml-4 shrink-0 text-sm font-semibold text-sky-400">
                                        View hosting →
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}
            </div>
            </div>

            <div className="mt-10 rounded-lg border border-slate-700 bg-slate-900 p-6">
                <h2 className="text-lg font-semibold">
                    Compatibility
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <RequirementResult
                        label="CPU"
                        evaluation={evaluation.cpu}
                    />

                    <RequirementResult
                        label="RAM"
                        evaluation={evaluation.ram}
                    />

                    <RequirementResult
                        label="Storage"
                        evaluation={evaluation.storage}
                    />

                    <RequirementResult
                        label="Operating System"
                        evaluation={evaluation.operatingSystem}
                    />

                    <RequirementResult
                        label="Network"
                        evaluation={evaluation.network}
                    />
                </div>
            </div>

            <div className="mt-10 border-t border-slate-800 pt-6 text-sm leading-6 text-slate-500">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
                    Where this data comes from
                </h2>

                <p className="mt-3">
                    Requirements are taken from each game&apos;s official
                    documentation where the developer publishes one -- for
                    example Mojang&apos;s Bedrock server download page or
                    Jagex&apos;s Dragonwilds hosting guide. Several developers
                    (Facepunch, Iron Gate, The Indie Stone, Valve and others)
                    don&apos;t publish formal dedicated-server hardware specs
                    at all; where that&apos;s the case, this tool falls back
                    to figures reported by community wikis and hosting-provider
                    guides instead. Every field sourced that way is labelled
                    as such in its result above rather than presented as
                    official guidance.
                </p>

                <p className="mt-3">
                    CPU listings are sourced from{" "}
                    <a
                        href="https://github.com/buildcores/buildcores-open-db"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        BuildCores&apos; open CPU database
                    </a>{" "}
                    (Open Data Commons Attribution License), not Server Me
                    Up&apos;s own testing. The compatibility results above
                    are an automated, best-effort estimate --
                    not a guarantee -- and can&apos;t account for mods,
                    plugins, world size, or how you&apos;ve configured the
                    game. Where we don&apos;t have a confident figure to
                    compare against, a result is marked &quot;Unknown&quot;
                    rather than guessed.
                </p>
            </div>
        </div>
    );
}
