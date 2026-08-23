import Link from "next/link";
import type { Metadata } from "next";
import { configGeneratorGuides } from "@/lib/guides";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Config Generators",
  description:
    "Free config generators for dedicated game servers -- fill in a form and download a ready-to-use config file for every game we support one for.",
  alternates: {
    canonical: "/config-generator",
  },
};

export default function ConfigGeneratorIndexPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "Config Generators" }]} />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Config Generators
        </h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          Fill in server name, password, max players and more, and download a
          ready-to-use config file -- no digging through wikis for the right
          setting names.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {configGeneratorGuides.map((guide) => (
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

        <p className="mt-8 text-sm leading-6 text-slate-500">
          Don&apos;t see your game here? See the{" "}
          <Link
            href="/guides"
            className="text-sky-400 hover:text-sky-300 hover:underline"
          >
            full guides list
          </Link>{" "}
          instead -- every supported game has a setup guide even if it
          doesn&apos;t have a config generator yet.
        </p>
      </div>
    </main>
  );
}
