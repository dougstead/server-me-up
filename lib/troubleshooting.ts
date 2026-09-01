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
// question -> short answer -> longer explanation -> (optional) concrete
// numbered steps structure. Written for someone with very little networking
// background: define a term the first time it's used, prefer short
// sentences and concrete instructions ("click X") over abstract ones, and
// use `steps` rather than a dense paragraph wherever there's a genuine
// sequence of things to try.

export type TroubleshootingTopic = {
  id: string;
  question: string;
  shortAnswer: string;
  explanation: string;
  // An ordered list of concrete things to try/check, rendered as a numbered
  // list under the explanation. Optional -- only for topics where there's
  // a real "try this, then this" sequence, not every topic needs one.
  steps?: string[];
  // Optional guide hrefs to surface as "see also" links under this topic.
  relatedGuides?: { label: string; href: string }[];
};

export const troubleshootingTopics: TroubleshootingTopic[] = [
  {
    id: "works-locally-not-for-friends",
    question: "The server works when I connect myself, but friends can't. Why?",
    shortAnswer:
      "This almost always means the problem is between your router and the wider internet, not the server itself -- connecting from your own server machine, or from another device on your home Wi-Fi/network, doesn't go anywhere near your router's internet connection, so it can work even when nothing outside your home can reach the server.",
    explanation:
      "The fastest way to narrow this down is to test from progressively further away, in order, and see exactly where it stops working.",
    steps: [
      "From the server machine itself, try connecting using \"localhost\" or 127.0.0.1 as the address. If this fails, the server process itself isn't working properly -- see \"The server won't start\" below, rather than anything about networking.",
      "From a different device on the same home network (like your phone on the same Wi-Fi), try connecting using the server's local IP address (the one starting 192.168. or 10., found using ipconfig or ip addr). If this fails but step 1 worked, your server machine's own firewall is very likely blocking it -- see the firewall entry below.",
      "Now try from somewhere genuinely outside your home network -- ask a friend, or turn off Wi-Fi on your phone and use mobile data instead. If steps 1 and 2 worked but this fails, the problem is specifically getting traffic from the internet to your router: port forwarding, your router's firewall, or CGNAT (all covered below).",
    ],
    relatedGuides: [
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "not-in-server-browser",
    question: "Why doesn't my server show up in the public server browser?",
    shortAnswer:
      "Most games only list a server in their in-game \"server browser\" (the list you scroll through to find a public server) after it successfully registers itself with that game's own master list online -- and that registration usually travels over the exact same port your players connect through. So this is very often the same port-forwarding problem as above, just showing up differently.",
    explanation:
      "Before assuming it's a networking problem, double-check the server is actually configured to be public in the first place -- some games have a setting like \"public\", \"advertise\", or \"list on master server\" that defaults to off, including in a few of the config generators on this site.",
    relatedGuides: [
      { label: "Config generators", href: "/config-generator" },
    ],
  },
  {
    id: "connection-timed-out",
    question: 'What does "connection timed out" mean?',
    shortAnswer:
      "It means the game tried to connect and simply got no reply at all -- not a rejection, silence. That specific kind of failure almost always means the port isn't actually reachable from outside your home: it's not forwarded, it's forwarded to the wrong device, or something is blocking it along the way.",
    explanation:
      "This is a useful clue on its own: a timeout is different from the game telling you the server is full, or that your game version doesn't match. Those come back quickly with a specific message, because the connection actually reached the server and the server responded. A timeout means the connection never got that far -- your router (or the server's own firewall) is simply not passing the traffic through at all.",
    relatedGuides: [
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "port-appears-closed",
    question: "An online port checker says my port is closed. What now?",
    shortAnswer:
      "A \"closed\" result can mean one of three different things, and a port checker can't tell you which -- so check them in this order rather than guessing.",
    explanation:
      "Working through these from the server outward saves time, since each one rules out a whole category of cause.",
    steps: [
      "Confirm the server is actually running right now. It sounds obvious, but this is the single most common cause -- a crashed or not-yet-started server has nothing listening on the port at all.",
      "On the server machine, check the game's console/log output to confirm it's actually using the port you expect -- a typo in the config (or an outdated port in your router's forwarding rule) is very easy to miss.",
      "Re-check the forwarding rule on your router points at the server's current local IP address, not an old one -- see \"local IP address changed\" further down.",
      "Confirm the server machine's own firewall allows the port -- see the firewall entry below.",
    ],
    relatedGuides: [
      { label: "Static IP guide", href: "/guides/static-ip" },
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "firewall",
    question: "Could my firewall be blocking the server?",
    shortAnswer:
      "Yes, quite possibly -- and this catches people out because it fails silently. Port forwarding on the router only gets traffic as far as your server machine; that machine's own firewall (Windows Firewall on Windows, or ufw/firewalld on Linux) still has to let it in, and when it blocks something, nothing shows up in the server's own logs to explain why.",
    explanation:
      "On Windows, the first time a server program runs, Windows sometimes shows a popup asking whether to allow it through the firewall. If that popup was accidentally dismissed, or you clicked \"Cancel\" instead of \"Allow access\", the program stays blocked with no further warning. The port forwarding guide's firewall section (linked below) walks through adding the rule manually if that's happened, for both Windows and Linux.",
    relatedGuides: [
      { label: "Port forwarding guide (firewall section)", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "port-forwarding-problems",
    question: "I've set up port forwarding, but it still isn't working. What am I missing?",
    shortAnswer:
      "The two most common mistakes, in order of how often they happen: using the wrong protocol (many games need UDP specifically, not TCP -- picking the wrong one in the router's form is an easy slip), and the server's local IP address quietly changing after the forwarding rule was created.",
    explanation:
      "A router hands out local IP addresses automatically by default, and can occasionally hand your server a different one later -- for example after a power cut or a router restart. When that happens, your forwarding rule keeps pointing at the address the server used to have, and nothing about it looks broken until you check.",
    steps: [
      "Double-check the protocol (TCP or UDP) in the router's rule matches exactly what the game needs -- check the specific game's setup guide on this site for its exact required ports and protocol.",
      "Confirm the internal IP address in the rule still matches the server's current local IP address (found using ipconfig or ip addr) -- if it's changed, update the rule, then set up a DHCP reservation so it can't happen again.",
      "Check the external port and internal port in the rule are the same number, unless you deliberately set them differently for a specific reason (most routers let you forward an external port to a different internal one, which is rarely what you actually want here).",
    ],
    relatedGuides: [
      { label: "Port forwarding guide", href: "/guides/port-forwarding" },
      { label: "Static IP guide", href: "/guides/static-ip" },
    ],
  },
  {
    id: "cgnat",
    question: "What is CGNAT, and how do I know if I'm affected?",
    shortAnswer:
      "Carrier-Grade NAT (CGNAT) is something some internet providers do where several different customers' homes all share one public internet address between them. If that applies to your connection, port forwarding cannot work no matter how correctly you set it up -- there's no way to point incoming traffic at your specific router, because your router doesn't have its own public address to receive it on in the first place.",
    explanation:
      "There's a simple two-number comparison that tells you for certain whether you're affected.",
    steps: [
      "Find your router's own internet-facing address: log into your router's admin page (see the port forwarding guide) and look for a status page, often labelled \"Internet\", \"WAN\" or \"Status\" -- it'll show an IP address there.",
      "Find your public address as seen from the internet: on a device connected to that same home network, search \"what is my ip\" on Google -- it shows the answer directly at the top of the results, no need to click anything.",
      "Compare the two numbers. If they're different, you're very likely behind CGNAT -- this is especially certain if the router's own address (from step 1) starts with anything from 100.64 through 100.127.",
    ],
    relatedGuides: [
      { label: "Port forwarding guide (CGNAT section)", href: "/guides/port-forwarding" },
    ],
  },
  {
    id: "wrong-public-ip",
    question: "Are players connecting to the wrong IP address?",
    shortAnswer:
      "Most home internet connections have their public IP address changed by the provider from time to time -- it's not something you did wrong, it just happens periodically (often after the router restarts). If that's happened since you last gave your address to players, they're trying to reach an address that's no longer yours, and it'll fail even though your server and its settings are completely fine.",
    explanation:
      "Search \"what is my ip\" on Google from a device on your home network to see your current public address, and compare it to what you last shared. If they don't match, share the new one -- or, to stop this from being a recurring annoyance, set up Dynamic DNS once so you (and your players) never have to notice or update it manually again.",
    relatedGuides: [
      { label: "Dynamic DNS guide", href: "/guides/dynamic-dns" },
    ],
  },
  {
    id: "steamcmd-failures",
    question: "SteamCMD is failing to update or install the server. What should I check?",
    shortAnswer:
      "Most SteamCMD failures come down to one of three things: a download that got interrupted partway through, an anonymous login being rejected because that particular game needs an account that actually owns it, or a permissions/disk-space problem in the folder you're installing to.",
    explanation:
      "If typing login anonymous gets rejected, that game specifically requires a Steam account that owns it -- log in with login <your-steam-username> instead and enter your password when prompted. If one particular file keeps failing partway through downloading, running the exact same install/update command again usually just resumes where it left off, rather than starting over.",
    relatedGuides: [
      { label: "Installing SteamCMD", href: "/guides/steamcmd" },
    ],
  },
  {
    id: "version-mismatch",
    question: "Why does the game say my server version doesn't match?",
    shortAnswer:
      "This means your server and your game client are running different versions of the game -- most commonly because your game updated itself automatically (as Steam usually does) but the server, which updates separately, didn't.",
    explanation:
      "Run the server's update command again (the same one from its setup guide on this site) to bring it up to date with your current game version. A few games intentionally keep their server on an older or \"beta\" branch on purpose -- if that's the case for your game, make sure players are opted into the same branch, not just the newest version.",
    relatedGuides: [
      { label: "Installing SteamCMD", href: "/guides/steamcmd" },
    ],
  },
  {
    id: "configuration-errors",
    question: "The server won't start, or crashes right after I edit its config",
    shortAnswer:
      "This is almost always a small typo in the config file itself -- a missing quotation mark, an extra or missing comma, or a number typed where the file expects text (or the other way round) -- rather than a setting that's genuinely invalid.",
    explanation:
      "Check the server's own console/log output first -- most dedicated servers will tell you exactly which line or setting it choked on, which turns a guessing game into a two-minute fix. If you edited the file by hand, comparing it side-by-side against a freshly generated default copy is a fast way to spot what changed. Using one of this site's config generators instead of editing the file by hand avoids this entire category of mistake, since it always produces a correctly-formatted file for that specific game.",
    relatedGuides: [
      { label: "Config generators", href: "/config-generator" },
    ],
  },
];
