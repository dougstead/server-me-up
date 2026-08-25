import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { games } from "@/lib/games";
import { configTemplates } from "@/lib/config-templates";
import { getAllBenchmarkInsights } from "@/lib/benchmark-insights";
import CanMyMachineRunIt from "@/components/CanMyMachineRunIt";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { faqSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/metadata";
import { article } from "@/lib/text";

export async function generateStaticParams() {
    return games.map((game) => ({ gameId: game.id }));
}

export async function generateMetadata(
    props: PageProps<"/can-my-pc-run-it/[gameId]">,
): Promise<Metadata> {
    const { gameId } = await props.params;
    const game = games.find((candidate) => candidate.id === gameId);

    if (!game) {
        return {};
    }

    return pageMetadata({
        title: `Can My PC Run ${article(game.name)} ${game.name} Server?`,
        description: `Free tool: check whether your PC or laptop meets the CPU, RAM, storage and network requirements to host ${article(game.name)} ${game.name} dedicated server -- enter your specs for an instant answer.`,
        path: `/can-my-pc-run-it/${game.id}`,
    });
}

export default async function CanMyPcRunGamePage(
    props: PageProps<"/can-my-pc-run-it/[gameId]">,
) {
    const { gameId } = await props.params;
    const game = games.find((candidate) => candidate.id === gameId);

    if (!game) {
        notFound();
    }

    const { cpu, ram, storage, supportedOperatingSystems, requiredPorts } =
        game.official;
    const hasConfigGenerator = Boolean(configTemplates[game.id]);
    const benchmarkInsightsByGame = getAllBenchmarkInsights();

    const laptopRequirementClauses = [
        ram.minimumGb != null ? `at least ${ram.minimumGb} GB of RAM` : null,
        cpu.minimumModel
            ? `a CPU roughly equivalent to ${cpu.minimumModel}`
            : null,
    ].filter((clause): clause is string => clause !== null);

    const faqs = [
        {
            question: `Can I run ${article(game.name)} ${game.name} server on an old laptop?`,
            answer:
                laptopRequirementClauses.length > 0
                    ? `It depends on the laptop. ${game.name} needs ${laptopRequirementClauses.join(
                          " and ",
                      )} -- an older laptop can work if it clears that bar, but older CPUs and mechanical hard drives are the most common bottleneck. Use the checker below to test your exact laptop's specs.`
                    : `${game.name}'s developer doesn't publish a fixed minimum, so it depends on your laptop's exact CPU and RAM. Use the checker below to test your specific machine.`,
        },
        {
            question: `How much RAM do I need for ${article(game.name)} ${game.name} server?`,
            answer:
                ram.baseGb != null && ram.perPlayerGb != null
                    ? `Official guidance is roughly ${ram.baseGb} GB base plus ${ram.perPlayerGb} GB per connected player.`
                    : ram.recommendedGb != null
                      ? `${ram.recommendedGb} GB is recommended${ram.minimumGb != null ? ` (${ram.minimumGb} GB minimum)` : ""}.`
                      : ram.minimumGb != null
                        ? `At least ${ram.minimumGb} GB.`
                        : `The developer doesn't publish a fixed RAM requirement -- it scales with world size, mods and player count. See the notes on the checker below for what's known.`,
        },
        {
            question: `What ports does ${article(game.name)} ${game.name} server need?`,
            answer:
                requiredPorts.length > 0
                    ? `${requiredPorts
                          .filter((port) => port.required)
                          .map((port) => `${port.protocol} ${port.port}`)
                          .join(", ")}, forwarded on your router to the server's local IP address. See the port forwarding guide for how.`
                    : `We don't currently have a confirmed required port for ${game.name}.`,
        },
        {
            question: `How do I actually set up ${article(game.name)} ${game.name} server?`,
            answer: `See the full ${game.name} setup guide for downloading the server files, required ports and starting it up${hasConfigGenerator ? ", plus a config generator to produce a ready-to-use settings file" : ""}.`,
        },
    ];

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <JsonLd
                data={faqSchema(
                    faqs.map((faq) => ({ question: faq.question, answer: faq.answer })),
                )}
            />

            <div className="mx-auto max-w-5xl px-6 py-16">
                <Breadcrumbs
                    items={[
                        { label: "Can My Machine Run It?", href: "/can-my-pc-run-it" },
                        { label: game.name },
                    ]}
                />

                <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                    SelfServr
                </p>

                <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                    Can My PC Run {article(game.name)} {game.name} Server?
                </h1>

                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                    Whether you&apos;re running a dedicated gaming rig or
                    repurposing an old laptop, here&apos;s what{" "}
                    {article(game.name)} {game.name} dedicated server
                    actually needs -- and a tool below to check it against
                    your exact machine.
                </p>

                <section className="mt-12 max-w-2xl">
                    <h2 className="text-2xl font-semibold">
                        What {game.name} needs
                    </h2>

                    <dl className="mt-5 space-y-4">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                CPU
                            </dt>
                            <dd className="mt-1 text-slate-200">
                                {cpu.recommendedModel ??
                                    cpu.minimumModel ??
                                    (cpu.recommendedPhysicalCores != null
                                        ? `${cpu.recommendedPhysicalCores} physical cores recommended`
                                        : cpu.minimumPhysicalCores != null
                                          ? `${cpu.minimumPhysicalCores} physical cores minimum`
                                          : cpu.recommendedLogicalCores != null
                                            ? `${cpu.recommendedLogicalCores} logical cores recommended`
                                            : cpu.minimumLogicalCores != null
                                              ? `${cpu.minimumLogicalCores} logical cores minimum`
                                              : "Not officially published for dedicated servers -- see the checker below for details.")}
                            </dd>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                RAM
                            </dt>
                            <dd className="mt-1 text-slate-200">
                                {ram.baseGb != null && ram.perPlayerGb != null
                                    ? `~${ram.baseGb} GB base + ${ram.perPlayerGb} GB per player`
                                    : ram.recommendedGb != null
                                      ? `${ram.recommendedGb} GB recommended${ram.minimumGb != null ? ` (${ram.minimumGb} GB minimum)` : ""}`
                                      : ram.minimumGb != null
                                        ? `${ram.minimumGb} GB minimum`
                                        : "Not officially published -- see the checker below for details."}
                            </dd>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                Storage
                            </dt>
                            <dd className="mt-1 text-slate-200">
                                {storage.minimumGb != null
                                    ? `${storage.minimumGb} GB${storage.recommendedGb != null && storage.recommendedGb !== storage.minimumGb ? `-${storage.recommendedGb} GB` : ""}${storage.ssd === "required" ? " (SSD required)" : storage.ssd === "recommended" ? " (SSD recommended)" : ""}`
                                    : storage.ssd === "required"
                                      ? "SSD required; exact size not officially published"
                                      : storage.ssd === "recommended"
                                        ? "SSD recommended; exact size not officially published"
                                        : "Not officially published for dedicated servers."}
                            </dd>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
                            <dt className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                                Operating System
                            </dt>
                            <dd className="mt-1 text-slate-200">
                                {supportedOperatingSystems
                                    .map((os) =>
                                        os === "macos"
                                            ? "macOS"
                                            : os[0].toUpperCase() + os.slice(1),
                                    )
                                    .join(", ")}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="mt-12">
                    <h2 className="text-2xl font-semibold">
                        Check your exact machine
                    </h2>

                    <p className="mt-2 max-w-2xl text-slate-300">
                        Enter your CPU, RAM and storage below for a
                        field-by-field compatibility check against{" "}
                        {game.name}&apos;s requirements.
                    </p>

                    <div className="mt-8">
                        <Suspense fallback={null}>
                            <CanMyMachineRunIt
                                defaultGameId={game.id}
                                benchmarkInsightsByGame={benchmarkInsightsByGame}
                            />
                        </Suspense>
                    </div>
                </section>

                <section className="mt-12 max-w-2xl">
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

                <section className="mt-12 max-w-2xl rounded-lg border border-slate-800 bg-slate-900/60 p-6">
                    <h2 className="text-lg font-semibold">Next steps</h2>

                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                            href={`/guides/games/${game.id}`}
                            className="rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
                        >
                            {game.name} setup guide →
                        </Link>

                        {hasConfigGenerator && (
                            <Link
                                href={`/config-generator/${game.id}`}
                                className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-white hover:border-sky-500"
                            >
                                Config generator →
                            </Link>
                        )}

                        <Link
                            href="/troubleshooting"
                            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-white hover:border-sky-500"
                        >
                            Troubleshooting guide →
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}
