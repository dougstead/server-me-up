import Link from "next/link";
import type { Metadata } from "next";
import CodeBlock from "@/components/CodeBlock";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { pageMetadata } from "@/lib/metadata";
import { howToSchema } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({
  title: "Setting a Static Local IP Address",
  description:
    "Free guide: how to give your server a fixed local IP address with a DHCP reservation, so your port forwarding rules keep working after a router restart.",
  path: "/guides/static-ip",
});

const HOW_TO_STEPS = [
  {
    name: "Find your server's MAC address",
    text: "Run ipconfig /all (Windows) or ip link (Linux) on the server machine and note its network adapter's physical/MAC address.",
  },
  {
    name: "Set a DHCP reservation on your router",
    text: "In the router's admin page, find DHCP Reservation, Address Reservation, Static DHCP or IP & MAC Binding, then bind the MAC address from step 1 to a chosen IP.",
  },
];

export default function StaticIpGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <JsonLd
          data={howToSchema({
            name: "How to Set a Static Local IP Address",
            description:
              "Give your server a fixed local IP address with a router DHCP reservation, so port forwarding rules keep working after a router restart.",
            steps: HOW_TO_STEPS,
          })}
        />

        <Breadcrumbs
          items={[
            { label: "Guides", href: "/guides" },
            { label: "Static IP Address" },
          ]}
        />

        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          SelfServr Guide
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Setting a Static Local IP Address
        </h1>

        <p className="mt-4 text-lg leading-8 text-slate-300">
          Port forwarding rules point at your server&apos;s local IP address
          (e.g. 192.168.1.50). By default, most home routers hand out that
          address via DHCP and can reassign it later -- if that happens,
          your forwarding rule silently starts pointing at the wrong
          machine. Do this before setting up{" "}
          <Link
            href="/guides/port-forwarding"
            className="text-sky-400 hover:text-sky-300 hover:underline"
          >
            port forwarding
          </Link>
          .
        </p>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              1. Find your server&apos;s MAC address
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              A DHCP reservation ties a specific device to a specific IP
              using its network adapter&apos;s MAC address (not the IP
              itself, which is what you&apos;re trying to fix).
            </p>

            <h3 className="mt-6 text-lg font-semibold">Windows</h3>

            <CodeBlock className="mt-3" code="ipconfig /all" />

            <p className="mt-3 text-slate-300">
              Look for &quot;Physical Address&quot; under the network
              adapter you&apos;re using.
            </p>

            <h3 className="mt-6 text-lg font-semibold">Linux</h3>

            <CodeBlock className="mt-3" code="ip link" />

            <p className="mt-3 text-slate-300">
              Look for the <code>link/ether</code> value under your active
              interface.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. Set a DHCP reservation on your router (recommended)
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              This is the safest approach: your server still gets its
              address from the router automatically, but the router always
              hands it the same one. Open your router&apos;s admin page
              (see the{" "}
              <Link
                href="/guides/port-forwarding"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                port forwarding guide
              </Link>{" "}
              for how to find it) and look for a section named something
              like:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
              <li>DHCP Reservation</li>
              <li>Address Reservation</li>
              <li>Static DHCP / Static Leases</li>
              <li>IP &amp; MAC Binding</li>
            </ul>

            <p className="mt-4 leading-7 text-slate-300">
              Enter the MAC address from step 1 and choose an IP address to
              bind it to. Picking your server&apos;s current address is
              usually fine; some routers prefer an address near the edge of
              the DHCP range (e.g. .200-.250) to keep it clearly separate
              from addresses handed out to other devices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Alternative: a static IP on the machine itself
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              You can also configure the IP directly on the server&apos;s
              network adapter instead of through the router. This works,
              but it&apos;s easier to misconfigure -- if you pick an address
              that&apos;s still inside the router&apos;s DHCP pool, another
              device could get handed the same address later and cause a
              conflict. A DHCP reservation avoids this because the router
              itself keeps the address out of the pool for you.
            </p>

            <p className="mt-3 leading-7 text-slate-300">
              If you still want to do it this way: on Windows, open the
              network adapter&apos;s properties, select &quot;Internet
              Protocol Version 4 (TCP/IPv4)&quot;, and enter the IP address,
              subnet mask, default gateway (your router&apos;s address) and
              DNS servers manually. On Linux, this is typically done through
              your distribution&apos;s network manager (e.g.{" "}
              <code>nmcli</code>, Netplan, or{" "}
              <code>/etc/network/interfaces</code>) -- the exact steps vary
              enough between distributions that it&apos;s worth following
              your distribution&apos;s own documentation.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
