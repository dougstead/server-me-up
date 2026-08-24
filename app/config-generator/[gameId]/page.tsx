import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { games } from "@/lib/games";
import { configTemplates } from "@/lib/config-templates";
import { loadRawConfigTemplates } from "@/lib/game-config-loader";
import ConfigGenerator from "@/components/ConfigGenerator";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/metadata";

export async function generateStaticParams() {
    return games
        .filter((game) => Boolean(configTemplates[game.id]))
        .map((game) => ({ gameId: game.id }));
}

export async function generateMetadata(
    props: PageProps<"/config-generator/[gameId]">,
): Promise<Metadata> {
    const { gameId } = await props.params;
    const game = games.find((candidate) => candidate.id === gameId);
    const template = configTemplates[gameId];

    if (!game || !template) {
        return {};
    }

    return pageMetadata({
        title: `${game.name} Config Generator`,
        description: `Free tool to generate a ready-to-use ${template.configFileLabel} for your ${game.name} dedicated server -- server name, password, max players and more.`,
        path: `/config-generator/${game.id}`,
    });
}

export default async function GameConfigGeneratorPage(
    props: PageProps<"/config-generator/[gameId]">,
) {
    const { gameId } = await props.params;

    const game = games.find((candidate) => candidate.id === gameId);
    const template = configTemplates[gameId];

    if (!game || !template) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-3xl px-6 py-16">
                <Breadcrumbs
                    items={[
                        { label: "Config Generators", href: "/config-generator" },
                        { label: game.name },
                    ]}
                />

                <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                    {game.name}
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight">
                    Config Generator
                </h1>

                <p className="mt-4 max-w-2xl text-slate-300">
                    Fill in the fields below to generate a ready-to-use{" "}
                    {template.configFileLabel} for your {game.name} dedicated
                    server. For the full setup walkthrough -- getting the
                    server files, required ports and starting it up -- see
                    the{" "}
                    <Link
                        href={`/guides/games/${game.id}`}
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        {game.name} setup guide
                    </Link>
                    . Not sure your hardware is up to it?{" "}
                    <Link
                        href={`/can-my-pc-run-it/${game.id}`}
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        Check compatibility first
                    </Link>
                    .
                </p>

                <div className="mt-10">
                    <ConfigGenerator
                        gameId={game.id}
                        rawTemplates={loadRawConfigTemplates(game.id)}
                    />
                </div>

                <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm leading-6 text-slate-400">
                    <span className="font-semibold text-slate-300">Source: </span>
                    {template.sourceUrl ? (
                        <a
                            href={template.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 hover:underline"
                        >
                            {template.sourceNote}
                        </a>
                    ) : (
                        template.sourceNote
                    )}
                </div>

                <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-semibold">
                        Server running but nobody can join?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                        A wrong or missing setting in this file isn&apos;t
                        the only reason players can&apos;t connect -- see the{" "}
                        <Link
                            href="/troubleshooting"
                            className="text-sky-400 hover:text-sky-300 hover:underline"
                        >
                            connection troubleshooting guide
                        </Link>{" "}
                        for port forwarding, firewall and CGNAT issues.
                    </p>
                </div>
            </div>
        </main>
    );
}
