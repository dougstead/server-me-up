"use client";

import { useState } from "react";
import {
  configTemplates,
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

  if (!template) {
    return null;
  }

  const dataFile =
    typeof template.dataFile === "function"
      ? template.dataFile(values)
      : template.dataFile;

  const rawTemplate = rawTemplates[dataFile] ?? "";
  const output = renderConfigTemplate(template, rawTemplate, values);
  const fileName =
    typeof template.fileName === "function"
      ? template.fileName(values)
      : template.fileName;

  function setValue(id: string, value: string | number | boolean) {
    setValues((previous) => ({ ...previous, [id]: value }));
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

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">
            {template.configFileLabel} preview
          </h3>
        </div>

        <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
          {output}
        </pre>

        <button
          type="button"
          onClick={downloadConfig}
          className="mt-4 rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
        >
          Download {fileName}
        </button>
      </div>
    </div>
  );
}
