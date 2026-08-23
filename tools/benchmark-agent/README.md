# Benchmark Agent

A local command-line tool that watches a running dedicated game server
process over time and writes a structured JSON file of its resource usage.
It exists to build up a real, first-hand dataset of "what does hosting
this game actually cost in CPU/RAM/disk/network" -- the kind of thing
`Can My Machine Run It?` on the main site currently has to estimate from
official docs and community guidance, not from real measurements.

This is a **local-only tool**. It doesn't upload anything, doesn't talk to
the SelfServr website, and doesn't require an account. It's a
standalone Node/TypeScript CLI that happens to live in this repo -- see
"Future design" below for why.

## Quick start

1. **Start the actual game server you want to measure, the normal way you
   already do.** This tool watches an *already-running* process -- it
   doesn't launch the server for you.
2. From the repo root, run:

   ```bash
   npm run benchmark -- --game valheim --duration 60
   ```

   Swap `valheim` for `palworld`, `minecraft`, `terraria`, or
   `project-zomboid`.
3. It finds the process, then prints one line per sample:

   ```
   [00:00:15] players=? | RAM=2140 MB | CPU=36% core | upload=1.8 Mbps
   ```

   Press `Ctrl+C` any time to stop early -- it still writes what it
   collected.
4. When it finishes (or you stop it), the result lands in
   `data/benchmarks/valheim-2026-08-23T181500.json`.

For a real benchmark you care about, also pass `--players`, `--activity`
and `--description` -- see "Running it" below for why those matter and a
more complete example.

## What this measures

At every sample interval (default every 5 seconds):

- **Process**: CPU usage (two ways -- see below), working set (RAM),
  private memory, thread count.
- **System**: overall machine CPU%, used/available RAM.
- **Disk**: the monitored process's read/write bytes per second
  (best-effort -- see limitations).
- **Network**: system-wide receive/transmit bytes per second (not
  per-process -- see limitations).
- **Players**: whatever you tell it with `--players` (see below).

When the run finishes, it computes min/max/mean/median/p95 for the main
numeric metrics and writes everything -- metadata, summary, *and* every
raw sample -- to one JSON file.

## What this does NOT measure or prove

- **It does not count players for you.** Nothing here talks to the game.
  Player count is whatever you type in with `--players`, for this run only.
  If players join or leave mid-run, the recorded count doesn't change --
  re-run the benchmark for each player-count scenario you care about.
- **It does not know what players were doing.** A "4 players" benchmark
  where everyone stood AFK in the spawn area and a "4 players" benchmark
  where everyone was exploring, building, and fighting are wildly
  different server loads, and this tool has no way to tell them apart
  automatically. That's exactly why `--activity` and `--description`
  exist -- use them, and be honest about it. **20 idle clients connected
  to a server is not equivalent to 20 actively-playing players** -- idle
  clients mostly just hold open a network connection, while active
  players trigger world simulation, entity updates, chunk/area loading,
  pathfinding, physics, and so on, which is where most of the real CPU
  and RAM cost usually comes from. A benchmark run with idle clients will
  systematically *understate* real-world requirements.
- **It does not measure per-process network usage**, only system-wide.
  If other things on your machine are using the network during a run,
  that shows up in the numbers too. Run benchmarks on a machine that's
  otherwise idle if you want clean network figures.
- **Disk IO is best-effort.** Windows doesn't make reliable per-process
  disk IO trivial to get; if it can't be obtained for a given sample, the
  field is `null` rather than guessed.
- **It's one machine's numbers.** CPU model, storage type, background
  load, and Windows version all affect these results. Treat a single
  benchmark run as one data point, not a universal truth for "how much
  RAM does Valheim need."

## Installation

Nothing extra to install -- it reuses `tsx`, which is already a dev
dependency of this repo.

## Running it

```bash
npm run benchmark -- --game valheim --duration 60
```

More complete example:

```bash
npm run benchmark -- \
  --game valheim \
  --process valheim_server \
  --players 4 \
  --duration 120 \
  --interval 5 \
  --activity normal \
  --description "4 players exploring different biomes and fighting mobs"
```

### Options

| Flag | Description | Default |
| --- | --- | --- |
| `--game <id>` | Game profile id (required) -- see `game-profiles.ts` | -- |
| `--process <name>` | Override which process to monitor | game profile's default |
| `--duration <minutes>` | How long to run | `60` |
| `--interval <seconds>` | Seconds between samples | `5` |
| `--players <n>` | Manual player count, recorded on every sample | none (`null`) |
| `--output <dir>` | Override the output directory | `data/benchmarks/` |
| `--notes <text>` | Free-text notes | none |
| `--world <name>` | World/save name | none |
| `--mods <true\|false>` | Whether mods are enabled | `unknown` |
| `--server-version <v>` | Game/server version string | none |
| `--activity <level>` | `idle` \| `light` \| `normal` \| `heavy` | `unknown` |
| `--description <text>` | e.g. `"4 players exploring different biomes"` | none |

Available game ids today: `valheim`, `palworld`, `minecraft`, `terraria`,
`project-zomboid`.

If `--process` is omitted, the game profile's default process name(s) are
used. Minecraft and Project Zomboid run as plain Java processes, so if you
have other Java programs open, pass `--process` explicitly to avoid
ambiguity (see `game-profiles.ts` for the exact reasoning).

Each sample takes roughly 1-2 seconds to actually collect on Windows (real
PowerShell/performance-counter overhead, not something worth adding more
complexity to shave down further) -- avoid setting `--interval` below 3
seconds, or sampling will reliably fall behind real time. The tool warns
you if you do.

### If it can't find the process

You'll get a clear message plus, if anything running looks close, a
suggestion:

```
Could not find Valheim server process.
Expected one of:
  - valheim_server
  - valheim_server.exe

Possible matches:
  - valheim_server_headless.exe

If one of these is right, re-run with --process <name>.
```

No benchmark file is written in this case -- it exits without pretending
to have measured anything.

### Player count

For now, player count is **always manual** -- pass `--players 4` and that
number is stamped onto every sample for this run. There's no automatic
detection yet. Player-count collection is behind a `PlayerCountProvider`
interface (`player-count.ts`) specifically so RCON, Minecraft's query
protocol, log-tail parsing, etc. can be added later as drop-in
implementations without changing anything else.

### Stopping early

Press `Ctrl+C`. The benchmark stops, writes whatever it collected so far,
and marks the result `status: "cancelled"`.

If the monitored process exits on its own (crash, manual stop, whatever),
the benchmark stops automatically and writes a partial result marked
`status: "server-exited"` -- it never keeps "measuring" a process that's no
longer running.

## How CPU percentages are calculated

Every sample records **two** CPU numbers for the process, because "CPU
usage" is ambiguous on a multi-core machine:

- **`cpuPercentSingleCore`** -- 100% means the process is fully using one
  logical core's worth of CPU time. This can go above 100% for a
  multi-threaded process (e.g. 350% ≈ using 3.5 cores' worth of time).
- **`cpuPercentMachine`** -- the same usage, normalized to the whole
  machine's total capacity, so it never exceeds 100%. On an 8-thread
  machine, a process using one core fully shows up as 12.5% here.

Both are derived from the same underlying measurement: Windows tracks each
process's *cumulative* CPU time consumed since it started
(`TotalProcessorTime`). Two consecutive samples give a CPU-time delta and
a wall-clock delta; dividing one by the other gives `cpuPercentSingleCore`
directly, and dividing that by the machine's logical thread count gives
`cpuPercentMachine`. Because this needs two points in time, **the very
first sample of a run always has `null` CPU values** -- there's nothing to
diff against yet.

System-wide CPU% uses the same delta technique, just against Node's own
`os.cpus()` tick counters instead of a specific process's time.

## Interpreting results

- Look at `summary` first -- mean tells you typical load, `p95`/`max` tell
  you what to actually provision for (you don't want a server that's fine
  on average but falls over during a raid or a big build).
- Cross-reference `metadata.test` (player count, activity level,
  description, mods) before comparing two benchmark files -- a 4-player
  "heavy" run and a 4-player "idle" run aren't the same thing, even though
  both say "4 players."
- `samples` is the full raw time series if you want to plot it yourself or
  look for spikes the summary stats smooth over.

## Output

Files are written to `data/benchmarks/<game>-<timestamp>.json`, e.g.:

```
data/benchmarks/valheim-2026-08-23T181500.json
```

This directory is **gitignored** (only `data/benchmarks/.gitkeep` is
tracked) -- your benchmark results stay local unless you decide to share
them.

## Future design

The eventual goal is something like:

```
benchmark agent -> JSON result -> SelfServr API -> benchmark database -> aggregated recommendations
```

None of the right-hand side exists yet, and this tool deliberately doesn't
build toward it directly (no upload code, no accounts, no auth). What it
does do is keep the output format friendly to that future: every file
carries a `schemaVersion` (currently `1`) precisely so a future ingestion
API can tell which shape of file it's looking at, and the metadata is
structured (game/server/machine/test as separate objects) rather than a
flat pile of fields, which should make it straightforward to map onto a
database schema later without a rewrite.

## Windows only (for now)

Everything platform-specific lives in `powershell.ts` and the
`windows/*.ps1` scripts, and only those two things would need Linux
equivalents to support that platform later -- `process-monitor.ts`,
`system-monitor.ts`'s CPU/RAM math, `network-monitor.ts`,
`output.ts`, and `index.ts`'s orchestration are all platform-agnostic.
