# Trimps game notes (Universe 1)

Facts the autopilot is built on, **read from the game code** (Trimps 5.10.1: `.game/config.js`, `.game/main.js`,
downloaded by `tools/get-game.mjs`; the Steam build's `combo.js` is the same version). Each line says where it
was checked. Add to this file whenever something is verified, and correct it when the game changes.

"HZE" below means the highest zone cleared in Universe 1 (`game.global.highestLevelCleared`; the game's
"reach Zone N" means HZE ≥ N − 1).

## Challenges and what they unlock

From `game.challenges` in config.js (`filter` = when it can be picked, `onComplete`/`unlock…` = the reward).
"C²" = can also be run as a Challenge² (`allowSquared: true`).

| Challenge | Can be picked when | Completing it gives | C² |
|---|---|---|---|
| Discipline | 30 total Helium earned | Perk: Range | yes |
| Metal | reach Z25 | Perk: Artisanistry (Speedminer, Megaminer, Magmamancers come back as upgrades) | yes |
| Size | reach Z35 | Perk: Carpentry | yes |
| Balance | reach Z40 | +Helium through Z40 (`heliumThrough: 40`) | yes |
| Scientist | HZE ≥ 39 / 49 / 89 / 109 / 129 for levels I–V (`game.global.sLevel`) | Speedscience upgrade; what each level adds: to read | no |
| Meditate | reach Z45 | Perk: Meditation | yes |
| Decay | reach Z55 | completes after Z55 | no |
| Trimp | reach Z60 | Perk: Resilience (and Coordination comes back) | yes |
| Trapper | reach Z70 | Perk: Anticipation (and Potency comes back) | yes |
| Electricity | clear The Prison once (`game.global.prisonClear > 0`) | +Helium through Z79, repeatable | yes |
| Frugal | reach Z100 | MegaBooks give +60% gather speed instead of +50%, for good (its description) | no |
| Daily | HZE ≥ 99 in U1 (HZE ≥ 29 in U2) | daily bonus Helium | — |
| Life | reach Z110 | +Helium through Z110 | no |
| Mapocalypse | reach Z115 | Perk: Siphonology | no |
| Coordinate | reach Z120 | Perk: Coordinated | yes |
| Crushed | reach Z125 | +Helium through Z124 (Bionic Wonderland) | no |
| Slow | reach Z130 | Equipment: Arbalest, Gambeson | yes |
| Nom | reach Z145 | +Helium through Z145 | yes |
| Mapology | reach Z150 | Perk: Resourceful | yes |
| Toxicity | reach Z165 | +Helium through Z165 | yes |
| Devastation | reach Z170 | Perk: Overkill | no |
| Watch / Lead | reach Z180 | +Helium through Z180 | yes |
| Corrupted | reach Z190 | +Helium through Z190 | no |
| Domination | reach Z215 | +Helium through Z215 | no |
| Obliterated | reach Z425 | — | yes |
| Frigid | reach Z460 | completes after Z460 | no |
| Experience | reach Z600 | completes at Z700 (or BW XXXIII at Z601+), repeatable | no |
| Eradicated | 4,500% total C² bonus (`game.global.totalSquaredReward`) | — | yes |

Also in `game.challenges`, still to read: Paralysis, Nometal, Topology, Waze, Toxad, Enlightened. Their
descriptions speak of pairing two C² dimensions (Toxicity² with another), so they look like the combined
Challenge² runs.

## Unique maps (U1)

The zone each map appears at, from the `createMap(level, name, …)` calls in config.js. Atlantrimp, Big Wall,
Prismatic Palace, Melting Point, Frozen Castle and Dimension of Rage are Universe 2 only (`blockU1: true`).

| Map | Zone | What its last cell gives (config.js map drops) |
|---|---|---|
| The Block | 11 | Shieldblock |
| The Wall | 15 | Bounty |
| Dimension of Anger | 20 | the Portal (also: ends Size/Frugal/Coordinate effects when run with them) |
| Trimple Of Doom | 33 | Ancient Treasure, and the perk Relentlessness ("Unleash the Crit") the first time |
| The Prison | 80 | The Warden's Keys: unlocks the Electricity challenge |
| Bionic Wonderland | 125, then one tier every 15 zones (`tier * 15 + 125`) | RoboTrimp, then equipment prestiges |
| Imploding Star | 170 | ends the Devastation penalty when run with it |

To verify for each map: the drop entries' `specialFilter`/location confirm which map they belong to (the
table follows the game's own messages and order). The Gigastation blueprints are a normal map drop from Z61.

## Universe 2

- Opens when **Fluffy reaches Evolution 8, level 10** (or any level at evolution 9+): `Fluffy.checkU2Allowed()`
  in main.js. It isn't tied to a zone, so the autopilot's switch to U2 has to follow Fluffy, not the HZE.

## AutoTrimps behaviour worth knowing

- AutoTrimps' setting values are read with `getPageSetting(id, universe)` and written with
  `setPageSetting(id, value, universe)` (vendor/autotrimps/modules/utils.js), which saves all settings to
  `localStorage.atSettings`. Settings that exist in both universes keep a separate value for U2.
- AutoTrimps writes to the game log through its own `debug(text, type)`. With no type the line always shows.
- On a new save, AutoTrimps with its defaults starts the game alone: traps, jobs, gathering, buildings and the
  first fights (checked headless, 2026-11-25). What it leaves to the player is in `docs/AT_GAP_ANALYSIS.md`.
