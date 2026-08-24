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
    "A free step-by-step guide to forwarding ports on your router so players outside your home network can connect to your dedicated game server.",
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
          Port forwarding allows players outside your home network to connect
          to a game server running on your PC.
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              1. Find your server&apos;s local IP address
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Your router needs to know which machine on your home network should receive
              incoming game-server traffic.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Windows
            </h3>

            <p className="mt-2 text-slate-300">
              Open Command Prompt or PowerShell and run:
            </p>

            <CodeBlock className="mt-3" code="ipconfig" />

            <p className="mt-3 text-slate-300">
              Find the IPv4 address for the network adapter you&apos;re using.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Linux
            </h3>

            <p className="mt-2 text-slate-300">
              Open a terminal and run:
            </p>

            <CodeBlock className="mt-3" code="ip addr" />

            <p className="mt-3 text-slate-300">
              Look for the private IPv4 address assigned to your active Ethernet or Wi-Fi
              interface, commonly something like 192.168.x.x or 10.x.x.x.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. Open your router&apos;s admin page
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Open your browser and enter your router&apos;s local address.
              Common examples include:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
              <li>192.168.0.1</li>
              <li>192.168.1.1</li>
              <li>192.168.1.254</li>
            </ul>

            <p className="mt-4 leading-7 text-slate-300">
              You&apos;ll need the administrator username and password for your
              router. These may be printed on the router or supplied by your
              internet provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              3. Find the port forwarding settings
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Different router manufacturers use different names. Look for
              something such as:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
              <li>Port Forwarding</li>
              <li>Virtual Server</li>
              <li>NAT</li>
              <li>Port Mapping</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              4. Create the forwarding rule
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              You&apos;ll normally need to enter:
            </p>

            <div className="mt-5 overflow-hidden rounded-lg border border-slate-700">
              <div className="grid grid-cols-2 border-b border-slate-700 bg-slate-900 px-4 py-3">
                <span className="font-medium">Setting</span>
                <span className="font-medium">Example</span>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-800 px-4 py-3 text-slate-300">
                <span>Internal IP</span>
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
              The example above is suitable for a default Palworld dedicated
              server. Other games may use different ports and protocols.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              5. Allow the server through the firewall
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Port forwarding on the router is only one part of the connection. The
              server machine&apos;s own firewall must also allow the required traffic.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Windows
            </h3>

            <p className="mt-2 text-slate-300">
              Allow the dedicated server application or create an inbound firewall rule
              for the game&apos;s required port.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Linux with UFW
            </h3>

            <p className="mt-2 text-slate-300">
              For a Palworld server using the default UDP port:
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
              Your router may eventually assign your server a different local
              IP address, which would break the forwarding rule.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              If possible, configure a DHCP reservation in your router so the
              server always receives the same local IP address.
            </p>
          </section>

          <section className="rounded-lg border border-amber-700/50 bg-amber-950/20 p-6">
            <h2 className="text-xl font-semibold">
              What if port forwarding still doesn&apos;t work?
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Some internet providers use Carrier-Grade NAT (CGNAT). If this
              applies to your connection, normal port forwarding may not work
              because your router does not have its own publicly reachable IPv4
              address.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              You may need to ask your internet provider for a public IPv4
              address or use an alternative networking solution.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              See the{" "}
              <Link
                href="/troubleshooting"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                connection troubleshooting guide
              </Link>{" "}
              for a full walkthrough of CGNAT and other common connection
              problems.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}