import type { PlayerCountProvider, PlayerCountResult } from "./types";

// Manual player count -- the only provider implemented for v1. Always
// returns the same fixed count supplied via --players on the command line
// (or null/"unknown" if it wasn't supplied).
//
// Future providers (Minecraft's query protocol, RCON, log-tail parsing,
// game-specific APIs) should implement the same PlayerCountProvider
// interface so index.ts doesn't need to change to add them -- just wire up
// whichever provider matches the game profile's playerCountMethod instead
// of always constructing a ManualPlayerCountProvider.
export class ManualPlayerCountProvider implements PlayerCountProvider {
    private readonly count: number | null;

    constructor(count: number | null) {
        this.count = count;
    }

    async getPlayerCount(): Promise<PlayerCountResult> {
        return {
            count: this.count,
            source: this.count === null ? "unknown" : "manual",
        };
    }
}
