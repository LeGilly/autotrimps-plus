# AutoTrimps Plus

An automation mod for **Trimps on Steam (5.10.1)**. It runs **AutoTrimps** (SadAugust's fork, v7.2.8, kept
unmodified inside) and adds what AutoTrimps leaves to the player, aiming for a game that plays itself from a
new save onwards: no settings to fill in, and settings that keep themselves up to date as the game progresses.

**Status: 0.2, Universe 1.** AT+ picks every run, buys Masteries and keeps AutoTrimps' settings at their
recommended values. Universe 2, heirlooms, nature, Spire TD and C² runs come later (`docs/AT_GAP_ANALYSIS.md`).

## Install (Steam, local mod)

Download `autotrimps-plus-<version>.zip` from this repository's **Releases** page.

1. In Steam: right-click Trimps → Manage → Browse local files, then open the `mods` folder
   (on a default install: `C:\Program Files (x86)\Steam\steamapps\common\Trimps\mods\`).
2. Unzip the release there. It contains `mods.js` and an `autotrimps-plus` folder, and **replaces the
   `mods.js` that's already there**. That file is how the Steam version runs mods, so AutoTrimps Plus takes
   the place of whatever it loaded before (AutoTrimps from the internet, the Mod Loader…). AutoTrimps is
   included, so don't load it a second time.
3. Start the game (or press F5 in it, which reloads from the last save). The message log says
   *AutoTrimps Plus 0.2.0 is running (with AutoTrimps SadAugust v7.2.8)* (after the time warp, if the game
   starts with offline time).

Everything comes from that folder (AutoTrimps, jQuery and select2 included), so the mod works offline and
never downloads code. AutoTrimps' optional graphs and void map clarifier, which it normally fetches from other
sites, aren't included.

## What it does

**AutoTrimps (included, unmodified):** gathering, buildings, jobs, equipment, upgrades, stances, maps,
portals, perks, heirlooms and much more, all controlled by its own settings window (the AutoTrimps button).
Your AutoTrimps settings are kept: they live in the game's local storage, not in the mod.

**Plus (Universe 1):** the **AutoTrimps Plus** switch is the first setting in AutoTrimps' Core tab. On (the
default), AT+:

- **Picks every run.** Challenges that unlock something come first: Discipline, Metal, Size, Scientist I–V,
  Meditate, Decay, Trimp, Trapper, Frugal, Mapocalypse, Coordinate, Slow, Mapology, Devastation, each once your
  highest zone is 10 past the zone where it ends (so it can be completed comfortably). Such a run ends the
  moment the challenge is completed. Then the Dailies still open (one about to expire goes first, even before
  an unlock run), then normal runs inside the best repeatable helium challenge for your total helium, using the
  thresholds players recommend:

  | Challenge | Total helium | Also needs |
  |---|---|---|
  | Balance | — | highest zone 50 |
  | Electricity | 100K | The Prison cleared, zone 79 |
  | Life | 1M | zone 110 |
  | Crushed | 3M | zone 124 |
  | Nom | 10M | zone 145 |
  | Toxicity | 35M | zone 165 |
  | Lead | 80M | zone 180 and the Headstart I Mastery |
  | Corrupted | 150M | zone 190 |
  | Domination | 500M | zone 215 |

  Normal runs end when helium per hour drops, after the void maps, never before the challenge's bonus is in.
  An unlock run stuck on a zone for 2 hours ends as a normal run, and that challenge waits 10 more zones.
- **Buys Masteries** as soon as one is affordable, in the order players recommend, with Headstart I–II and
  Hyperspeed I–II rushed: only what they need below them is bought first (Hyperspeed I becomes the 10th
  Mastery instead of the 19th).
- **Keeps 77 AutoTrimps settings at AutoTrimps' own recommended values**: perks and preset swap, Gene Assist,
  Scryer, map bonus, voids, portal buffers, the generator and magmite, Spire, Dailies and the challenge
  settings. They are outlined in AutoTrimps' window; while AT+ is on, a change to one of them is put back.
  Visual settings (AutoTrimps' Display tab, the game's options) are never touched.
- **Says what it does** in the message log: this run, how it ends, the next run, each Mastery bought.

Off: AT+ does nothing, and AutoTrimps keeps the settings as they are at that moment. In Universe 2 AT+ waits.

## License

GPL-3.0-or-later, like AutoTrimps. jQuery and select2 keep their own licences (`vendor/lib/LICENSE-*`).
AutoTrimps is by SadAugust and the authors before (zininzinin, genBTC, Zorn192 and others).
