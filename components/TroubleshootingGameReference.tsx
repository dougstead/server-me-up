"use client";

import { useState } from "react";
import Link from "next/link";
import { games } from "@/lib/games";
import { gameSetups } from "@/lib/game-setup";
import { configTemplates } from "@/lib/config-templates";

// A per-game quick-reference panel for the troubleshooting page: required
// ports and the SteamCMD app ID/install method, pulled straight from
// lib/games.ts and lib/game-setup.ts rather than hardcoded here, so this
// automatically covers every supported game and stays correct as that data
// changes. This is what makes the troubleshooting page "game-specific
// where data supports it" without needing a separate page per game.
export default function TroubleshootingGameReference() {
    const [selectedGameId, setSelectedGameId] = useState(games[0].id);

    const game = games.find((candidate) => candidate.id === selectedGameId) ?? games[0];
    const setup = gameSetups[game.id];
    const requiredPorts = game.official.requiredPorts.filter((port) => port.required);
    const hasConfigGenerator = Boolean(configTemplates[game.id]);

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <label htmlFor="troubleshooting-game" className="block text-sm font-medium text-slate-200">
                Look up your game
            </label>

            <select
                id="troubleshooting-game"
                value={selectedGameId}
                onChange={(event) => setSelectedGameId(event.target.value)}
                className="mt-2 w-full max-w-sm rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
            >
                {games.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                        {candidate.name}
                    </option>
                ))}
            </select>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Required ports
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        {requiredPorts.length > 0
                            ? requiredPorts
                                  .map((port) => `${port.protocol} ${port.port}`)
                                  .join(", ")
                            : `Not currently confirmed for ${game.name}.`}
                    </p>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Install method
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        {setup?.method.type === "steamcmd"
                            ? `SteamCMD, app ID ${setup.method.appId}`
                            : setup?.method.type === "direct-download"
                              ? `Direct download from ${setup.method.urlLabel}`
                              : "Not currently documented."}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <Link
                    href={`/guides/games/${game.id}`}
                    className="font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                >
                    {game.name} setup guide →
                </Link>

                <Link
                    href={`/can-my-pc-run-it/${game.id}`}
                    className="font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                >
                    Compatibility checker →
                </Link>

                {hasConfigGenerator && (
                    <Link
                        href={`/config-generator/${game.id}`}
                        className="font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        Config generator →
                    </Link>
                )}
            </div>
        </div>
    );
}
