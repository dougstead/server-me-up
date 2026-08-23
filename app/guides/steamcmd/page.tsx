import Link from "next/link";
import type { Metadata } from "next";
import { gameGuides } from "@/lib/guides";
import CodeBlock from "@/components/CodeBlock";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Installing SteamCMD",
  description:
    "Free guide: how to install Valve's SteamCMD tool on Windows or Linux and use it to download dedicated servers for Rust, ARK, Valheim, Team Fortress 2 and more.",
  alternates: {
    canonical: "/guides/steamcmd",
  },
};

export default function SteamCmdGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Breadcrumbs
          items={[
            { label: "Guides", href: "/guides" },
            { label: "Installing SteamCMD" },
          ]}
        />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up Guide
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Installing SteamCMD
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-300">
          Most Steam-distributed dedicated servers -- Rust, ARK, Valheim,
          Team Fortress 2, Garry&apos;s Mod, Palworld and more -- are
          downloaded with SteamCMD, Valve&apos;s command-line version of the
          Steam client. You don&apos;t need a Steam account that owns any of
          these games; most dedicated-server tools can be downloaded
          anonymously.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              1. Install SteamCMD
            </h2>

            <h3 className="mt-6 text-lg font-semibold">Windows</h3>

            <p className="mt-2 leading-7 text-slate-300">
              Download{" "}
              <a
                href="https://developer.valvesoftware.com/wiki/SteamCMD#Windows"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                steamcmd.zip
              </a>{" "}
              from Valve&apos;s official page, and extract it into a folder
              of its own, e.g. <code>C:\steamcmd</code>. Run{" "}
              <code>steamcmd.exe</code> once from that folder -- it will
              download the rest of its files and drop you at a{" "}
              <code>Steam&gt;</code> prompt.
            </p>

            <h3 className="mt-6 text-lg font-semibold">Linux</h3>

            <p className="mt-2 text-slate-300">
              On Debian/Ubuntu, enable the <code>multiverse</code> (or
              equivalent) repository and install directly:
            </p>

            <CodeBlock
              className="mt-3"
              code={`sudo add-apt-repository multiverse
sudo dpkg --add-architecture i386
sudo apt update
sudo apt install steamcmd`}
            />

            <p className="mt-3 text-slate-300">
              Then launch it with <code>steamcmd</code> (or{" "}
              <code>/usr/games/steamcmd</code> on some distributions).
              Other distributions typically package it too -- check your
              package manager first before downloading the tarball
              manually from Valve.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. Download a dedicated server
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              From the <code>Steam&gt;</code> prompt (or as command-line
              arguments to <code>steamcmd.exe</code>/<code>steamcmd</code>),
              the basic pattern is:
            </p>

            <CodeBlock
              className="mt-3"
              code={`force_install_dir "C:\\GameServers\\MyServer"
login anonymous
app_update <app id> validate
quit`}
            />

            <p className="mt-3 leading-7 text-slate-300">
              Replace <code>&lt;app id&gt;</code> with the Steam app ID for
              the dedicated server tool you want -- each supported game&apos;s
              guide below has the correct one, along with the exact command
              to start the server once it&apos;s downloaded.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              A few games (Arma 3 and Starbound, for example) require a
              Steam account that already owns the game rather than an
              anonymous login. If <code>login anonymous</code> is rejected,
              use <code>login &lt;your-steam-username&gt;</code> instead and
              enter your password when prompted.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Game-specific setup guides
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Once SteamCMD is installed, jump straight to your game:
            </p>

            <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {gameGuides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href={guide.href}
                    className="block rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 hover:border-sky-500 hover:text-white"
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
