import fs from "node:fs";
import path from "node:path";
import { configTemplates, type ConfigValues } from "@/lib/config-templates";

function readDataFile(dataFile: string): string {
  const filePath = path.join(process.cwd(), "data", "game-configs", dataFile);
  return fs.readFileSync(filePath, "utf8");
}

// Server-only: reads every raw config template a game could need off disk,
// keyed by data-file name, and hands the whole set to the client component.
// Most games have exactly one template regardless of form values; a game
// whose template varies by a "select" field (Valheim's target OS) has one
// per option -- found by trying each option against the defaults, since
// only a "select" field can meaningfully switch which file is used.
// Never import this from a "use client" component -- node:fs isn't
// available in the browser bundle.
export function loadRawConfigTemplates(gameId: string): Record<string, string> {
  const template = configTemplates[gameId];

  if (!template) {
    return {};
  }

  const defaults = defaultConfigValues(gameId);

  if (typeof template.dataFile === "string") {
    return { [template.dataFile]: readDataFile(template.dataFile) };
  }

  const resolveDataFile = template.dataFile;
  const dataFiles = new Set<string>([resolveDataFile(defaults)]);

  for (const field of template.fields) {
    if (field.type !== "select" || !field.options) {
      continue;
    }

    for (const option of field.options) {
      dataFiles.add(resolveDataFile({ ...defaults, [field.id]: option.value }));
    }
  }

  return Object.fromEntries(
    [...dataFiles].map((dataFile) => [dataFile, readDataFile(dataFile)]),
  );
}

export function defaultConfigValues(gameId: string): ConfigValues {
  const template = configTemplates[gameId];

  if (!template) {
    return {};
  }

  return Object.fromEntries(
    template.fields.map((field) => [field.id, field.defaultValue]),
  );
}
