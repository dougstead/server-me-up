import Link from "next/link";
import { Suspense } from "react";
import CanMyMachineRunIt from "@/components/CanMyMachineRunIt";
import { games } from "@/lib/games";
import { getAllBenchmarkInsights } from "@/lib/benchmark-insights";

export default function Home() {
  const benchmarkInsightsByGame = getAllBenchmarkInsights();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-400">
          Dedicated server tools
        </p>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Thinking of hosting it yourself?
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Configure and host your own game servers without digging through
          config files and obscure setup guides --{" "}
          <strong className="font-semibold text-white">
            completely free to use
          </strong>
          . Check whether your machine is up to the job, generate
          ready-to-use server config files, and follow plain-language guides
          for the networking side of self-hosting.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Can My Machine Run It?
            </h2>

            <Link
              href="/can-my-pc-run-it"
              className="text-sm font-semibold text-sky-400 hover:text-sky-300 hover:underline"
            >
              Open full page →
            </Link>
          </div>

          <p className="mt-3 max-w-2xl text-slate-300">
            Enter your machine specs and we&apos;ll estimate whether it can
            host your game server.
          </p>

          <div className="mt-8">
            <Suspense fallback={null}>
              <CanMyMachineRunIt
                benchmarkInsightsByGame={benchmarkInsightsByGame}
              />
            </Suspense>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-200">
            Or jump straight to a game
          </h2>

          <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  href={`/can-my-pc-run-it/${game.id}`}
                  className="block rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300 hover:border-sky-500 hover:text-white"
                >
                  {game.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
