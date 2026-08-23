import { Suspense } from "react";
import CanMyMachineRunIt from "@/components/CanMyMachineRunIt";

export default function CanMyPcRunItPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-5xl px-6 py-16">
                <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                    Server Me Up
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
                        <CanMyMachineRunIt />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
