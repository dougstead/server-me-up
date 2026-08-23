export type DetectedOperatingSystem = "windows" | "linux" | "macos";

export type DetectedHardware = {
  // Chromium-based browsers report this rounded down and capped at 8,
  // regardless of how much RAM is actually installed. Not supported at
  // all in Firefox/Safari.
  ramGb: number | null;

  operatingSystem: DetectedOperatingSystem | null;

  // Browsers only expose a logical processor count, not the exact CPU
  // model, and can't distinguish physical cores from SMT/hyperthreads.
  cpuLogicalProcessors: number | null;
};

// Chromium-only APIs that TypeScript's bundled DOM types don't declare.
type NavigatorWithHardwareHints = Navigator & {
  deviceMemory?: number;
  userAgentData?: {
    platform?: string;
  };
};

function detectOperatingSystem(
  nav: NavigatorWithHardwareHints,
): DetectedOperatingSystem | null {
  const platformHint =
    nav.userAgentData?.platform || nav.platform || nav.userAgent || "";

  const normalized = platformHint.toLowerCase();

  if (normalized.includes("win")) {
    return "windows";
  }

  if (normalized.includes("mac")) {
    return "macos";
  }

  if (
    normalized.includes("linux") ||
    normalized.includes("cros") ||
    normalized.includes("x11")
  ) {
    return "linux";
  }

  return null;
}

// Browser-only hardware detection. There is no web API that exposes an
// exact CPU model or storage type (SSD vs HDD) -- those are intentionally
// left out. See the downloadable hardware-scan utility for a more complete,
// OS-level scan.
export function detectHardware(): DetectedHardware {
  if (typeof navigator === "undefined") {
    return { ramGb: null, operatingSystem: null, cpuLogicalProcessors: null };
  }

  const nav = navigator as NavigatorWithHardwareHints;

  return {
    ramGb: typeof nav.deviceMemory === "number" ? nav.deviceMemory : null,
    operatingSystem: detectOperatingSystem(nav),
    cpuLogicalProcessors:
      typeof nav.hardwareConcurrency === "number"
        ? nav.hardwareConcurrency
        : null,
  };
}
