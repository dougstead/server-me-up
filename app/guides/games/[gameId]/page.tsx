import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { games } from "@/lib/games";
import { gameSetups } from "@/lib/game-setup";
import { configTemplates } from "@/lib/config-templates";
import { loadRawConfigTemplates } from "@/lib/game-config-loader";
import ConfigGenerator from "@/components/ConfigGenerator";

export async function generateStaticParams() {
    return games.map((game) => ({ gameId: game.id }));
}

export async function generateMetadata(
    props: PageProps<"/guides/games/[gameId]">,
): Promise<Metadata> {
    const { gameId } = await props.params;
    const game = games.find((candidate) => candidate.id === gameId);

    if (!game) {
        return {};
    }

    return {
        title: `${game.name} Dedicated Server Setup`,
        description: `How to download, configure and run a ${game.name} dedicated server: getting the server files, required ports, starting it up, and generating a config file.`,
        alternates: {
            canonical: `/guides/games/${game.id}`,
        },
    };
}

export default async function GameSetupGuidePage(
    props: PageProps<"/guides/games/[gameId]">,
) {
    const { gameId } = await props.params;

    const game = games.find((candidate) => candidate.id === gameId);
    const setup = gameSetups[gameId];

    if (!game || !setup) {
        notFound();
    }

    const requiredPorts = game.official.requiredPorts;
    const softwareRequirements = game.official.softwareRequirements ?? [];
    const hasConfigGenerator = Boolean(configTemplates[game.id]);

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-3xl px-6 py-16">
                <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                    Server Me Up Guide
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight">
                    {game.name} Dedicated Server Setup
                </h1>

                <p className="mt-4 text-lg leading-8 text-slate-300">
                    How to get a {game.name} dedicated server running on your
                    own machine, from downloading the server files to
                    starting it up.
                </p>

                <div className="mt-8 rounded-lg border border-sky-900 bg-sky-950/30 p-4 text-sm leading-6 text-slate-300">
                    Before you start, run{" "}
                    <Link
                        href="/can-my-pc-run-it"
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        Can My Machine Run It?
                    </Link>{" "}
                    to check whether your hardware meets {game.name}&apos;s
                    requirements, and read the{" "}
                    <Link
                        href="/guides/port-forwarding"
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        port forwarding guide
                    </Link>{" "}
                    if you want players outside your home network to connect.
                </div>

                <div className="mt-12 space-y-10">
                    <section>
                        <h2 className="text-2xl font-semibold">
                            1. Get the server files
                        </h2>

                        {setup.method.type === "steamcmd" ? (
                            <>
                                <p className="mt-3 leading-7 text-slate-300">
                                    {game.name}&apos;s dedicated server is
                                    distributed through Valve&apos;s SteamCMD
                                    tool, under Steam app ID{" "}
                                    {setup.method.appId}. If you don&apos;t
                                    have SteamCMD installed yet, follow our{" "}
                                    <Link
                                        href="/guides/steamcmd"
                                        className="text-sky-400 hover:text-sky-300 hover:underline"
                                    >
                                        SteamCMD installation guide
                                    </Link>{" "}
                                    first.
                                </p>

                                <p className="mt-3 text-slate-300">
                                    From a SteamCMD prompt (or as command-line
                                    arguments), run:
                                </p>

                                <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
                                    {`force_install_dir "${setup.method.installDirExample}"\nlogin anonymous\napp_update ${setup.method.appId} validate\nquit`}
                                </pre>

                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                    A handful of dedicated-server tools
                                    require a Steam account that owns the
                                    base game instead of an anonymous login.
                                    If <code>login anonymous</code> is
                                    rejected, replace it with{" "}
                                    <code>login &lt;your-steam-username&gt;</code>{" "}
                                    and enter your password when prompted.
                                </p>
                            </>
                        ) : (
                            <p className="mt-3 leading-7 text-slate-300">
                                {game.name} isn&apos;t distributed through
                                Steam. Download the dedicated server directly
                                from{" "}
                                <a
                                    href={setup.method.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-400 hover:text-sky-300 hover:underline"
                                >
                                    {setup.method.urlLabel}
                                </a>
                                .
                            </p>
                        )}
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">
                            2. Required ports
                        </h2>

                        {requiredPorts.length > 0 ? (
                            <>
                                <p className="mt-3 leading-7 text-slate-300">
                                    Forward these ports to the server
                                    machine&apos;s local IP address on your
                                    router, and allow them through the
                                    server&apos;s firewall. See the{" "}
                                    <Link
                                        href="/guides/port-forwarding"
                                        className="text-sky-400 hover:text-sky-300 hover:underline"
                                    >
                                        port forwarding guide
                                    </Link>{" "}
                                    for how.
                                </p>

                                <div className="mt-4 overflow-hidden rounded-lg border border-slate-700">
                                    <div className="grid grid-cols-[5rem_5rem_1fr_5rem] border-b border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium">
                                        <span>Protocol</span>
                                        <span>Port</span>
                                        <span>Purpose</span>
                                        <span>Required</span>
                                    </div>

                                    {requiredPorts.map((port) => (
                                        <div
                                            key={`${port.protocol}-${port.port}`}
                                            className="grid grid-cols-[5rem_5rem_1fr_5rem] border-b border-slate-800 px-4 py-3 text-sm text-slate-300 last:border-b-0"
                                        >
                                            <span>{port.protocol}</span>
                                            <span>{port.port}</span>
                                            <span>{port.purpose ?? "-"}</span>
                                            <span>
                                                {port.required ? "Yes" : "Optional"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="mt-3 leading-7 text-slate-300">
                                We don&apos;t currently have a confirmed
                                required port for {game.name}.
                            </p>
                        )}
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">
                            3. Start the server
                        </h2>

                        <p className="mt-3 leading-7 text-slate-300">
                            {setup.startNotes}
                        </p>

                        {setup.officialGuideUrl && (
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                                Full configuration reference:{" "}
                                <a
                                    href={setup.officialGuideUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sky-400 hover:text-sky-300 hover:underline"
                                >
                                    {setup.officialGuideLabel}
                                </a>
                                .
                            </p>
                        )}
                    </section>

                    {hasConfigGenerator && (
                        <section>
                            <h2 className="text-2xl font-semibold">
                                4. Generate a config file
                            </h2>

                            <div className="mt-4">
                                <ConfigGenerator
                                    gameId={game.id}
                                    rawTemplates={loadRawConfigTemplates(game.id)}
                                />
                            </div>
                        </section>
                    )}

                    {softwareRequirements.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold">
                                Software requirements
                            </h2>

                            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
                                {softwareRequirements.map((requirement) => (
                                    <li key={requirement}>{requirement}</li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
                        <h2 className="text-lg font-semibold">
                            Keep it running
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Once your {game.name} server is working, see our
                            guide on{" "}
                            <Link
                                href="/guides/keep-server-running"
                                className="text-sky-400 hover:text-sky-300 hover:underline"
                            >
                                keeping it running 24/7
                            </Link>{" "}
                            so it survives a reboot or crash without you
                            needing to start it by hand.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
