import Link from "next/link";
import type { Metadata } from "next";
import { guides, gameGuides } from "@/lib/guides";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Every free guide on Server Me Up: general networking guides for port forwarding, static IPs and Dynamic DNS, plus a dedicated server setup guide for each supported game.",
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Guides" }]} />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">Guides</h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          Networking guides for the parts of self-hosting that aren&apos;t
          specific to any one game, plus a full setup walkthrough for every
          game we support.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">General guides</h2>

            <ul className="mt-4 space-y-2">
              {guides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={guide.href}
                    className="block rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-slate-200 hover:border-sky-500 hover:text-white"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Game setup guides</h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Downloading the server files, required ports and starting it
              up, for each supported game.
            </p>

            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {gameGuides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={guide.href}
                    className="block rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300 hover:border-sky-500 hover:text-white"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
