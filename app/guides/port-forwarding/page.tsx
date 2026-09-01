import Link from "next/link";
import type { Metadata } from "next";
import CodeBlock from "@/components/CodeBlock";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { howToSchema } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "How to Set Up Port Forwarding",
  description:
    "A free, beginner-friendly step-by-step guide to forwarding ports on your router so players outside your home network can connect to your dedicated game server.",
  path: "/guides/port-forwarding",
});

const HOW_TO_STEPS = [
  {
    name: "Find your server's local IP address",
    text: "Run ipconfig (Windows) or ip addr (Linux) on the server machine and note its IPv4 address on the network you're using.",
  },
  {
    name: "Open your router's admin page",
    text: "Browse to your router's local address (commonly 192.168.0.1, 192.168.1.1 or 192.168.1.254) and sign in with its admin credentials.",
  },
  {
    name: "Find the port forwarding settings",
    text: "Look for a section named Port Forwarding, Virtual Server, NAT or Port Mapping -- naming varies by router manufacturer.",
  },
  {
    name: "Create the forwarding rule",
    text: "Enter the server's internal IP address, the internal and external port, and the correct protocol (TCP or UDP) for your game.",
  },
  {
    name: "Allow the server through the firewall",
    text: "Allow the dedicated server application (or the specific port) through the server machine's own firewall -- Windows Firewall, ufw or firewalld.",
  },
  {
    name: "Keep the server's local IP stable",
    text: "Set a DHCP reservation on the router so the server always gets the same local IP address, otherwise the forwarding rule can silently break.",
  },
  {
    name: "Test that it worked",
    text: "Use a free online port-checking tool to confirm the port is actually open and reachable from outside your network before asking anyone to connect.",
  },
];

export default function PortForwardingGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <JsonLd
          data={howToSchema({
            name: "How to Set Up Port Forwarding",
            description:
              "Forward ports on your router so players outside your home network can connect to your dedicated game server.",
            steps: HOW_TO_STEPS,
          })}
        />

        <Breadcrumbs
          items={[
            { label: "Guides", href: "/guides" },
            { label: "Port Forwarding" },
          ]}
        />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          SelfServr Guide
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          How to Set Up Port Forwarding
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-300">
          By default, your home router blocks incoming connections from the
          internet as a security measure -- which is normally a good thing,
          but it also blocks your friends from reaching your game server.
          Port forwarding is a rule you add to your router that says
          &quot;when someone from the internet tries to reach this one
          specific door (a <em>port</em>), let them through, and send them
          straight to this one specific device on my network (your
          server).&quot; This guide walks through it slowly, one step at a
          time -- no prior networking knowledge assumed.
        </p>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            A few terms used in this guide
          </p>

          <dl className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
            <div>
              <dt className="font-semibold text-white">IP address</dt>
              <dd>
                A number that identifies a device on a network, a bit like a
                street address. Your server has a <em>local</em> IP address
                (only meaningful inside your home) and your whole home
                network also has a <em>public</em> IP address (how it looks
                from the internet).
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Port</dt>
              <dd>
                A number that tells your router (and your server) which
                specific piece of software incoming traffic is meant for.
                Think of the IP address as a building&apos;s street address,
                and the port as the specific apartment number inside it.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">Firewall</dt>
              <dd>
                Security software that blocks network traffic by default and
                only allows through what you&apos;ve explicitly permitted.
                Both your router and your server&apos;s own operating system
                have one -- port forwarding deals with the router&apos;s,
                and step 5 below deals with your server&apos;s.
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 rounded-lg border border-sky-900 bg-sky-950/20 p-5 text-sm leading-6 text-slate-300">
          <p className="font-semibold text-white">Before you start, you&apos;ll need:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access to the machine your game server runs on.</li>
            <li>
              The admin username and password for your router (see step 2
              below if you don&apos;t know it).
            </li>
            <li>
              The port number(s) your game needs -- check that game&apos;s{" "}
              <Link
                href="/guides"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                setup guide
              </Link>{" "}
              on this site, since every game is different.
            </li>
          </ul>
        </div>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              1. Find your server&apos;s local IP address
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Your router needs to know exactly which device on your home
              network to send game-server traffic to. It does that using the
              server machine&apos;s local IP address, so the first step is
              finding out what that is.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Windows
            </h3>

            <ol className="mt-2 list-decimal space-y-2 pl-6 text-slate-300">
              <li>
                Click the Start button (or press the Windows key), type{" "}
                <code>cmd</code>, and press Enter to open Command Prompt --
                a black window with white text.
              </li>
              <li>
                Type <code>ipconfig</code> and press Enter.
              </li>
            </ol>

            <CodeBlock className="mt-3" code="ipconfig" />

            <p className="mt-3 text-slate-300">
              You&apos;ll see a block of text for each network connection on
              your PC. Find the one you&apos;re actually using (usually{" "}
              <strong className="text-white">Ethernet adapter</strong> if
              you&apos;re on a cable, or{" "}
              <strong className="text-white">Wireless LAN adapter</strong>{" "}
              if you&apos;re on Wi-Fi), and look for the line labelled{" "}
              <strong className="text-white">IPv4 Address</strong>. It&apos;ll
              look something like <code>192.168.1.50</code>. Write that
              number down -- you&apos;ll need it in step 4.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Linux
            </h3>

            <p className="mt-2 text-slate-300">
              Open a terminal and run:
            </p>

            <CodeBlock className="mt-3" code="ip addr" />

            <p className="mt-3 text-slate-300">
              Look for <code>inet</code> followed by an address on your
              active network interface, commonly starting with{" "}
              <code>192.168.</code> or <code>10.</code>. That&apos;s your
              local IP address.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. Open your router&apos;s admin page
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Open any web browser (Chrome, Edge, Firefox -- whichever you
              normally use) and type one of the following into the{" "}
              <strong className="text-white">address bar at the very
              top of the window</strong>{" "}
              (not a Google search box) and press Enter:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
              <li>192.168.0.1</li>
              <li>192.168.1.1</li>
              <li>192.168.1.254</li>
            </ul>

            <p className="mt-4 leading-7 text-slate-300">
              One of these should load a login page for your router. If
              none of them work, look at the underside or back of the
              router itself for a sticker showing its address (sometimes
              called the &quot;Default Gateway&quot; or &quot;Router
              IP&quot;), or search online for your router&apos;s exact
              model number plus &quot;default IP address&quot;.
            </p>

            <p className="mt-4 leading-7 text-slate-300">
              You&apos;ll then need a username and password to log in.
              These are very often printed on the same sticker on the
              router. If your internet provider set the router up for you
              and you&apos;ve never changed this, they should also be able
              to tell you what it is.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              3. Find the port forwarding settings
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Every router brand organises its settings menu a little
              differently, so there&apos;s no single set of clicks that
              works everywhere -- but look through the menu for a page
              named something like:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
              <li>Port Forwarding</li>
              <li>Virtual Server</li>
              <li>NAT</li>
              <li>Port Mapping</li>
            </ul>

            <p className="mt-4 leading-7 text-slate-300">
              It&apos;s often tucked under a broader menu called{" "}
              <strong className="text-white">Advanced</strong>,{" "}
              <strong className="text-white">WAN</strong>, or{" "}
              <strong className="text-white">Firewall</strong>. If you
              genuinely can&apos;t find it, searching online for your
              router&apos;s exact model number plus &quot;port
              forwarding&quot; usually turns up a page with a screenshot of
              exactly where it lives on your specific router.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              4. Create the forwarding rule
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Once you&apos;re on the port forwarding page, look for a
              button like &quot;Add&quot; or &quot;New Rule&quot;. The exact
              fields vary by router, but you&apos;ll normally be asked to
              fill in something like this (values below are just an
              example -- use your own server&apos;s IP address and your
              game&apos;s actual port, which you can find in its setup guide
              on this site):
            </p>

            <div className="mt-5 overflow-hidden rounded-lg border border-slate-700">
              <div className="grid grid-cols-2 border-b border-slate-700 bg-slate-900 px-4 py-3">
                <span className="font-medium">Setting</span>
                <span className="font-medium">Example</span>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-800 px-4 py-3 text-slate-300">
                <span>Internal IP (or Device)</span>
                <span>192.168.1.50</span>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-800 px-4 py-3 text-slate-300">
                <span>External port</span>
                <span>8211</span>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-800 px-4 py-3 text-slate-300">
                <span>Internal port</span>
                <span>8211</span>
              </div>

              <div className="grid grid-cols-2 px-4 py-3 text-slate-300">
                <span>Protocol</span>
                <span>UDP</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              The example above is for a default Palworld dedicated server
              -- other games use different port numbers and sometimes a
              different protocol (TCP instead of UDP, or occasionally
              both). The external and internal port are almost always the
              same number unless you have a specific reason to make them
              different. &quot;Internal IP&quot; is the local IP address you
              found in step 1. Save the rule once you&apos;ve filled
              everything in -- some routers apply it immediately, others
              ask you to restart the router first.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              5. Allow the server through the firewall
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Port forwarding on the router only gets traffic to your home
              network -- the server machine&apos;s own firewall (built
              into its operating system) still has to let that traffic
              through too, or it&apos;ll be silently blocked at the very
              last step.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Windows
            </h3>

            <p className="mt-2 leading-7 text-slate-300">
              The first time you run your game server, Windows may show a
              pop-up asking whether to allow it through the firewall --
              click <strong className="text-white">Allow access</strong>{" "}
              if you see it. If you missed that pop-up or it never
              appeared, add the rule manually:
            </p>

            <ol className="mt-3 list-decimal space-y-2 pl-6 text-slate-300">
              <li>
                Click Start, type <code>Windows Defender Firewall</code>,
                and open it.
              </li>
              <li>
                On the left, click{" "}
                <strong className="text-white">
                  Allow an app or feature through Windows Defender Firewall
                </strong>
                .
              </li>
              <li>
                Click <strong className="text-white">Change settings</strong>{" "}
                (you may need administrator permission), then{" "}
                <strong className="text-white">Allow another app</strong>{" "}
                and browse to your server&apos;s program file. Tick both{" "}
                <strong className="text-white">Private</strong> and{" "}
                <strong className="text-white">Public</strong>, then click{" "}
                <strong className="text-white">OK</strong>.
              </li>
            </ol>

            <h3 className="mt-6 text-lg font-semibold">
              Linux with UFW
            </h3>

            <p className="mt-2 text-slate-300">
              For a Palworld server using the default UDP port, run:
            </p>

            <CodeBlock className="mt-3" code="sudo ufw allow 8211/udp" />

            <h3 className="mt-6 text-lg font-semibold">
              Linux with firewalld
            </h3>

            <CodeBlock
              className="mt-3"
              code={`sudo firewall-cmd --permanent --add-port=8211/udp
sudo firewall-cmd --reload`}
            />
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              6. Keep the server&apos;s local IP stable
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Home routers usually hand out local IP addresses
              automatically and can occasionally give your server a
              different one later (after a reboot, for example) --
              if that happens, your forwarding rule from step 4 will
              silently keep pointing at the old, now-wrong address.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              To prevent that, set up a{" "}
              <strong className="text-white">DHCP reservation</strong> --
              a router setting that permanently ties your server&apos;s
              local IP address to it specifically, so it never changes.
              See the{" "}
              <Link
                href="/guides/static-ip"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                static IP address guide
              </Link>{" "}
              for the full walkthrough.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              7. Test that it worked
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Before asking a friend to try connecting, it&apos;s worth
              confirming the port is actually open from outside your
              network -- that way, if something&apos;s still wrong, you
              find out immediately instead of after a confusing back-and-
              forth with someone else.
            </p>

            <ol className="mt-3 list-decimal space-y-2 pl-6 text-slate-300">
              <li>Make sure your game server is running.</li>
              <li>
                Search online for a free &quot;open port checker&quot; tool
                (well-known examples include{" "}
                <a
                  href="https://www.yougetsignal.com/tools/open-ports/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  yougetsignal.com
                </a>{" "}
                and{" "}
                <a
                  href="https://canyouseeme.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline"
                >
                  canyouseeme.org
                </a>
                ). These check TCP ports; not all of them support checking
                UDP ports, which many game servers use -- if your game
                needs a UDP port and the checker only supports TCP, this
                step won&apos;t give a reliable answer, and the real test
                becomes simply having a friend try to connect.
              </li>
              <li>
                Enter your game&apos;s port number and run the check. A
                result saying the port is &quot;open&quot; means everything
                above worked.
              </li>
            </ol>

            <p className="mt-3 leading-7 text-slate-300">
              If it says the port is closed, don&apos;t worry -- that&apos;s
              common and usually fixable. See the troubleshooting box below.
            </p>
          </section>

          <section className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-6">
            <h2 className="text-xl font-semibold">
              Still not working?
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              This trips a lot of people up, and it&apos;s rarely because
              you did something wrong -- some internet providers use a
              system called Carrier-Grade NAT (CGNAT), where several
              customers&apos; homes share one public internet address. If your
              connection is behind CGNAT, port forwarding{" "}
              <strong className="text-white">cannot work</strong>, no
              matter how correctly you set it up, because your router
              doesn&apos;t have a public address of its own to receive
              traffic on in the first place.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              You may need to ask your internet provider for a public IPv4
              address (sometimes free, sometimes a small monthly add-on),
              or use an alternative networking solution.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              For a full, plain-language walkthrough of this and other
              common connection problems -- including an interactive tool
              that asks a few questions and tells you the most likely
              cause -- see the{" "}
              <Link
                href="/troubleshooting"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                connection troubleshooting guide
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
