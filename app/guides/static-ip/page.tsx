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
    "A free, beginner-friendly guide to giving your server a fixed local IP address with a DHCP reservation, so your port forwarding rules keep working after a router restart.",
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
  {
    name: "Confirm it worked",
    text: "Restart the router, then check the server's IP address again -- it should be the same one you reserved.",
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
          When you set up{" "}
          <Link
            href="/guides/port-forwarding"
            className="text-sky-400 hover:text-sky-300 hover:underline"
          >
            port forwarding
          </Link>
          , the rule you create points at your server&apos;s local IP
          address (something like 192.168.1.50). The problem is that most
          home routers hand out local IP addresses automatically and can
          quietly give your server a <em>different</em> one later -- after
          a power cut, for example, or just a router restart. When that
          happens, your forwarding rule keeps pointing at the old address,
          and nothing about it looks broken until you notice players can no
          longer connect. Doing this guide once, before setting up port
          forwarding, prevents that from ever happening.
        </p>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            A few terms used in this guide
          </p>

          <dl className="mt-3 space-y-3 text-sm leading-6 text-slate-300">
            <div>
              <dt className="font-semibold text-white">DHCP</dt>
              <dd>
                The system your router uses to automatically hand out local
                IP addresses to every device that joins your network. It&apos;s
                convenient, but it&apos;s also why addresses can change.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">MAC address</dt>
              <dd>
                A unique ID number built into a device&apos;s network
                hardware that never changes, unlike its IP address. If an IP
                address is like a phone number that can be reassigned, a MAC
                address is like the phone&apos;s serial number -- permanent,
                and specific to that one device.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-white">DHCP reservation</dt>
              <dd>
                A rule you add on the router that says &quot;always give{" "}
                <em>this</em> MAC address <em>this</em> IP address&quot;.
                The server still gets its address automatically via DHCP,
                same as always -- it just always gets the same one.
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 rounded-lg border border-sky-900 bg-sky-950/20 p-5 text-sm leading-6 text-slate-300">
          <p className="font-semibold text-white">Before you start, you&apos;ll need:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Access to the machine your game server runs on.</li>
            <li>
              The admin username and password for your router -- see step 2
              of the{" "}
              <Link
                href="/guides/port-forwarding"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                port forwarding guide
              </Link>{" "}
              if you don&apos;t know it or can&apos;t find your router&apos;s
              admin page.
            </li>
          </ul>
        </div>

        <div className="mt-12 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold">
              1. Find your server&apos;s MAC address
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              A DHCP reservation is set up using the server&apos;s MAC
              address, not its current IP address (since the whole point is
              that the IP address is the thing that keeps changing).
            </p>

            <h3 className="mt-6 text-lg font-semibold">Windows</h3>

            <ol className="mt-2 list-decimal space-y-2 pl-6 text-slate-300">
              <li>
                Click the Start button (or press the Windows key), type{" "}
                <code>cmd</code>, and press Enter to open Command Prompt.
              </li>
              <li>
                Type <code>ipconfig /all</code> and press Enter.
              </li>
            </ol>

            <CodeBlock className="mt-3" code="ipconfig /all" />

            <p className="mt-3 text-slate-300">
              You&apos;ll see a block of text for each network connection.
              Find the one you&apos;re actually using (usually{" "}
              <strong className="text-white">Ethernet adapter</strong> for a
              cable connection, or{" "}
              <strong className="text-white">Wireless LAN adapter</strong>{" "}
              for Wi-Fi), and look for the line labelled{" "}
              <strong className="text-white">Physical Address</strong>. It&apos;ll
              look something like <code>00-1A-2B-3C-4D-5E</code>. Write that
              down exactly as shown -- you&apos;ll need it in step 2.
            </p>

            <h3 className="mt-6 text-lg font-semibold">Linux</h3>

            <p className="mt-2 text-slate-300">Open a terminal and run:</p>

            <CodeBlock className="mt-3" code="ip link" />

            <p className="mt-3 text-slate-300">
              Look for the <code>link/ether</code> value under your active
              network interface -- that&apos;s the MAC address, in the same
              format as above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              2. Set a DHCP reservation on your router (recommended)
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              This is the safest and easiest option for most people -- the
              server keeps getting its address automatically, exactly as
              before, it just always gets the same one from now on. Log
              into your router&apos;s admin page (see the{" "}
              <Link
                href="/guides/port-forwarding"
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                port forwarding guide
              </Link>{" "}
              if you&apos;re not sure how), and look through its menu for a
              page named something like:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-300">
              <li>DHCP Reservation</li>
              <li>Address Reservation</li>
              <li>Static DHCP / Static Leases</li>
              <li>IP &amp; MAC Binding</li>
            </ul>

            <p className="mt-4 leading-7 text-slate-300">
              It&apos;s often on the same page (or right next to) the DHCP
              settings, sometimes under a broader &quot;LAN&quot; or
              &quot;Network&quot; menu.
            </p>

            <p className="mt-4 leading-7 text-slate-300">
              Once you find it, click something like &quot;Add&quot; and
              fill in:
            </p>

            <div className="mt-5 overflow-hidden rounded-lg border border-slate-700">
              <div className="grid grid-cols-2 border-b border-slate-700 bg-slate-900 px-4 py-3">
                <span className="font-medium">Setting</span>
                <span className="font-medium">What to enter</span>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-800 px-4 py-3 text-slate-300">
                <span>MAC address</span>
                <span>The address you wrote down in step 1</span>
              </div>

              <div className="grid grid-cols-2 px-4 py-3 text-slate-300">
                <span>IP address</span>
                <span>Your server&apos;s current address is usually fine</span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              If you&apos;d rather pick a fresh address instead of reusing
              the server&apos;s current one, choose something near the
              upper end of your router&apos;s DHCP range (e.g. .200 through
              .250) -- this keeps it visibly separate from addresses the
              router hands out to other devices like phones and laptops.
              Save the rule, then move on to step 3 to make sure it actually
              took effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">3. Confirm it worked</h2>

            <p className="mt-3 leading-7 text-slate-300">
              Restart your router (unplug it for about 10 seconds, then
              plug it back in), wait for it to fully reconnect, then check
              your server&apos;s IP address again using the same command
              from step 1 (<code>ipconfig</code> on Windows, or{" "}
              <code>ip addr</code> on Linux). If it shows the same address
              you reserved, it worked -- that address is now permanently
              tied to your server and safe to use in a port forwarding
              rule.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold">
              Alternative: setting the IP address directly on the server
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              It&apos;s also possible to type a fixed IP address directly
              into the server&apos;s own network settings, instead of
              reserving one on the router. This works, but it&apos;s easier
              to get wrong -- if you pick an address that&apos;s still
              inside the range the router hands out automatically, another
              device could later be given that exact same address, causing
              a conflict where neither device works properly. A DHCP
              reservation (step 2 above) avoids this entirely, because the
              router itself keeps that address set aside for your server
              and never hands it to anything else. For that reason, this
              alternative is only worth using if step 2 genuinely isn&apos;t
              an option for you.
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
