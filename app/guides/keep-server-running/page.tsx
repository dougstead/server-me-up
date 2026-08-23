import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keeping Your Server Running 24/7",
  description:
    "Free guide: how to keep your dedicated game server running around the clock using Windows Task Scheduler or a Linux systemd service, with automatic restarts on crash.",
  alternates: {
    canonical: "/guides/keep-server-running",
  },
};

export default function KeepServerRunningGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up Guide
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Keeping Your Server Running 24/7
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-300">
          Once your server works, you don&apos;t want to have to remote in
          and start it by hand after every reboot, power cut, or crash.
          Both Windows and Linux have a built-in way to start it
          automatically and bring it back if it dies.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">Windows: Task Scheduler</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Task Scheduler can launch your server&apos;s start command
              (or a <code>.bat</code> file that runs it) automatically at
              boot, without you needing to be logged in.
            </p>

            <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-300">
              <li>Open Task Scheduler and choose &quot;Create Task&quot; (not &quot;Create Basic Task&quot; -- it has fewer options).</li>
              <li>
                On the <strong>General</strong> tab, name the task, and
                tick &quot;Run whether user is logged on or not&quot;.
              </li>
              <li>
                On the <strong>Triggers</strong> tab, add a new trigger set
                to &quot;At startup&quot;.
              </li>
              <li>
                On the <strong>Actions</strong> tab, add a new action that
                starts your server&apos;s executable or start script, with
                &quot;Start in&quot; set to the server&apos;s install
                folder (so it can find its own files).
              </li>
              <li>
                On the <strong>Settings</strong> tab, consider enabling
                &quot;Restart the task if it fails&quot; for basic
                crash recovery.
              </li>
            </ol>

            <p className="mt-4 leading-7 text-slate-300">
              For a proper crash-restart loop rather than Task Scheduler&apos;s
              limited retry count, a free third-party tool like{" "}
              <a
                href="https://nssm.cc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                NSSM
              </a>{" "}
              can wrap your server&apos;s executable as a proper Windows
              service that Windows will restart automatically whenever it
              exits unexpectedly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">Linux: a systemd service</h2>

            <p className="mt-3 leading-7 text-slate-300">
              systemd is the standard way to run a background service on
              modern Linux distributions, and it handles both
              start-on-boot and restart-on-crash in one place. Create a
              unit file at <code>/etc/systemd/system/myserver.service</code>:
            </p>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
              {`[Unit]
Description=My game server
After=network.target

[Service]
Type=simple
User=gameserver
WorkingDirectory=/home/gameserver/myserver
ExecStart=/home/gameserver/myserver/start-server.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target`}
            </pre>

            <p className="mt-3 leading-7 text-slate-300">
              Adjust <code>User</code>, <code>WorkingDirectory</code> and{" "}
              <code>ExecStart</code> for your server. Running it as a
              dedicated non-root user (rather than root) is good practice.
              Then enable and start it:
            </p>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
              {`sudo systemctl daemon-reload
sudo systemctl enable --now myserver.service`}
            </pre>

            <p className="mt-3 leading-7 text-slate-300">
              Check on it with <code>systemctl status myserver</code>, and
              read its logs with <code>journalctl -u myserver -f</code>.
            </p>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-lg font-semibold">
              A simpler alternative: a restart loop
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              If you don&apos;t want to set up a scheduled task or systemd
              unit, a plain restart loop gets you basic crash recovery
              (though not start-on-boot). On Linux/macOS:
            </p>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
              {`#!/bin/bash
while true; do
  ./start-server.sh
  echo "Server stopped, restarting in 5 seconds..."
  sleep 5
done`}
            </pre>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              On Windows, the equivalent in a <code>.bat</code> file:
            </p>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
              {`:loop
start-server.bat
echo Server stopped, restarting...
timeout /t 5
goto loop`}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}
