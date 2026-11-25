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

## When a challenge counts as done

The game's own challenge list (main.js, the portal screen) marks a challenge done when the perk named in its
`unlocks` field is owned (`isPerkUnlocked`), or by a flag for the others: `game.global.decayDone`,
`frugalDone`, `slowDone`; Scientist by `game.global.sLevel` (0–5). AT+ uses the same tests. Each challenge's
`filter()` says whether it can be picked now.

## Where each unlock challenge ends (its description)

The Block (Z11): Scientist, Trimp. Dimension of Anger (Z20): Discipline, Metal, Size, Frugal, Coordinate.
Trimple Of Doom (Z33): Meditate, Trapper. Zone 55: Decay. The Prison (Z80): Mapocalypse. Zone 100: Mapology.
Zone 120: Slow. Imploding Star (Z170): Devastation. Only Decay and Devastation end at the zone that opens
them; Slow ends 10 below. AT+ starts each once the highest zone is 10 past its end.

## Player recommendations used (not from the game code)

- **Helium challenge thresholds**, by total helium (Steam discussion "Recommended Helium thresholds and farming
  strategies", Oct 2022, https://steamcommunity.com/app/1877960/discussions/0/5595184948709690860):
  Electricity 100K, Life 1M, Crushed 3M, Nom 10M, Toxicity 35M, Lead 80M + Headstart I, Corrupted 150M,
  Domination 500M. Another discussion adds that Toxicity beats Lead until Headstart I.
- **Mastery order:** the community list the owner shared (tiers 1–9), and for tier 10 the Helium-spec order of
  "Trimps: Full Mastery or Dark Essence Guide" (2022, kosgames.com), whose tiers 7–9 match that list.

## Repeatable helium challenges (bonus on all helium up to their zone)

From the descriptions in config.js: Balance +100% (Z40), Electricity +200% (The Prison, Z80), Life +400%
(Z110), Crushed +400% (Bionic Wonderland, Z125), Nom +450% (Z145), Toxicity +400% (Z165), Watch +200% and
Lead +300% (Z180), Corrupted +200% (Z190), Domination +100% (Z215).

## Dailies

- Open in U1 at HZE ≥ 99. The last 7 days are available (`getDailyTimeString(-6)` … `(0)`); the ones done are
  in `game.global.recentDailies` (`checkCompleteDailies()` drops older ones).
- Reward: `getDailyHeliumValue`: between +100% and +500% helium for the run, from the modifiers' weight.

## Masteries (game.talents)

- 60 Masteries in 10 tiers of 6, bought with Dark Essence (`game.global.essence`); available from zone 181.
  Ids for the community abbreviations: `fluffyExp` = Flufffocus, `fluffyAbility` = Flufffinity, `maz` = Map at
  Zonier, `magimp` = Randimp, `daily` = Legs for Days, `quickGen` = Expert Gen.
- Cost depends only on how many you own: `10 × 3^owned`, and from the 25th on `2,824,295,364,810 × 6^(owned−24)`
  (`getNextTalentCost`).
- A tier opens as the one below fills: with n owned in tier k, tier k+1 allows n − 1 (all 6 once tier k is full)
  (`getAllowedTalentTiers`). Some need another first (`requires`, e.g. Void Power II needs I).
- `completeTalentPurchase(talent)` is the game's own purchase (checks tier, requirements, cost).

## Universe 2

- Opens when **Fluffy reaches Evolution 8, level 10** (or any level at evolution 9+): `Fluffy.checkU2Allowed()`
  in main.js. It isn't tied to a zone, so the autopilot's switch to U2 has to follow Fluffy, not the HZE.

## AutoTrimps behaviour worth knowing

- AutoTrimps' setting values are read with `getPageSetting(id, universe)` and written with
  `setPageSetting(id, value, universe)` (vendor/autotrimps/modules/utils.js), which saves all settings to
  `localStorage.atSettings`. Settings that exist in both universes keep a separate value for U2.
- AutoTrimps writes to the game log through its own `debug(text, type)`. With no type the line always shows.
- "Unique Map Unlocks" (on by default) already runs The Block, The Wall, Dimension of Anger, Trimple of Doom and
  The Prison for their unlocks, and a challenge's completion map is run while that challenge is active
  (`mapData.challenges` in mapFunctions.js).
- In "Helium Per Hour" mode AutoTrimps shows a 4-second "Auto Portaling NOW" notice, then portals by itself.
- On a new save, AutoTrimps with its defaults starts the game alone: traps, jobs, gathering, buildings and the
  first fights (checked headless, 2026-11-25). What it leaves to the player is in `docs/AT_GAP_ANALYSIS.md`.
