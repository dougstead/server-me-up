import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for using SelfServr's tools, guides and downloads.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          SelfServr
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Terms of Use
        </h1>

        <p className="mt-4 text-slate-400">Last updated: August 2026</p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl font-semibold">About this site</h2>

            <p className="mt-3 leading-7 text-slate-300">
              SelfServr is an independent, personally-run hobby project
              providing free guides and tools for setting up self-hosted
              game servers. It isn&apos;t affiliated with, endorsed by, or
              operated by any of the game developers or publishers named on
              this site. Game names and trademarks (Minecraft, Rust, ARK,
              Valheim, Palworld, and others) belong to their respective
              owners and are used here only to identify the games these
              guides and tools apply to.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">No warranty, use at your own judgment</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Everything on this site -- compatibility estimates, config
              generators, guides, and the downloadable hardware-scan utility
              -- is provided &quot;as is&quot;, free of charge, with no
              warranty of accuracy, completeness, or fitness for any
              particular purpose. The{" "}
              <Link
                href="/can-my-pc-run-it"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                Can My Machine Run It?
              </Link>{" "}
              tool is an automated, best-effort estimate, not a guarantee --
              see the disclaimer on that page for how its data is sourced.
              Don&apos;t rely on it as the sole basis for a purchase you
              can&apos;t undo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">The hardware-scan utility</h2>

            <p className="mt-3 leading-7 text-slate-300">
              The downloadable Windows script only reads local hardware
              information and opens your browser -- it doesn&apos;t modify
              your system, install anything, or send data anywhere except to
              this site, as described in the{" "}
              <Link
                href="/privacy"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                Privacy Policy
              </Link>
              . It&apos;s unsigned, so Windows may show a SmartScreen
              warning; the script is plain text and you&apos;re encouraged
              to read it before running it. You run it at your own
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Config files you generate</h2>

            <p className="mt-3 leading-7 text-slate-300">
              The config generators produce files based on publicly
              documented settings for each game, with sensible defaults
              filled in. Always review a generated file before using it on a
              live server, and keep backups of your own configuration --
              SelfServr isn&apos;t responsible for how a generated file
              performs on your server.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Affiliate links</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Some pages contain affiliate links to third-party hosting
              providers, clearly marked where they appear. SelfServr may
              earn a commission if you make a purchase through one of these
              links, at no extra cost to you. SelfServr isn&apos;t
              responsible for the products, services, or practices of any
              third-party site linked from here.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Limitation of liability</h2>

            <p className="mt-3 leading-7 text-slate-300">
              To the fullest extent permitted by law, SelfServr and its
              operator aren&apos;t liable for any loss or damage arising from
              your use of this site, its tools, its guides, or anything you
              download from it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Changes</h2>

            <p className="mt-3 leading-7 text-slate-300">
              These terms may be updated as the site changes. Continued use
              of the site after an update means you accept the current
              version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Questions</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Reach out via the{" "}
              <Link
                href="/contact"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                contact page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
