// Shared content model for the troubleshooting section. Deliberately NOT
// game-specific -- we don't have evidence of how any individual game's
// networking stack fails differently from any other, so inventing
// per-game error behaviour would be exactly the kind of unsupported claim
// this project avoids elsewhere. What IS game-specific (required ports,
// the SteamCMD app ID) already lives in lib/games.ts / lib/game-setup.ts,
// and the troubleshooting page pulls that in directly via a game picker
// rather than duplicating it here -- see components/TroubleshootingGameReference.tsx.
//
// One entry per problem category, each following the same
// question -> short answer -> longer explanation structure used elsewhere
// on the site (the can-my-pc-run-it FAQ, the game setup guide FAQ).

export type TroubleshootingTopic = {
  id: string;
  question: string;
  shortAnswer: string;
  explanation: string;
  // Optional guide hrefs to surface as "see also" links under this topic.
  relatedGuides?: { label: string; href: string }[];
};

export const troubleshootingTopics: TroubleshootingTopic[] = [
  {
    id: "works-locally-not-for-friends",
    question: "The server works on localhost, but friends can't connect. Why?",
    shortAnswer:
      "This is almost always a networking problem between your router and the wider internet, not a problem with the server software itself -- connecting from the same machine (localhost) or the same network (LAN) skips the router entirely, so it can succeed even when nothing outside your network can reach the server.",
    explanation:
      "Work through it in order: can another device on your own network connect using your local IP address? If yes, the server itself is fine and the problem is specifically in getting traffic from the internet to your router (port forwarding, firewall, or CGNAT -- see below). If even LAN devices can't connect, check the server machine's own firewall first, since that blocks local traffic too.",
    relatedGuides: [
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "not-in-server-browser",
    question: "Why doesn't my server show up in the public server browser?",
    shortAnswer:
      "Most games' in-game server browsers only list servers that have successfully registered with that game's master server list, which itself usually needs the same open port your players connect through -- so this is often the same underlying port-forwarding problem, not a separate one.",
    explanation:
      "Some games also need public listing explicitly enabled in the server config (an option like \"public\", \"advertise\" or \"list on master server\"), which defaults to off in a few config generators here. Check that setting first, then treat it as a connectivity problem if it's already on.",
    relatedGuides: [
      { label: "Config generators", href: "/config-generator" },
    ],
  },
  {
    id: "connection-timed-out",
    question: 'What does "connection timed out" mean?',
    shortAnswer:
      "A timeout means the connection attempt got no response at all -- as opposed to an explicit rejection -- which almost always points to a port that isn't actually reachable from outside your network: not forwarded, forwarded to the wrong internal IP, or blocked by a firewall along the way.",
    explanation:
      "A timeout is different from the game rejecting you for a version mismatch or a full server -- those come back quickly with a specific error. A timeout is silence, which is the router (or the server's firewall) simply not passing the traffic through at all.",
    relatedGuides: [
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "port-appears-closed",
    question: "An online port checker says my port is closed. What now?",
    shortAnswer:
      "Confirm the server is actually running and bound to that port first, then check the forwarding rule points at the server's current local IP (not an old one), and that the local firewall allows it -- in that order, since a port checker can't tell you which of the three is wrong.",
    explanation:
      "A closed result means one of: nothing is listening on that port on the server machine, the router isn't forwarding it there, or a firewall (router-level or on the machine itself) is blocking it. Test from the server machine that the process is actually listening on the port before touching the router at all.",
    relatedGuides: [
      { label: "Static IP guide", href: "/guides/static-ip" },
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "firewall",
    question: "Could my firewall be blocking the server?",
    shortAnswer:
      "Yes -- port forwarding on the router only gets traffic to the server machine; the machine's own firewall (Windows Firewall, ufw, firewalld) still has to allow it in, and a default-deny firewall blocks it silently with no error in the server's own logs.",
    explanation:
      "Windows sometimes prompts to allow a new listening application through the firewall the first time it runs -- if that prompt was dismissed or missed, add a manual inbound rule for the game's port/protocol instead of relying on the prompt reappearing.",
    relatedGuides: [
      { label: "Port forwarding guide (firewall section)", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "port-forwarding-problems",
    question: "I've set up port forwarding, but it still isn't working. What am I missing?",
    shortAnswer:
      "The two most common mistakes are forwarding to the wrong protocol (UDP vs TCP -- many games need UDP, not TCP) and forwarding to a local IP address that changed after the rule was created.",
    explanation:
      "Give the server machine a DHCP reservation so its local IP never changes and silently breaks the rule, double-check the protocol against the game's actual required ports, and confirm the external and internal port numbers match what the server is actually using (some routers let you forward an external port to a different internal one, which is rarely what you want here).",
    relatedGuides: [
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
      { label: "Static IP guide", href: "/guides/static-ip" },
    ],
  },
  {
    id: "cgnat",
    question: "What is CGNAT, and how do I know if I'm affected?",
    shortAnswer:
      "Carrier-Grade NAT (CGNAT) means your ISP shares one public IPv4 address across many customers, so your router doesn't have a publicly reachable address of its own -- and port forwarding physically cannot work, no matter how correctly you configure it, because there's no public address pointing at your router in the first place.",
    explanation:
      "The clearest sign is that your router's WAN/internet IP address (shown on its status page) doesn't match your public IP address (shown by a \"what's my IP\" site from a device on that network) -- if they're different, especially if the router's address starts with 100.64-127.x.x, you're very likely behind CGNAT. Some ISPs will provide a static public IPv4 address on request (sometimes for a fee); the alternative is a tunnelling/relay service that doesn't depend on your own public IP.",
    relatedGuides: [
      { label: "Port forwarding guide (CGNAT section)", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "wrong-public-ip",
    question: "Are players connecting to the wrong IP address?",
    shortAnswer:
      "If your public IP address has changed since you last shared it -- which most home internet connections do periodically -- anyone using the old address will fail to connect even though everything else is configured correctly.",
    explanation:
      "Compare your router's current WAN IP (on its status page) against what you last gave players. If they don't match, either share the current one or, better, set up Dynamic DNS once so you never have to notice or share it manually again.",
    relatedGuides: [
      { label: "Dynamic DNS guide", href: "/guides/dynamic-dns" },
    ],
  },
  {
    id: "steamcmd-failures",
    question: "SteamCMD is failing to update or install the server. What should I check?",
    shortAnswer:
      "Most SteamCMD failures are one of: a bad or interrupted download (rerun the same app_update command -- it resumes), an anonymous login being rejected by a game that requires an account that owns it, or a disk-space/permissions problem in the install directory.",
    explanation:
      "If login anonymous is rejected, log in with a Steam account that owns the base game instead. If a specific file keeps failing to validate, delete the appworkshop/depot cache under steamapps/downloading and rerun app_update ... validate from scratch rather than partially patching over a corrupted download.",
    relatedGuides: [
      { label: "Installing SteamCMD", href: "/guides/steamcmd" },
    ],
  },
  {
    id: "version-mismatch",
    question: "Why does the game say my server version doesn't match?",
    shortAnswer:
      "The server and the client are running different game versions -- most commonly because the server hasn't been updated since the game client auto-updated, or the server is intentionally pinned to an older/beta branch the client isn't on.",
    explanation:
      "Rerun the server's update command (the same app_update/direct-download step from its setup guide) to bring it in line with the current client version. If the server intentionally needs to stay on a specific branch (some games have a separate beta branch for the actively-played version), make sure connecting players are on the same branch too.",
    relatedGuides: [
      { label: "Installing SteamCMD", href: "/guides/steamcmd" },
    ],
  },
  {
    id: "configuration-errors",
    question: "The server won't start, or crashes on startup, after editing its config",
    shortAnswer:
      "This is almost always a syntax mistake in the config file itself -- a missing quote, a stray comma, or a value in the wrong format for that file (numbers written as text, or vice versa) -- rather than a genuinely invalid setting.",
    explanation:
      "Check the server's own startup log/console output first; most dedicated servers report exactly which line or key failed to parse. If you hand-edited a generated file, compare it against a freshly regenerated default to spot what changed. Using a config generator instead of hand-editing avoids this whole category of error, since it produces syntactically valid output for that specific file format.",
    relatedGuides: [
      { label: "Config generators", href: "/config-generator" },
    ],
  },
];
