# Maintaining AutoTrimps Plus

> **Start with the hub's `MAINTAINING.md`** (repo `LeGilly.github.io`, or
> https://github.com/LeGilly/LeGilly.github.io/blob/main/MAINTAINING.md): how the owner works, versions and
> releases, and how tests run. This file only covers what's specific to AutoTrimps Plus.
>
> Like Frozen Cookies Plus this is **not a website**: it's a local mod for Trimps on Steam, so the
> legilly.com site rules (content security policy, shared bar and themes, GitHub Pages) don't apply.

Also read: [`docs/GAME_NOTES.md`](docs/GAME_NOTES.md) (game facts verified in the code),
[`docs/AT_GAP_ANALYSIS.md`](docs/AT_GAP_ANALYSIS.md) (what AutoTrimps leaves to the player, and so what this
mod has to do) and [`TODO.md`](TODO.md) (where work stands). [`docs/HUB_BRIEF.md`](docs/HUB_BRIEF.md)
describes the project for the hub.

## How the owner works on AT+

The same as on Frozen Cookies Plus (its `MAINTAINING.md`, "How the owner works on FC+"), in short:

- **Folder:** `Documents\GitHub\autotrimps-plus`. He commits and pushes with GitHub Desktop; never do it for
  him. Write the files into the folder, read them back and diff.
- **Every change he will commit is a new version:** `version` in `mods.js`, a `CHANGELOG.md` entry (a test
  checks they match), README when behaviour changes, run the whole suite, then a one-line commit summary
  (`0.2.0 : …`).
- **Answer from the game code** (`.game/`) and AutoTrimps' code (`vendor/autotrimps/`), not from memory, and
  say what you checked. Bigger or debatable changes: options with numbers, then wait for his go.
- **Goal:** completely hands-off, from a new save to the end, then every achievement. Universe 1 first
  (decided 2026-11-25); Universe 2 later.

## Decisions

- **2026-11-25 — AutoTrimps is copied into the repo (option A)**, unmodified, at a known commit, and updated
  by hand with `tools/update-at.mjs`. Rejected: downloading it at build time (needs internet to build, its code
  isn't in the folder to compare) and loading it live from SadAugust's site at every launch (an AutoTrimps
  change could silently break a hands-off run, and the mod would run code nobody reviewed).
- **Base fork: SadAugust/AutoTrimps**, the one still maintained (Zorn192's stopped in 2024).
- **Files of our own are prefixed `atp_`** (like `fcp_` in FC+), the repo is `autotrimps-plus`.
- **2026-11-25 — 0.2.0 choices (owner):** AT+ is **on at install** (switch at the top of AutoTrimps' Core tab);
  normal runs use the **best helium challenge**, with **Dailies** run as they come; a managed setting changed by
  hand is **put back** (to change one, switch AT+ off). Visual settings (themes, AutoTrimps' Display tab, game
  options) are never managed: the owner changes those freely.
- **Run order (0.2.0, reviewed with the owner against player recommendations):** unlock runs once the highest
  zone is 10 past their completion zone > Dailies (one expiring today first, even before an unlock run) > the
  best helium challenge by **total helium earned**, the players' thresholds (Steam discussion, see GAME_NOTES),
  plus its zone reached; Lead also needs Headstart I. Watch is left out (Lead pays more at the same zone).
  Toxicity runs without stack farming for now (AutoTrimps' Toxicity settings are a later step).
- **Masteries (0.2.0):** the owner's community list (screenshot) for tiers 1–9, the "Full Mastery / Dark
  Essence" guide's Helium order for tier 10 (its tiers 7–9 match the list). Headstart I–II and Hyperspeed I–II
  are rushed (`ATP.MASTERY_RUSH`), as players buy them early.
- **No outside requests.** AutoTrimps would fetch jQuery, select2, Quiaaaa's graphs and the void map clarifier
  from other sites; the first two are bundled (`vendor/lib`, the exact versions AutoTrimps asks for), the
  last two are skipped. A test fails if anything outside localhost is requested.

## Layout

| Path | What it is |
|---|---|
| `mods.js` | The loader, shipped as `Trimps\mods\mods.js`. Holds the version. Loads the libraries, AutoTrimps, `atp_boot.js`, in that order |
| `src/atp_boot.js` | Runs right after `AutoTrimps2.js`: marks AutoTrimps' outside scripts as loaded so it skips them, then loads our files (`ATP_BOOT.scripts` in mods.js, in order) once AutoTrimps is running, and sets `ATP.ready` after the last |
| `src/atp_core.js` | The `ATP` object: the **switch** (`atpEnabled`, an AutoTrimps setting of our own, saved with theirs), `ATP.isActive()` (on, and in Universe 1), `ATP.manage(id, value)` (keeps a setting at a value, outlines it; multi-choice values by label), `ATP.addTask(name, ms, fn)` (runs only while active; `ATP.runAll()` for tests), `ATP.state` (our saved state, `localStorage.atpState`), `ATP.setSetting` / `ATP.getSetting`, `ATP.say` (game log, held during a time warp), `ATP.log` |
| `src/atp_settings.js` | `ATP.BASELINE`: the AutoTrimps recommendations AT+ keeps (what was left out and why is at the top), and `ATP.progressSettings()` for the ones that follow progress |
| `src/atp_planner.js` | The run planner: `ATP.UNLOCK_RUNS`, `ATP.HELIUM_RUNS`, `ATP.plan()`; writes `autoPortal`, `heliumChallenge`, `heliumHourChallenge`, `dailyPortalStart`, `heliumHrDontPortalBefore` |
| `src/atp_masteries.js` | `ATP.MASTERY_ORDER` (players' order), `ATP.MASTERY_RUSH`, `ATP.nextMastery()` and the buyer (the game's own `completeTalentPurchase`) |
| `vendor/autotrimps/` | AutoTrimps, SadAugust's fork, **unmodified**. `SOURCE.txt` gives the commit and a checksum per file |
| `vendor/lib/` | jQuery 3.7.1 and select2 4.1.0-rc.0, with their licences |
| `tools/build.mjs` | Builds `Steam/mods/` (as it goes into the game's `mods` folder) and `dist/autotrimps-plus-X.Y.Z.zip` |
| `tools/get-game.mjs` | Downloads the Trimps web version (5.10.1) into `.game/` for the tests |
| `tools/update-at.mjs` | Replaces `vendor/autotrimps/` with another AutoTrimps commit |
| `tests/` | Playwright tests (below) |
| `.github/workflows/` | `tests.yml` (every push), `release.yml` (a release when the version is new) |
| `docs/at-settings-catalogue.csv` | Every AutoTrimps setting with its defaults and AutoTrimps' own recommendation (2026-11-25, v7.2.8) |

`Steam/`, `dist/` and `.game/` are build output and ignored by git.

## How the mod loads (Steam)

- The Steam app is NW.js. Its `index.html` loads the game (`combo.js`), then `mods/mods.js` with a plain
  script tag, then `mods/mods.css`. Mods are local files next to it: our folder is `mods/autotrimps-plus/`.
- `mods.js` works out that folder from its own address, so it also works in the tests (served from
  `/Steam/mods/`).
- AutoTrimps finds its own folder from the address of `AutoTrimps2.js`, so it loads its modules from
  `autotrimps-plus/at/` with no change to its code.
- Like AutoTrimps' own `mods.js`, ours sets `game.global.timeWarpLimit = 0` until AutoTrimps is running
  (AutoTrimps restores it), so no offline time is spent without it.

## Rules for the code

- **Don't edit AutoTrimps' files.** Change what it does through its settings (`ATP.setSetting`, which only
  writes when the value changes) or by wrapping its global functions from `atp_` files. Updating AutoTrimps
  then stays `tools/update-at.mjs` plus a check of what we wrap.
- **Two bots, one game:** before adding an action, check whether AutoTrimps already does it, and if so drive
  it through its setting instead of doing it a second time.
- The mod never downloads code. Keep it that way.
- **How AutoTrimps portals** (modules/portal.js), which the planner relies on: "Helium Challenges" portals as
  soon as no challenge is active, into `heliumChallenge` (`'Off'` = no challenge; `'None'` would never portal);
  "Helium Per Hour" portals when helium per hour drops by the buffer, after voids with "Portal: After Voids",
  into `heliumHourChallenge` (`'None'` = no challenge), never before `heliumHrDontPortalBefore`; with
  `dailyPortalStart` on, it portals into the oldest open Daily instead, if any. The setting must describe how
  the **current** run ends and the challenge the **next** one, so the planner treats the challenge being run
  as done when choosing the next.
- New AutoTrimps settings to manage: add them to `ATP.BASELINE` with the label of the option (not its number);
  `settings.spec.mjs` fails if an id or a label doesn't exist in AutoTrimps.
- New file in `src/`: add it to `ATP_BOOT.scripts` in `mods.js`, after `atp_core.js`.

## Releasing

- Version: `version` in `mods.js`, shown in the game log at start. A test checks it matches the newest
  `CHANGELOG.md` entry and the built files.
- Push to `main` → "Tests" runs → if it passes, "Release" builds the mod and creates release `vX.Y.Z` with
  `autotrimps-plus-X.Y.Z.zip` attached, its notes taken from the changelog. A push without a new version
  creates nothing.
- The owner installs by unzipping the release into `…\steamapps\common\Trimps\mods\` (replacing `mods.js` and
  the `autotrimps-plus` folder).

## Testing

How tests run (GitHub, locally, keeping them current) is in the hub's `MAINTAINING.md`, "Tests". Here
`npm test` first builds the mod and downloads the game (`tools/get-game.mjs`: github.com/Trimps/Trimps.github.io,
commit `b9edb1d` = 5.10.1, the Steam version), then loads `Steam/mods/mods.js` into it as the Steam app does.
Every request outside localhost is refused, and noted once the mod has started.

- `load.spec.mjs`: AutoTrimps and AT+ start from the mod folder with every module loaded and nothing fetched
  from the internet; the log line with both versions, held back during a time warp; `ATP.setSetting`.
- `planner.spec.mjs`: the next run for built game states (new save, Discipline at 30 helium and zone 30,
  unlock order, Decay and Devastation waiting until they can be completed, every helium threshold and
  Headstart I for Lead, the don't-portal-before zone, Dailies and expiring ones, the 2-hour stall),
  and three end-to-end portals through AutoTrimps' own `autoPortalCheck()`: into the next unlock run, into a
  run without challenge, into a Daily.
- `settings.spec.mjs`: every managed id and option label exists and is applied; the switch (first in the Core
  tab, on by default, remembered after a reload); a hand change put back, or kept with the switch off;
  waiting in Universe 2; the first 15 Masteries bought (rush and order), every Mastery in the list.
- `play.spec.mjs`: on a new save AutoTrimps traps Trimps, hires workers and fights within 3 game minutes.
- `vendor.spec.mjs`: AutoTrimps' files match the checksums in `vendor/autotrimps/SOURCE.txt`.
- `version.spec.mjs`: version, changelog and built files agree.

The tests can't run the Steam app itself; after a release, check once in the game.

Run locally: `CHROME_PATH=/usr/bin/google-chrome npm test` (a few seconds at 0.1.0).

- **Game time in tests:** `loadGame(page, { clock: true })` installs Playwright's fake clock, then
  `page.clock.runFor(ms)` runs the game forward. On a new save that's about 0.4 s of real time per game minute
  (an hour in ~25 s, measured 2026-11-25), slowing to ~1 s per game minute around zone 15–20. A new save
  needs over 8 game hours (7+ minutes real) to reach zone 22, before its first portal: too slow for the
  suite, so tests build game states instead (`setState` in planner.spec.mjs).
- `play.spec.mjs` uses it: AutoTrimps gets a new save going within 3 game minutes.

## Updating

- **AutoTrimps:** `node tools/update-at.mjs <full commit id>` (from github.com/SadAugust/AutoTrimps/commits/main).
  Look at the diff in GitHub Desktop: new or renamed settings matter (we set them by id), and so do functions
  we wrap. If AutoTrimps adds a new outside script to `installedExternal`, decide whether to bundle it.
  Run the tests, then a new version.
- **New game version:** point `GAME_COMMIT` in `tools/get-game.mjs` at it, check GAME_NOTES.md against the
  new code, run the tests. AutoTrimps' README says which game patch it's up to date with.
