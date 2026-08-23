"use client";

import { useState } from "react";

type PalworldServerConfig = {
  serverName: string;
  maxPlayers: number;
  password: string;
  difficulty: "None" | "Normal" | "Hard";
};

function generateConfig(config: PalworldServerConfig) {
  return `ServerName="${config.serverName}"
ServerPlayerMaxNum=${config.maxPlayers}
ServerPassword="${config.password}"
Difficulty=${config.difficulty}`;
}

export default function PalworldConfigGeneratorPage() {
  const [config, setConfig] = useState<PalworldServerConfig>({
    serverName: "",
    maxPlayers: 8,
    password: "",
    difficulty: "Normal",
  });

  function downloadConfig() {
    const configText = generateConfig(config);

    const blob = new Blob([configText], {
        type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "PalWorldSettings.ini";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Palworld
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Server Config Generator
        </h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          Configure your Palworld dedicated server using a simple interface.
        </p>

        <div className="mt-10 max-w-xl">
          <label
            htmlFor="server-name"
            className="block text-sm font-medium text-slate-200"
          >
            Server Name
          </label>

          <input
            id="server-name"
            type="text"
            value={config.serverName}
            onChange={(event) =>
                setConfig({
                ...config,
                serverName: event.target.value,
                })
            }
            placeholder="My Palworld Server"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
          />
        </div>
        <div className="mt-6">
        <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-200"
        >
            Server Password
        </label>

        <input
            id="password"
            type="password"
            value={config.password}
            onChange={(event) =>
            setConfig({
                ...config,
                password: event.target.value,
            })
            }
            placeholder="Optional"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
        />
        </div>

        <div className="mt-6">
        <label
            htmlFor="difficulty"
            className="block text-sm font-medium text-slate-200"
        >
            Difficulty
        </label>

        <select
            id="difficulty"
            value={config.difficulty}
            onChange={(event) =>
            setConfig({
                ...config,
                difficulty: event.target.value as PalworldServerConfig["difficulty"],
            })
            }
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
        >
            <option value="None">None</option>
            <option value="Normal">Normal</option>
            <option value="Hard">Hard</option>
        </select>
        </div>

        <div className="mt-6">
            <label
                htmlFor="max-players"
                className="block text-sm font-medium text-slate-200"
            >
                Maximum Players
            </label>

            <input
                id="max-players"
                type="number"
                min={1}
                max={32}
                value={config.maxPlayers}
                onChange={(event) =>
                    setConfig({
                    ...config,
                    maxPlayers: Number(event.target.value),
                    })
                }
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-sky-500"
            />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold">Config Preview</h2>

          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
            {generateConfig(config)}
          </pre>
          <button
            onClick={downloadConfig}
            className="mt-6 rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
            >
            Download Config
          </button>
        </div>
      </div>
    </main>
  );
}