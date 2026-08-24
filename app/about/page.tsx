import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { techArticleSchema } from "@/lib/structured-data";
import { SITE_SCHEMA_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "What SelfServr is: free guides and tools for hosting dedicated game servers on your own hardware.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <JsonLd
        data={techArticleSchema({
          headline: "About SelfServr",
          description: SITE_SCHEMA_DESCRIPTION,
          path: "/about",
        })}
      />

      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs items={[{ label: "About" }]} />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          SelfServr
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          About SelfServr
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-300">
          {SITE_SCHEMA_DESCRIPTION}
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">What SelfServr does</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Running a game server for you and your friends usually means
              downloading server files from an unfamiliar tool, digging
              through a wiki for the right port number, and hand-editing a
              config file whose format nobody explains properly. SelfServr
              exists to make that part boring instead of confusing. For each
              supported game, it provides:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
              <li>
                <Link
                  href="/can-my-pc-run-it"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  A hardware compatibility checker
                </Link>{" "}
                -- enter your CPU, RAM and storage and see how they compare
                against the game&apos;s published requirements.
              </li>
              <li>
                <Link
                  href="/guides"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  A step-by-step setup guide
                </Link>{" "}
                -- getting the server files, required ports, and the exact
                command to start it.
              </li>
              <li>
                <Link
                  href="/config-generator"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  A config generator
                </Link>{" "}
                -- fill in a form and download a ready-to-use config file,
                for games where we have one.
              </li>
              <li>
                <Link
                  href="/troubleshooting"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  Connection troubleshooting
                </Link>{" "}
                -- for when the server runs fine locally but players
                can&apos;t connect.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Where the facts come from</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Technical claims on this site -- hardware requirements, ports,
              SteamCMD app IDs, config file keys -- are sourced from official
              developer/publisher documentation wherever one exists, with a
              link to it shown alongside the claim. Several developers
              don&apos;t publish a formal dedicated-server specification at
              all; where that&apos;s the case, pages say so explicitly and
              fall back to community wikis or hosting-provider guides,
              clearly labelled rather than presented as official. The
              compatibility checker&apos;s CPU database is{" "}
              <a
                href="https://github.com/buildcores/buildcores-open-db"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                BuildCores&apos; open CPU database
              </a>
              , not SelfServr&apos;s own testing.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              Where a config generator&apos;s source format couldn&apos;t be
              independently verified against a real generated file, the
              generator page says so, so you know to double-check before
              relying on it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Who runs this</h2>

            <p className="mt-3 leading-7 text-slate-300">
              SelfServr is an independent, personally-run hobby project --
              not a registered company, and not staffed by a team. See the{" "}
              <Link
                href="/privacy"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for more on that, or use the{" "}
              <Link
                href="/contact"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                contact page
              </Link>{" "}
              to get in touch.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
