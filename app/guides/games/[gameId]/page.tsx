import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { games } from "@/lib/games";
import { gameSetups } from "@/lib/game-setup";
import { configTemplates } from "@/lib/config-templates";
import CodeBlock from "@/components/CodeBlock";
import HostingLinksModal from "@/components/HostingLinksModal";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { faqSchema, howToSchema } from "@/lib/structured-data";
import { article } from "@/lib/text";

export async function generateStaticParams() {
    return games.map((game) => ({ gameId: game.id }));
}

// installDirExample is authored as a Windows-style path (it's what's shown
// in the OS-agnostic "From a SteamCMD prompt" block above). Reusing that
// verbatim inside a Linux-labeled update-server.sh would show something
// like `C:\GameServers\Rust` in a bash script, which is nonsensical --
// derive a plausible Linux equivalent instead (strip the drive letter,
// forward-slash it, root it under a conventional service-account home
// directory).
function toLinuxInstallDir(windowsPath: string): string {
    const withoutDrive = windowsPath.replace(/^[A-Za-z]:\\?/, "");
    const forwardSlashed = withoutDrive.replace(/\\/g, "/");
    return `/home/steam/${forwardSlashed}`;
}

export async function generateMetadata(
    props: PageProps<"/guides/games/[gameId]">,
): Promise<Metadata> {
    const { gameId } = await props.params;
    const game = games.find((candidate) => candidate.id === gameId);

    if (!game) {
        return {};
    }

    return pageMetadata({
        title: `${game.name} Dedicated Server Setup`,
        description: `Free guide: how to download, configure and run ${article(game.name)} ${game.name} dedicated server -- getting the server files, required ports, starting it up, and generating a config file.`,
        path: `/guides/games/${game.id}`,
    });
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
    const hasStartScript = Boolean(
        setup.startCommand?.windows || setup.startCommand?.linux,
    );
    const hasUpdateScript = setup.method.type === "steamcmd";
    const hasScriptsStep = hasStartScript || hasUpdateScript;
    const requiredPortText = requiredPorts
        .filter((port) => port.required)
        .map((port) => `${port.protocol} ${port.port}`)
        .join(", ");

    // Direct-answer Q&A for the same facts already rendered as numbered
    // steps above -- restated in question form so both readers skimming
    // and AI systems extracting an answer can find "what port does X use"
    // etc. without having to parse the whole walkthrough. Every answer here
    // is derived from the same lib/games.ts / lib/game-setup.ts data the
    // rest of the page uses, not a new claim.
    const faqs = [
        {
            question: `How do I install ${article(game.name)} ${game.name} dedicated server?`,
            answer:
                setup.method.type === "steamcmd"
                    ? `Download it with SteamCMD using Steam app ID ${setup.method.appId}, then run it from the install directory. See "Get the server files" and "Start the server" above for the exact commands.`
                    : `Download it directly from ${setup.method.urlLabel}, then run it from the install directory. See "Get the server files" and "Start the server" above for the exact commands.`,
        },
        {
            question: `Where is the ${game.name} install directory?`,
            answer:
                setup.method.type === "steamcmd"
                    ? `Wherever you point force_install_dir when downloading it with SteamCMD -- this guide uses ${setup.method.installDirExample} as an example, but any folder works.${setup.installDirNotes ? ` ${setup.installDirNotes}` : ""}`
                    : `Wherever you extract or install the download from ${setup.method.urlLabel}.${setup.installDirNotes ? ` ${setup.installDirNotes}` : ""}`,
        },
        {
            question: `What port does ${article(game.name)} ${game.name} server use?`,
            answer:
                requiredPortText.length > 0
                    ? `${requiredPortText} by default, forwarded to the server machine's local IP address. See the port forwarding guide for how.`
                    : `We don't currently have a confirmed required port for ${game.name}.`,
        },
        ...(setup.configFileLocation
            ? [
                  {
                      question: `Where does the ${game.name} config file live?`,
                      answer: `${setup.configFileLocation.path}. ${setup.configFileLocation.description}`,
                  },
              ]
            : []),
        ...(hasConfigGenerator
            ? [
                  {
                      question: `How do I configure ${article(game.name)} ${game.name} server?`,
                      answer: `Use the ${game.name} config generator to fill in server name, password, max players and more, and download a ready-to-use ${configTemplates[game.id].configFileLabel}.`,
                  },
              ]
            : []),
        {
            question: `How do I keep ${article(game.name)} ${game.name} server running?`,
            answer:
                "Set it up as a Windows Task Scheduler task or a Linux systemd service so it survives a reboot or crash without you starting it by hand -- see the keeping it running 24/7 guide.",
        },
    ];

    const howToSteps = [
        {
            name: "Get the server files",
            text:
                setup.method.type === "steamcmd"
                    ? `Download the server via SteamCMD using Steam app ID ${setup.method.appId}.`
                    : `Download the server directly from ${setup.method.urlLabel}.`,
        },
        ...(requiredPortText.length > 0
            ? [
                  {
                      name: "Forward the required ports",
                      text: `Forward ${requiredPortText} to the server machine's local IP on your router, and allow them through its firewall.`,
                  },
              ]
            : []),
        {
            name: "Start the server",
            text: setup.startNotes,
        },
        ...(hasConfigGenerator
            ? [
                  {
                      name: "Generate a config file",
                      text: `Fill in server name, password, max players and more, then download a ready-to-use ${configTemplates[game.id].configFileLabel}.`,
                      url: `https://selfservr.com/config-generator/${game.id}`,
                  },
              ]
            : []),
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-3xl px-6 py-16">
                <JsonLd
                    data={howToSchema({
                        name: `${game.name} Dedicated Server Setup`,
                        description: `How to download, configure and run ${article(game.name)} ${game.name} dedicated server.`,
                        steps: howToSteps,
                    })}
                />

                <JsonLd
                    data={faqSchema(
                        faqs.map((faq) => ({
                            question: faq.question,
                            answer: faq.answer,
                        })),
                    )}
                />

                <Breadcrumbs
                    items={[
                        { label: "Guides", href: "/guides" },
                        { label: game.name },
                    ]}
                />

                <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                    SelfServr Guide
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight">
                    {game.name} Dedicated Server Setup
                </h1>

                <p className="mt-4 text-lg leading-8 text-slate-300">
                    How to get {article(game.name)} {game.name} dedicated
                    server running on your own machine, from downloading the
                    server files to starting it up.
                </p>

                <div className="mt-8 rounded-lg border border-sky-900 bg-sky-950/30 p-4 text-sm leading-6 text-slate-300">
                    Before you start, check{" "}
                    <Link
                        href={`/can-my-pc-run-it/${game.id}`}
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        Can My PC Run {article(game.name)} {game.name} Server?
                    </Link>{" "}
                    to see whether your hardware meets {game.name}&apos;s
                    requirements, and read the{" "}
                    <Link
                        href="/guides/port-forwarding"
                        className="text-sky-400 hover:text-sky-300 hover:underline"
                    >
                        port forwarding guide
                    </Link>{" "}
                    if you want players outside your home network to connect.
                </div>

                <HostingLinksModal game={game} />

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

                                <CodeBlock
                                    className="mt-3"
                                    code={`force_install_dir "${setup.method.installDirExample}"\nlogin anonymous\napp_update ${setup.method.appId}${setup.method.betaBranch ? ` -beta ${setup.method.betaBranch}` : ""} validate\nquit`}
                                />

                                {setup.installDirNotes && (
                                    <p className="mt-3 text-sm leading-6 text-slate-400">
                                        {setup.installDirNotes}
                                    </p>
                                )}

                                {setup.method.betaBranch && (
                                    <p className="mt-3 text-sm leading-6 text-slate-400">
                                        {game.name}&apos;s actively-played
                                        version lives on the{" "}
                                        {setup.method.betaBranch} branch, not
                                        the default one -- the command above
                                        already includes the{" "}
                                        <code>
                                            -beta {setup.method.betaBranch}
                                        </code>{" "}
                                        flag needed to get it.
                                    </p>
                                )}

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
                            <>
                                <p className="mt-3 leading-7 text-slate-300">
                                    {game.name} isn&apos;t distributed through
                                    Steam. Download the dedicated server
                                    directly from{" "}
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

                                {setup.installDirNotes && (
                                    <p className="mt-3 text-sm leading-6 text-slate-400">
                                        {setup.installDirNotes}
                                    </p>
                                )}
                            </>
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

                        {setup.startCommand?.windows && (
                            <>
                                <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                                    Windows
                                </p>
                                <CodeBlock
                                    className="mt-2"
                                    code={setup.startCommand.windows}
                                />
                            </>
                        )}

                        {setup.startCommand?.linux && (
                            <>
                                <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                                    Linux
                                </p>
                                <CodeBlock
                                    className="mt-2"
                                    code={setup.startCommand.linux}
                                />
                            </>
                        )}

                        <p className="mt-3 leading-7 text-slate-300">
                            {setup.startNotes}
                        </p>

                        {setup.configFileLocation && (
                            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                                <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                    Where the config file lives
                                </p>
                                <code className="mt-2 block break-all text-sm text-slate-200">
                                    {setup.configFileLocation.path}
                                </code>
                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    {setup.configFileLocation.description}
                                </p>
                            </div>
                        )}

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

                    {hasScriptsStep && (
                        <section className="rounded-lg border border-slate-700 bg-slate-900/60 p-6">
                            <h2 className="text-2xl font-semibold">
                                4. Save it as a script{" "}
                                <span className="text-base font-normal text-slate-400">
                                    (optional, but recommended)
                                </span>
                            </h2>

                            <p className="mt-3 leading-7 text-slate-300">
                                Saving the commands above as scripts means
                                starting and updating the server is a single
                                double-click instead of retyping them, and
                                it&apos;s what lets Task Scheduler or systemd
                                start the server for you -- see{" "}
                                <Link
                                    href="/guides/keep-server-running"
                                    className="text-sky-400 hover:text-sky-300 hover:underline"
                                >
                                    keeping it running 24/7
                                </Link>
                                .
                            </p>

                            {hasStartScript && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold">
                                        Start script
                                    </h3>

                                    {setup.startCommand?.windows && (
                                        <>
                                            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                                                Windows -- start-server.bat
                                            </p>
                                            <CodeBlock
                                                className="mt-2"
                                                code={`@echo off\ncd /d "%~dp0"\n${setup.startCommand.windows}`}
                                            />
                                        </>
                                    )}

                                    {setup.startCommand?.linux && (
                                        <>
                                            <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                                                Linux -- start-server.sh
                                            </p>
                                            <CodeBlock
                                                className="mt-2"
                                                code={`#!/bin/bash\ncd "$(dirname "$0")" || exit 1\n${setup.startCommand.linux}`}
                                            />
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                Make it executable once with{" "}
                                                <code>chmod +x start-server.sh</code>.
                                            </p>
                                        </>
                                    )}

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Save either script in the same folder
                                        as the server executable --{" "}
                                        <code>%~dp0</code> (Windows) and{" "}
                                        <code>$(dirname &quot;$0&quot;)</code>{" "}
                                        (Linux) both mean &quot;wherever this
                                        script itself lives&quot;, so it works
                                        regardless of the exact path you
                                        installed to.
                                    </p>
                                </div>
                            )}

                            {hasUpdateScript && setup.method.type === "steamcmd" && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold">
                                        Update script
                                    </h3>

                                    <p className="mt-3 leading-7 text-slate-300">
                                        Adjust the SteamCMD path below if
                                        yours isn&apos;t at{" "}
                                        <code>C:\steamcmd</code>:
                                    </p>

                                    <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                                        Windows -- update-server.bat
                                    </p>
                                    <CodeBlock
                                        className="mt-2"
                                        code={`@echo off\nC:\\steamcmd\\steamcmd.exe +force_install_dir "${setup.method.installDirExample}" +login anonymous +app_update ${setup.method.appId}${setup.method.betaBranch ? ` -beta ${setup.method.betaBranch}` : ""} validate +quit`}
                                    />

                                    <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                                        Linux -- update-server.sh
                                    </p>
                                    <CodeBlock
                                        className="mt-2"
                                        code={`#!/bin/bash\nsteamcmd +force_install_dir "${toLinuxInstallDir(setup.method.installDirExample)}" +login anonymous +app_update ${setup.method.appId}${setup.method.betaBranch ? ` -beta ${setup.method.betaBranch}` : ""} validate +quit`}
                                    />
                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Adjust the install path above to
                                        wherever you actually want the server
                                        on your Linux machine -- it&apos;s
                                        shown as an example, not a
                                        requirement.
                                    </p>
                                </div>
                            )}
                        </section>
                    )}

                    {hasConfigGenerator && (
                        <section className="rounded-lg border border-slate-700 bg-slate-900 p-6">
                            <h2 className="text-2xl font-semibold">
                                5. Generate a config file
                            </h2>

                            <p className="mt-3 leading-7 text-slate-300">
                                Use the {game.name} config generator to fill
                                in server name, password, max players and
                                more, and download a ready-to-use{" "}
                                {configTemplates[game.id].configFileLabel}.
                            </p>

                            <Link
                                href={`/config-generator/${game.id}`}
                                className="mt-5 inline-block rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
                            >
                                Open the {game.name} config generator →
                            </Link>
                        </section>
                    )}

                    {setup.considerations && setup.considerations.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold">
                                Things to know before you host {game.name}
                            </h2>

                            <div className="mt-5 space-y-6">
                                {setup.considerations.map((note) => (
                                    <div key={note.title}>
                                        <h3 className="font-semibold text-white">
                                            {note.title}
                                        </h3>
                                        <p className="mt-2 leading-7 text-slate-300">
                                            {note.text}
                                        </p>
                                    </div>
                                ))}
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

                    <section>
                        <h2 className="text-2xl font-semibold">
                            Frequently asked questions
                        </h2>

                        <div className="mt-5 space-y-6">
                            {faqs.map((faq) => (
                                <div key={faq.question}>
                                    <h3 className="font-semibold text-white">
                                        {faq.question}
                                    </h3>
                                    <p className="mt-2 leading-7 text-slate-300">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {setup.commonIssues && setup.commonIssues.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold">
                                Common {game.name} problems
                            </h2>

                            <div className="mt-5 space-y-6">
                                {setup.commonIssues.map((issue) => (
                                    <div key={issue.title}>
                                        <h3 className="font-semibold text-white">
                                            {issue.title}
                                        </h3>
                                        <p className="mt-2 leading-7 text-slate-300">
                                            {issue.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
                        <h2 className="text-lg font-semibold">
                            Players still can&apos;t connect?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            If the server starts fine but friends can&apos;t
                            reach it, see the{" "}
                            <Link
                                href="/troubleshooting"
                                className="text-sky-400 hover:text-sky-300 hover:underline"
                            >
                                connection troubleshooting guide
                            </Link>{" "}
                            -- it covers CGNAT, firewall issues, port
                            forwarding mistakes and more, and includes an
                            interactive diagnostic.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
