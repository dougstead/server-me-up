export default function PortForwardingGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">
          Server Me Up Guide
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

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
              ipconfig
            </pre>

            <p className="mt-3 text-slate-300">
              Find the IPv4 address for the network adapter you&apos;re using.
            </p>

            <h3 className="mt-6 text-lg font-semibold">
              Linux
            </h3>

            <p className="mt-2 text-slate-300">
              Open a terminal and run:
            </p>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
              ip addr
            </pre>

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

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
              sudo ufw allow 8211/udp
            </pre>

            <h3 className="mt-6 text-lg font-semibold">
              Linux with firewalld
            </h3>

            <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-200">
              {`sudo firewall-cmd --permanent --add-port=8211/udp
sudo firewall-cmd --reload`}
            </pre>
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
          </section>
        </div>
      </div>
    </main>
  );
}