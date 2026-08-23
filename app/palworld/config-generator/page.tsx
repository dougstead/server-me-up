import Link from "next/link";
import type { Metadata } from "next";
import ConfigGenerator from "@/components/ConfigGenerator";
import { loadRawConfigTemplates } from "@/lib/game-config-loader";

export const metadata: Metadata = {
  title: "Palworld Server Config Generator",
  description:
    "Generate a ready-to-use PalWorldSettings.ini for your Palworld dedicated server -- server name, password, difficulty and more.",
  alternates: {
    canonical: "/palworld/config-generator",
  },
};

export default function PalworldConfigGeneratorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Palworld
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Server Config Generator
        </h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          Configure your Palworld dedicated server using a simple interface.
          For the full setup walkthrough -- getting the server files,
          required ports and starting it up -- see the{" "}
          <Link
            href="/guides/games/palworld"
            className="text-sky-400 hover:text-sky-300 hover:underline"
          >
            Palworld setup guide
          </Link>
          .
        </p>

        <div className="mt-10">
          <ConfigGenerator
            gameId="palworld"
            rawTemplates={loadRawConfigTemplates("palworld")}
          />
        </div>
      </div>
    </main>
  );
}
