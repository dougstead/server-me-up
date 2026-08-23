import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Server Me Up does and doesn't do with your data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>

        <p className="mt-4 text-slate-400">Last updated: August 2026</p>

        <div className="mt-10 space-y-10">
          <section>
            <h2 className="text-xl font-semibold">Who runs this site</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Server Me Up is an independent, personally-run hobby project --
              not a registered company. It&apos;s run by one person, contactable
              via the{" "}
              <a
                href="/contact"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                contact page
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">What this site doesn&apos;t do</h2>

            <p className="mt-3 leading-7 text-slate-300">
              There are no user accounts, no logins, and no passwords
              collected by this site. Server Me Up doesn&apos;t run analytics
              or advertising scripts, and doesn&apos;t set any cookies of its
              own.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">What this site does do</h2>

            <ul className="mt-3 list-disc space-y-3 pl-6 leading-7 text-slate-300">
              <li>
                <strong className="text-white">Can My Machine Run It?</strong>{" "}
                and the config generators run entirely in your browser. What
                you type into those forms -- CPU model, RAM, server settings
                -- is never sent to any server; it only leaves your device if
                you click Download, and even then it&apos;s saved straight to
                your own device.
              </li>
              <li>
                <strong className="text-white">The CPU search box</strong>{" "}
                sends what you type to this site&apos;s server to look up
                matching CPUs. That query isn&apos;t stored anywhere beyond
                the standard, short-lived request logs any web server keeps.
              </li>
              <li>
                <strong className="text-white">
                  The downloadable hardware-scan utility
                </strong>{" "}
                reads your CPU, RAM, storage type and OS locally, then opens
                your browser to a page with those values in the URL (e.g.{" "}
                <code>?cpu=...&amp;ram=...</code>) so the form is pre-filled.
                Those values do reach this site&apos;s server as part of that
                page request and may appear in ordinary web server logs, the
                same as any URL you visit. They aren&apos;t linked to your
                identity or stored anywhere beyond standard log retention.
              </li>
              <li>
                <strong className="text-white">The contact form</strong>{" "}
                doesn&apos;t submit anywhere on this site -- clicking Send
                opens your own email app with the message pre-filled. What
                you send after that is handled by your email provider, not
                by this site.
              </li>
              <li>
                <strong className="text-white">Hosting-provider logs.</strong>{" "}
                Like effectively every website, the infrastructure this site
                runs on keeps basic connection logs (e.g. IP address,
                timestamp, page requested) for security and operational
                purposes. This is standard web server behaviour, not
                something Server Me Up adds on top.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Affiliate links</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Some pages link to third-party game-hosting providers (e.g.
              ScalaCube) using affiliate links, clearly marked wherever they
              appear. If you click through and make a purchase, Server Me Up
              may earn a commission. That third-party site has its own
              privacy practices and may set its own cookies once you land
              there -- this policy only covers Server Me Up itself.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Changes to this policy</h2>

            <p className="mt-3 leading-7 text-slate-300">
              If what this site collects or does ever changes -- for
              example, if analytics are added later -- this page will be
              updated to reflect that.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Questions</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Reach out via the{" "}
              <a
                href="/contact"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                contact page
              </a>{" "}
              with anything about how this site handles data.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
