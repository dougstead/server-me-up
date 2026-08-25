"use client";

import { useState } from "react";
import {
  configTemplates,
  renderAdditionalFieldLine,
  renderConfigTemplate,
  type ConfigValues,
} from "@/lib/config-templates";

export default function ConfigGenerator({
  gameId,
  rawTemplates,
}: {
  gameId: string;
  rawTemplates: Record<string, string>;
}) {
  const template = configTemplates[gameId];

  const [values, setValues] = useState<ConfigValues>(() =>
    template
      ? Object.fromEntries(
          template.fields.map((field) => [field.id, field.defaultValue]),
        )
      : {},
  );
  const [copied, setCopied] = useState(false);

  // Additional (opt-in) settings: picked one at a time from a dropdown
  // rather than shown by default, since these are settings most people
  // never touch. Tracked separately from `values` above -- each selected
  // one's rendered line gets appended to the main output (below), so the
  // preview/download/copy all reflect it once added. Appending rather than
  // substituting into a {{token}} is safe here because AdditionalConfigField
  // is only ever used for flat line-based formats (ini/cfg/properties) --
  // see the comment on that type in lib/config-templates.ts for why JSON
  // configs deliberately don't use this.
  const [selectedAdditionalIds, setSelectedAdditionalIds] = useState<string[]>([]);
  const [additionalValues, setAdditionalValues] = useState<ConfigValues>({});
  const [pendingAdditionalId, setPendingAdditionalId] = useState("");

  if (!template) {
    return null;
  }

  const additionalFields = template.additionalFields ?? [];
  const availableAdditionalFields = additionalFields.filter(
    (field) => !selectedAdditionalIds.includes(field.id),
  );

  function addAdditionalField(id: string) {
    const field = additionalFields.find((candidate) => candidate.id === id);

    if (!field || selectedAdditionalIds.includes(id)) {
      return;
    }

    setSelectedAdditionalIds((previous) => [...previous, id]);
    setAdditionalValues((previous) => ({ ...previous, [id]: field.defaultValue }));
    setPendingAdditionalId("");
  }

  function removeAdditionalField(id: string) {
    setSelectedAdditionalIds((previous) => previous.filter((candidate) => candidate !== id));
  }

  function setAdditionalValue(id: string, value: string | number | boolean) {
    setAdditionalValues((previous) => ({ ...previous, [id]: value }));
  }

  const dataFile =
    typeof template.dataFile === "function"
      ? template.dataFile(values)
      : template.dataFile;

  const rawTemplate = rawTemplates[dataFile] ?? "";
  const baseOutput = renderConfigTemplate(template, rawTemplate, values);

  // Each selected additional setting's rendered line, appended after the
  // main file content -- this is what makes the preview/download/copy
  // actually reflect the additional settings, not just show them separately.
  const additionalLines = selectedAdditionalIds
    .map((id) => additionalFields.find((candidate) => candidate.id === id))
    .filter((field): field is (typeof additionalFields)[number] => Boolean(field))
    .map((field) => renderAdditionalFieldLine(field, additionalValues[field.id] ?? field.defaultValue));

  const output =
    additionalLines.length > 0
      ? `${baseOutput}\n${additionalLines.join("\n")}\n`
      : baseOutput;

  const fileName =
    typeof template.fileName === "function"
      ? template.fileName(values)
      : template.fileName;

  function setValue(id: string, value: string | number | boolean) {
    setValues((previous) => ({ ...previous, [id]: value }));
  }

  async function copyConfig() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable -- the Download button below still
      // works as a fallback, so this isn't a dead end.
    }
  }

  function downloadConfig() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <p className="text-sm leading-6 text-slate-400">
        {template.description}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Source: {template.sourceNote}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {template.fields.map((field) => (
          <div
            key={field.id}
            className={field.type === "boolean" ? "flex items-end" : undefined}
          >
            {field.type === "boolean" ? (
              <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.id])}
                  onChange={(event) =>
                    setValue(field.id, event.target.checked)
                  }
                  className="h-4 w-4"
                />
                {field.label}
              </label>
            ) : (
              <>
                <label
                  htmlFor={`config-${gameId}-${field.id}`}
                  className="block text-sm font-medium text-slate-200"
                >
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    id={`config-${gameId}-${field.id}`}
                    value={String(values[field.id] ?? "")}
                    onChange={(event) =>
                      setValue(field.id, event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`config-${gameId}-${field.id}`}
                    type={field.type === "number" ? "number" : "text"}
                    value={String(values[field.id] ?? "")}
                    onChange={(event) =>
                      setValue(
                        field.id,
                        field.type === "number"
                          ? Number(event.target.value)
                          : event.target.value,
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
                  />
                )}

                {field.helpText && (
                  <p className="mt-1 text-xs text-slate-500">
                    {field.helpText}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {additionalFields.length > 0 && (
        <div className="mt-10 border-t border-slate-800 pt-8">
          <h3 className="text-sm font-semibold text-slate-200">
            Additional optional settings
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Less commonly changed settings, not included by default. Add one
            below and it&apos;s included in the {template.configFileLabel}
            {" "}preview, download and copy below.
          </p>

          {availableAdditionalFields.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={pendingAdditionalId}
                onChange={(event) => setPendingAdditionalId(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
              >
                <option value="">Choose a setting…</option>
                {availableAdditionalFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={!pendingAdditionalId}
                onClick={() => addAdditionalField(pendingAdditionalId)}
                className="rounded-lg border border-sky-500 px-4 py-2.5 text-sm font-semibold text-sky-400 hover:bg-sky-500 hover:text-white disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-600 disabled:hover:bg-transparent"
              >
                Add setting
              </button>
            </div>
          )}

          {selectedAdditionalIds.length > 0 && (
            <div className="mt-5 space-y-4">
              {selectedAdditionalIds.map((id) => {
                const field = additionalFields.find((candidate) => candidate.id === id);

                if (!field) {
                  return null;
                }

                const value = additionalValues[id] ?? field.defaultValue;

                return (
                  <div
                    key={id}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-white">{field.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {field.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAdditionalField(id)}
                        aria-label={`Remove ${field.label}`}
                        className="shrink-0 text-sm text-slate-500 hover:text-white"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3">
                      {field.type === "boolean" ? (
                        <label className="flex items-center gap-3 text-sm font-medium text-slate-200">
                          <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(event) => setAdditionalValue(id, event.target.checked)}
                            className="h-4 w-4"
                          />
                          Enabled
                        </label>
                      ) : field.type === "select" ? (
                        <select
                          value={String(value)}
                          onChange={(event) => setAdditionalValue(id, event.target.value)}
                          className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                        >
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          value={String(value)}
                          onChange={(event) =>
                            setAdditionalValue(
                              id,
                              field.type === "number"
                                ? Number(event.target.value)
                                : event.target.value,
                            )
                          }
                          className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            {template.configFileLabel} preview
          </h3>
        </div>

        <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
          {output}
        </pre>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadConfig}
            className="rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
          >
            Download {fileName}
          </button>

          <button
            type="button"
            onClick={copyConfig}
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-white hover:border-sky-500"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
