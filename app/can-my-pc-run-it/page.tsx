import { Suspense } from "react";
import type { Metadata } from "next";
import CanMyMachineRunIt from "@/components/CanMyMachineRunIt";
import { getAllBenchmarkInsights } from "@/lib/benchmark-insights";
import Breadcrumbs from "@/components/Breadcrumbs";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
    title: "Can My Machine Run It?",
    description:
        "Free tool to check whether your PC or server meets the CPU, RAM, storage and network requirements to host a dedicated game server for Minecraft, Rust, ARK, Valheim, Palworld and more.",
    path: "/can-my-pc-run-it",
});

export default function CanMyPcRunItPage() {
    const benchmarkInsightsByGame = getAllBenchmarkInsights();

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-5xl px-6 py-16">
                <Breadcrumbs items={[{ label: "Can My Machine Run It?" }]} />

                <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                    SelfServr
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight">
                    Can My Machine Run It?
                </h1>

                <p className="mt-4 max-w-2xl text-slate-300">
                    Enter your machine specs and we&apos;ll estimate whether it can host
                    your game server.
                </p>

                <div className="mt-10">
                    <Suspense fallback={null}>
                        <CanMyMachineRunIt
                            benchmarkInsightsByGame={benchmarkInsightsByGame}
                        />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
