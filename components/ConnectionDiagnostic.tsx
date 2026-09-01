"use client";

import { useState } from "react";
import Link from "next/link";
import { games, type GameServerRequirements } from "@/lib/games";
import { configTemplates } from "@/lib/config-templates";
import { article } from "@/lib/text";

// Alphabetical for the picker below -- `games` itself stays in its original
// order since the games[0] default just below relies on that.
const gamesSortedByName = [...games].sort((a, b) => a.name.localeCompare(b.name));

// A small, linear branching diagnostic for "why can't people connect to my
// dedicated server". Deliberately implemented as an explicit step chain
// (not a generic rule engine) -- the decision tree is fixed and small
// enough that a switch-based walk is easier to read, extend and debug than
// a data-driven engine would be here. Game-specific facts (ports) come from
// lib/games.ts rather than being hardcoded, so adding a game elsewhere in
// the codebase automatically flows through to this tool.
//
// Deliberately does NOT try to detect the user's public IP from the
// browser (unreliable, and this project doesn't have a privacy-conscious
// mechanism for it) -- the CGNAT/public-IP step instead explains how to
// compare two numbers the user looks up themselves.

type Answer = "yes" | "no" | "unsure";

type StepId =
    | "game"
    | "process-starts"
    | "localhost-connects"
    | "lan-connects"
    | "wan-connects"
    | "port-configured"
    | "port-forwarded"
    | "wan-ip-matches"
    | "firewall-allows"
    | "version-matches";

type Diagnosis = {
    cause: string;
    explanation: string;
    nextSteps: { label: string; href: string }[];
};

function diagnosisFor(
    step: Exclude<StepId, "game">,
    answer: Answer,
    game: GameServerRequirements,
): Diagnosis | null {
    const setupHref = `/guides/games/${game.id}`;
    const hasConfigGenerator = Boolean(configTemplates[game.id]);
    const configHref = `/config-generator/${game.id}`;

    if (step === "process-starts" && answer === "no") {
        return {
            cause: "Server process / configuration issue",
            explanation:
                "None of the networking checks below matter yet -- if the server process itself doesn't start, there's nothing listening for anyone to connect to. This is almost always a config file syntax error, a missing dependency (like a Java runtime), or a port already in use by something else on the machine.",
            nextSteps: [
                { label: `${game.name} setup guide`, href: setupHref },
                { label: "Configuration errors", href: "/troubleshooting#configuration-errors" },
                ...(hasConfigGenerator
                    ? [{ label: `${game.name} config generator`, href: configHref }]
                    : []),
            ],
        };
    }

    if (step === "localhost-connects" && answer === "no") {
        return {
            cause: "Server process / configuration issue",
            explanation:
                "The process runs but nothing can connect to it even from the same machine -- check that it's actually bound to the port you expect (a config typo can bind it to the wrong one) and that you're connecting to the right port yourself.",
            nextSteps: [
                { label: `${game.name} setup guide`, href: setupHref },
                { label: "Configuration errors", href: "/troubleshooting#configuration-errors" },
            ],
        };
    }

    if (step === "lan-connects" && answer === "no") {
        return {
            cause: "Local firewall issue",
            explanation:
                "It works from the server machine itself but not from another device on the same network -- LAN traffic never touches your router's internet-facing side, so this points at the server machine's own firewall (Windows Firewall, ufw, firewalld) blocking the connection, not port forwarding.",
            nextSteps: [
                { label: "Firewall issues", href: "/troubleshooting#firewall" },
                { label: "Port forwarding guide", href: "/guides/port-forwarding" },
            ],
        };
    }

    if (step === "wan-connects" && answer === "yes") {
        return {
            cause: "No problem found",
            explanation:
                "Localhost, LAN and an outside connection all worked -- that's a fully working, publicly reachable server. If specific players still can't connect, the most likely explanations left are a version mismatch on their end, or they're using an old/incorrect IP address.",
            nextSteps: [
                { label: "Server version mismatch", href: "/troubleshooting#version-mismatch" },
                { label: "Incorrect public IP", href: "/troubleshooting#wrong-public-ip" },
            ],
        };
    }

    if (step === "port-configured" && (answer === "no" || answer === "unsure")) {
        return {
            cause: "Wrong or missing port configuration",
            explanation: `Double-check the port the server is actually configured to use against ${game.name}'s required ports, and make sure that's the exact port you're forwarding and sharing with players.`,
            nextSteps: [
                { label: `${game.name} setup guide (required ports)`, href: setupHref },
                ...(hasConfigGenerator
                    ? [{ label: `${game.name} config generator`, href: configHref }]
                    : []),
            ],
        };
    }

    if (step === "port-forwarded" && (answer === "no" || answer === "unsure")) {
        return {
            cause: "Port forwarding / wrong internal IP",
            explanation:
                "The router needs a forwarding rule pointing the game's port at the server machine's current local IP address. If that address has changed since you set up the rule (routers reassign it by default), the rule is now silently pointing at the wrong device.",
            nextSteps: [
                { label: "Port forwarding guide", href: "/guides/port-forwarding" },
                { label: "Static IP guide", href: "/guides/static-ip" },
            ],
        };
    }

    if (step === "wan-ip-matches" && answer !== "yes") {
        return {
            cause: answer === "no" ? "CGNAT or public-IP mismatch" : "Needs a manual check",
            explanation:
                answer === "no"
                    ? "If your router's own internet address genuinely doesn't match your public IP address (the one Google shows when you search \"what is my ip\"), you're very likely behind something called Carrier-Grade NAT (CGNAT) -- several homes sharing one address. Port forwarding cannot work in that case, no matter how correctly it's set up, since your router doesn't have a public address of its own for anyone to reach. Ask your internet provider about a static public IPv4 address, or consider a tunnelling/relay service instead."
                    : "On your router's admin page, find its status/WAN page -- it'll show an internet-facing address there. Separately, on a device connected to that same network, search \"what is my ip\" on Google -- it shows the answer directly, no clicking needed. If those two numbers don't match, you're likely behind CGNAT.",
            nextSteps: [
                { label: "What is CGNAT?", href: "/troubleshooting#cgnat" },
                { label: "Port forwarding guide", href: "/guides/port-forwarding" },
            ],
        };
    }

    if (step === "firewall-allows" && answer !== "yes") {
        return {
            cause: "Firewall issue",
            explanation:
                "With everything else checking out, an inbound firewall rule -- on the server machine, or occasionally a router/ISP-level firewall -- is the most likely remaining blocker for external connections specifically.",
            nextSteps: [{ label: "Firewall issues", href: "/troubleshooting#firewall" }],
        };
    }

    if (step === "version-matches" && answer === "no") {
        return {
            cause: "Server/client version mismatch",
            explanation:
                "The server and connecting players need to be running the same game version (and, for some games, the same branch). Update the server to match, or confirm players are on the version the server expects.",
            nextSteps: [
                { label: "Installing SteamCMD", href: "/guides/steamcmd" },
                { label: "Server version mismatch", href: "/troubleshooting#version-mismatch" },
            ],
        };
    }

    if (step === "version-matches") {
        return {
            cause: "Common causes ruled out",
            explanation:
                "Every common cause here checks out: the process starts, you can connect from the server itself, from your own network, and from outside it, the port and forwarding rule are correct, your public IP matches what you've shared, the firewall allows it, and versions match. If specific players still can't connect, it's likely something on their end (their own network, firewall or internet provider) rather than your server.",
            nextSteps: [{ label: "Full troubleshooting guide", href: "/troubleshooting" }],
        };
    }

    return null;
}

const QUESTIONS: Record<
    Exclude<StepId, "game">,
    { prompt: string; help?: string; options?: Answer[] }
> = {
    "process-starts": {
        prompt: "Can the server process start successfully, with no errors in its console/log?",
    },
    "localhost-connects": {
        prompt: "Can you connect to it from the server machine itself, using \"localhost\" or 127.0.0.1 as the address?",
    },
    "lan-connects": {
        prompt: "Can another device on the same home network connect (like your phone on the same Wi-Fi)?",
    },
    "wan-connects": {
        prompt: "Can someone outside your home network connect (e.g. a friend elsewhere, or your phone on mobile data with Wi-Fi off)?",
    },
    "port-configured": {
        prompt: "Is the server actually configured to use the game's correct port number?",
        options: ["yes", "no", "unsure"],
    },
    "port-forwarded": {
        prompt: "Is that port forwarded on your router to the server machine's current local IP address?",
        options: ["yes", "no", "unsure"],
    },
    "wan-ip-matches": {
        prompt: "Does your router's own internet address match your public IP address?",
        help: "Find your router's address on its status/WAN page. Find your public IP by searching \"what is my ip\" on Google from a device on that same network -- it shows the answer directly, no need to click anything. Look both up now rather than guessing.",
        options: ["yes", "no", "unsure"],
    },
    "firewall-allows": {
        prompt: "Have you confirmed the server machine's own firewall allows this port?",
        options: ["yes", "no", "unsure"],
    },
    "version-matches": {
        prompt: "Are the server and the connecting players' game clients on the same version?",
        options: ["yes", "no", "unsure"],
    },
};

function nextStep(current: StepId): StepId | null {
    const order: StepId[] = [
        "game",
        "process-starts",
        "localhost-connects",
        "lan-connects",
        "wan-connects",
        "port-configured",
        "port-forwarded",
        "wan-ip-matches",
        "firewall-allows",
        "version-matches",
    ];
    const index = order.indexOf(current);
    return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
}

export default function ConnectionDiagnostic() {
    const [selectedGameId, setSelectedGameId] = useState(games[0].id);
    const [step, setStep] = useState<StepId>("game");
    const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);

    const game = games.find((candidate) => candidate.id === selectedGameId) ?? games[0];

    function handleAnswer(answer: Answer) {
        if (step === "game") {
            return;
        }

        const result = diagnosisFor(step, answer, game);

        if (result) {
            setDiagnosis(result);
            return;
        }

        const next = nextStep(step);

        if (next) {
            setStep(next);
        }
    }

    function handleStartOver() {
        setStep("game");
        setDiagnosis(null);
    }

    if (diagnosis) {
        return (
            <div className="rounded-lg border border-sky-800 bg-sky-950/20 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-400">
                    Most likely cause
                </h3>

                <p className="mt-2 text-xl font-semibold text-white">{diagnosis.cause}</p>

                <p className="mt-3 leading-7 text-slate-300">{diagnosis.explanation}</p>

                {diagnosis.nextSteps.length > 0 && (
                    <div className="mt-5">
                        <p className="text-sm font-semibold text-slate-300">Recommended next checks</p>
                        <div className="mt-2 flex flex-wrap gap-3">
                            {diagnosis.nextSteps.map((checkLink) => (
                                <Link
                                    key={checkLink.href}
                                    href={checkLink.href}
                                    className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-sky-400 hover:border-sky-500"
                                >
                                    {checkLink.label} →
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleStartOver}
                    className="mt-6 text-sm font-semibold text-slate-400 hover:text-white"
                >
                    ← Start over
                </button>
            </div>
        );
    }

    if (step === "game") {
        return (
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
                <label htmlFor="diagnostic-game" className="block text-sm font-medium text-slate-200">
                    Which game are you hosting?
                </label>

                <select
                    id="diagnostic-game"
                    value={selectedGameId}
                    onChange={(event) => setSelectedGameId(event.target.value)}
                    className="mt-2 w-full max-w-sm rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500"
                >
                    {gamesSortedByName.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                            {candidate.name}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={() => setStep("process-starts")}
                    className="mt-5 inline-block rounded-lg bg-sky-500 px-5 py-3 font-semibold text-white hover:bg-sky-400"
                >
                    Start diagnostic →
                </button>
            </div>
        );
    }

    const question = QUESTIONS[step];
    const options = question.options ?? (["yes", "no"] as Answer[]);
    const optionLabels: Record<Answer, string> = {
        yes: "Yes",
        no: "No",
        unsure: "Not sure",
    };

    return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Diagnosing {article(game.name)} {game.name} server
            </p>

            <p className="mt-3 text-lg font-medium text-white">{question.prompt}</p>

            {question.help && (
                <p className="mt-2 text-sm leading-6 text-slate-400">{question.help}</p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
                {options.map((answer) => (
                    <button
                        key={answer}
                        type="button"
                        onClick={() => handleAnswer(answer)}
                        className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-white hover:border-sky-500 hover:bg-slate-800"
                    >
                        {optionLabels[answer]}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={handleStartOver}
                className="mt-6 text-sm font-semibold text-slate-400 hover:text-white"
            >
                ← Start over
            </button>
        </div>
    );
}
