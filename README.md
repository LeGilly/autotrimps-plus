# AutoTrimps Plus

An automation mod for **Trimps on Steam (5.10.1)**. It runs **AutoTrimps** (SadAugust's fork, v7.2.8, kept
unmodified inside) and adds what AutoTrimps leaves to the player, aiming for a game that plays itself from a
new save onwards: no settings to fill in, and settings that keep themselves up to date as the game progresses.

**Status: 0.1.0, the foundation.** AutoTrimps now starts from the mod's own folder instead of the internet.
The automation of its own comes next (see `docs/AT_GAP_ANALYSIS.md` for what is planned, starting with
Universe 1).

## Install (Steam, local mod)

Download `autotrimps-plus-<version>.zip` from this repository's **Releases** page.

1. In Steam: right-click Trimps → Manage → Browse local files, then open the `mods` folder
   (on a default install: `C:\Program Files (x86)\Steam\steamapps\common\Trimps\mods\`).
2. Unzip the release there. It contains `mods.js` and an `autotrimps-plus` folder, and **replaces the
   `mods.js` that's already there**. That file is how the Steam version runs mods, so AutoTrimps Plus takes
   the place of whatever it loaded before (AutoTrimps from the internet, the Mod Loader…). AutoTrimps is
   included, so don't load it a second time.
3. Start the game (or press Ctrl+R in it). The message log says
   *AutoTrimps Plus 0.1.0 is running (with AutoTrimps SadAugust v7.2.8)*.

Everything comes from that folder (AutoTrimps, jQuery and select2 included), so the mod works offline and
never downloads code. AutoTrimps' optional graphs and void map clarifier, which it normally fetches from other
sites, aren't included.

## What it does

**AutoTrimps (included, unmodified):** gathering, buildings, jobs, equipment, upgrades, stances, maps,
portals, perks, heirlooms and much more, all controlled by its own settings window (the AutoTrimps button).
Your AutoTrimps settings are kept: they live in the game's local storage, not in the mod.

**Plus:** for now, AutoTrimps running locally. Next: running the portal, challenges, void and unique maps,
Masteries and AutoTrimps' settings by itself in Universe 1.

## License

GPL-3.0-or-later, like AutoTrimps. jQuery and select2 keep their own licences (`vendor/lib/LICENSE-*`).
AutoTrimps is by SadAugust and the authors before (zininzinin, genBTC, Zorn192 and others).
