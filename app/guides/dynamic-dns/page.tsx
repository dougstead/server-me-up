import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Dynamic DNS for a Changing IP Address",
  description:
    "Free guide: how to set up Dynamic DNS so players can always reach your game server, even when your ISP changes your home connection's public IP address.",
  alternates: {
    canonical: "/guides/dynamic-dns",
  },
};

export default function DynamicDnsGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Guides", href: "/guides" },
            { label: "Dynamic DNS" },
          ]}
        />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up Guide
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Dynamic DNS for a Changing IP Address
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-300">
          Most home internet connections have a dynamic public IP address --
          your ISP can change it at any time (a router reboot or a lease
          renewal is a common trigger). When that happens, anyone who
          bookmarked your old IP address can no longer connect. Dynamic DNS
          (DDNS) gives you a hostname that keeps pointing at your server
          even after your public IP changes.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              How it works
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              You register a hostname (e.g.{" "}
              <code>myserver.duckdns.org</code>) with a DDNS provider. A
              small updater -- either built into your router or run on your
              server machine -- periodically checks your current public IP
              and tells the provider whenever it changes, so the hostname
              always resolves to the right address. Players connect to the
              hostname instead of a raw IP.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              This only fixes the &quot;how do players find my address&quot;
              problem -- you still need{" "}
              <Link
                href="/guides/port-forwarding"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                port forwarding
              </Link>{" "}
              set up separately, and it doesn&apos;t help if your connection
              is behind Carrier-Grade NAT (CGNAT), since in that case you
              don&apos;t have a public IP to point at in the first place.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Option 1: Your router&apos;s built-in DDNS client
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Many routers have a DDNS section in their admin page (often
              under &quot;Advanced&quot; or &quot;WAN&quot; settings) that
              already supports a handful of providers -- No-IP and DynDNS
              are common. If yours does, this is the simplest option: enter
              your provider account details once, and the router keeps the
              hostname updated on its own with no extra software needed on
              the server.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Option 2: A free DDNS provider with a small updater
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              If your router doesn&apos;t support DDNS, a free provider like{" "}
              <a
                href="https://www.duckdns.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                DuckDNS
              </a>{" "}
              or{" "}
              <a
                href="https://www.noip.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                No-IP
              </a>{" "}
              works from the server machine itself:
            </p>

            <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-300">
              <li>Sign up and create a subdomain (e.g. via DuckDNS, signing in with an existing account).</li>
              <li>Note the token/API key the provider gives you for that subdomain.</li>
              <li>
                Install the provider&apos;s small updater client (or a
                simple scheduled script that calls their update URL) on the
                server machine, so it runs periodically -- every 5 minutes
                is typical.
              </li>
            </ol>

            <p className="mt-4 leading-7 text-slate-300">
              See{" "}
              <Link
                href="/guides/keep-server-running"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                keeping your server running 24/7
              </Link>{" "}
              for how to schedule something like this so it survives a
              reboot.
            </p>
          </section>

          <section className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-6">
            <h2 className="text-xl font-semibold">
              If you have a domain of your own
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              If you already own a domain, some DNS providers (Cloudflare,
              for example) offer a free API you can script an updater
              against, so you can use a subdomain of your own instead of a
              DDNS provider&apos;s domain. This takes a bit more setup than
              a dedicated DDNS provider, but gives you a permanent,
              memorable address under your own name.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
