import type { GameBenchmarkProfile } from "./types";

// Initial set of game profiles. Only "manual" player counting is wired up
// for any of these yet (see player-count.ts) -- playerCountMethod exists
// so a future provider knows which method to try per game without index.ts
// needing to change.
export const gameProfiles: GameBenchmarkProfile[] = [
    {
        id: "valheim",
        name: "Valheim",
        processNames: ["valheim_server", "valheim_server.exe"],
        defaultPorts: [2456, 2457],
        playerCountMethod: "manual",
    },
    {
        id: "palworld",
        name: "Palworld",
        processNames: [
            "PalServer",
            "PalServer.exe",
            "PalServer-Win64-Shipping-Cmd",
            "PalServer-Win64-Shipping-Cmd.exe",
        ],
        defaultPorts: [8211],
        playerCountMethod: "manual",
    },
    {
        id: "minecraft",
        name: "Minecraft",
        // The Java Edition dedicated server just runs as a plain JVM
        // process -- "java"/"javaw" will match ANY Java program running on
        // the machine, not only this one. If you have other Java apps
        // open, use --process to disambiguate, or check which PID is
        // actually the server first (e.g. via Task Manager) and pass its
        // exact process name.
        processNames: ["java", "java.exe", "javaw", "javaw.exe"],
        defaultPorts: [25565],
        playerCountMethod: "manual",
    },
    {
        id: "terraria",
        name: "Terraria",
        processNames: ["TerrariaServer", "TerrariaServer.exe"],
        defaultPorts: [7777],
        playerCountMethod: "manual",
    },
    {
        id: "project-zomboid",
        name: "Project Zomboid",
        // Zomboid's Windows dedicated server launches via StartServer64.bat
        // into a Java process -- same ambiguity note as Minecraft applies.
        processNames: [
            "ProjectZomboid64",
            "ProjectZomboid64.exe",
            "java",
            "java.exe",
        ],
        defaultPorts: [16261, 16262],
        playerCountMethod: "manual",
    },
];

export function findGameProfile(
    id: string,
): GameBenchmarkProfile | undefined {
    return gameProfiles.find((profile) => profile.id === id);
}
