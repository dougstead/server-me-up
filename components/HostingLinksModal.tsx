"use client";

import { useEffect, useState } from "react";
import { hostingProviders } from "@/lib/hosting-providers";
import type { GameServerRequirements } from "@/lib/games";

// A trigger + dialog pair, self-contained so a guide page can just drop in
// <HostingLinksModal game={game} /> without needing its own open/close
// state. Renders nothing for a game with no hosting options, matching the
// same conditional used for the inline hosting section on the compatibility
// checker (CanMyMachineRunIt.tsx) -- this is that same list of affiliate
// links, just surfaced as a modal here instead of an always-visible card,
// since a setup guide's main job is walking through self-hosting rather
// than pitching an alternative to it.
export default function HostingLinksModal({
    game,
}: {
    game: GameServerRequirements;
}) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen]);

    if (!game.hosting || game.hosting.length === 0) {
        return null;
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-4 text-sm font-semibold text-sky-400 hover:text-sky-300 hover:underline"
            >
                Prefer a hosted server instead? →
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/60"
                        onClick={() => setIsOpen(false)}
                        aria-hidden="true"
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label={`Hosting providers for ${game.name}`}
                            className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h2 className="text-lg font-semibold text-white">
                                    Prefer a hosted server?
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    aria-label="Close"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-lg leading-none text-slate-300 hover:border-sky-500 hover:text-white"
                                >
                                    ×
                                </button>
                            </div>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                These providers offer hosting for {game.name}.
                                Links below are affiliate links, which means
                                Server Me Up may earn a commission if you
                                make a purchase.
                            </p>

                            <div className="mt-5 space-y-3">
                                {game.hosting.map((hostingOption) => {
                                    const provider = hostingProviders.find(
                                        (candidate) =>
                                            candidate.id ===
                                            hostingOption.providerId,
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
                                                    Host {game.name} with{" "}
                                                    {provider.name}
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
                    </div>
                </>
            )}
        </>
    );
}
