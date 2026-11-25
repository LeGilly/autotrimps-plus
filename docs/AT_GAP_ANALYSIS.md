# AutoTrimps gap analysis: what still needs a human

Analysis date: 2026-11-25. Base studied: **SadAugust/AutoTrimps v7.2.8** (last commit 2026-11-14, up to date with
Trimps 5.10.1, covers both universes). It is the actively maintained fork; Zorn192's stopped in 2024.

## How this was checked

- The game (Trimps.github.io, 5.10.1) and AT were loaded together in headless Chrome, with every AT file served
  locally. All **454 settings** were dumped with their live defaults, type, tab, universe and help text
  (`at-settings-catalogue.csv`, next to this file).
- Every player action in the game's HTML/JS (`onclick=` handlers, 203 of them) was checked against AT's code to
  find systems AT never touches.
- A fresh save was run with AT on defaults under a fake clock. AT handles the very start alone (traps, jobs,
  gathering, first fights), so no human is needed in the first minutes.

## Headline

AT already plays the moment-to-moment game well: gathering, buildings, jobs, equipment, upgrades, stance,
Equality, maps for map bonus, and time warp. **What it leaves to the player is every strategic decision**,
and almost all of those default to off or to a "-1 = not set" value:

- 297 of the 454 settings have a "Recommended:" line in AT's own help, and **59 of them recommend On but
  default to Off**.
- The rest fall into three kinds: a fixed recommendation we can apply as-is, a recommendation that needs logic
  ("second to last Spire you reach", "your desired end zone", "highest tier available"), or no recommendation
  at all (mostly the per-challenge tables).

## Tier 1: without these the run stops or stalls for good

| Gap | AT default | What the autopilot has to decide |
|---|---|---|
| **Auto Portal** | `Off` | Turn it on and pick the mode per run: Helium/Radon per hour for fillers, a set challenge when one is due. Without it AT never portals. |
| **Which challenge to run next** | `None` in all four challenge dropdowns | The unlock path (each challenge unlocks perks, buildings, features, C2s), one-off challenges as they unlock, then C2/C3 runs. This is the biggest piece of new logic. |
| **Void maps** | table inactive | AT never runs voids by default. Choose the zone each run (near the portal zone) and the Hits Survived target. |
| **Unique maps** (The Wall, Block, Trimple of Doom, Prison, Imploding Star, Atlantrimp, Melting Point, Frozen Castle…) | all disabled | Enable each when it's reachable; several gate unlocks (the Portal itself comes from Dimension of Anger). Exact list to take from the game code. |
| **Swap to the next universe** | `Off` | Decide when U2 is worth running and alternate between universes. |
| **Masteries** (talents) | not automated at all | AT never buys them. Needs a purchase order. |
| **Perks** | `autoPerks` and `presetSwap` Off | AT's Perky (U1) and Surky (U2) already pick a preset by challenge and highest zone; just turn both on. |

## Tier 2: the run continues, but far slower than a player would go

| System | State in AT | Gap |
|---|---|---|
| Map farming tables (HD Farm, Map Farm, Map Bonus, Raiding, Bionic Raiding, Prestige Climb, Bone Shrine; U2: Tribute/Meteorologist, Smithy, Worshipper farms) | all inactive | Rows per zone range, generated from progress (HZE, portal zone). |
| Golden upgrades | empty list → AT buys none | A Void/Battle/Helium order by stage. |
| Heirlooms | swapping, shields/staffs, auto keep/recycle and nullifium upgrades all Off; slot names `undefined` | Choose the heirlooms in code (by mods), name or assign them, and turn on keeping and recycling. AT's `autoUpgradeHeirlooms` already spends nullifium when on. |
| Per-challenge settings (Balance, Decay, Life, Toxicity, Experience, Mayhem, Pandemonium, Desolation, Trapper, Wither, Quest, Glass…) | all Off | Mostly fixed recommended values; turn on the one for the challenge being run. |
| Spire settings | `-1` everywhere | "Ignore until" = second to last Spire reached; the rest are fixed values. |
| Daily challenges | `dailyPortalStart` Off | When to take dailies, the portal zone, and which modifiers to skip. |
| C2/C3 runner | Off | Which C2s to push and how far (AT has a percent-of-HZE mode). |
| Gene Assist, Scryer, Wind stacking (U1) | Off | Turn on with zone values by stage. |
| Dimensional Generator and magmite | Off | Fixed recommendations exist (fuel zones, spend on portal). |
| Nature tokens and Enlightenment | Off | Which empowerment to buy, by stage. |
| Fluffy evolution | Off | When to evolve (AT recommends Off until you know; a rule by Fluffy level and bone portals). |

## Tier 3: systems AT doesn't drive, or only from presets you give it

- **Spire TD (player Spire):** AT can only import a layout string you paste. Something has to build or upgrade
  the layout (AT's heirloom calculator has TD maths to reuse).
- **Spire Assault (U2 auto battle):** AT accepts contracts and levels items from presets you define; no presets
  by default.
- **Mutators (U2, Z201+):** AT buys them from saved presets; the presets must exist.
- **Alchemy and Hypothermia:** handled by AT inside their challenge tables, which are inactive by default.
- **Bones** (bone portals, bone shop): AT only buys single-run bonuses from its settings. Bones mostly come from
  purchases, so the autopilot shouldn't plan around them.

## Shape of the mod (decided 2026-11-25)

Same pattern as Frozen Cookies Plus (details in MAINTAINING.md, "Decisions"):

1. **AutoTrimps copied in unmodified** (`vendor/autotrimps/`, commit 0cf73d4, v7.2.8) and loaded from the
   Steam `mods` folder, with jQuery and select2 bundled and the other outside scripts skipped: nothing is
   downloaded. Done in 0.1.0.
2. **Our layer in `src/atp_*` files** that never patch AutoTrimps' code. They only:
   - write AutoTrimps settings with its own setter (`ATP.setSetting` → `setPageSetting`), the way a player
     would, and
   - add the missing actions (Masteries, Spire TD, challenge choice, universe swap).
3. **Universe 1 first.** Universe 2 later.
4. **A progress model**: a small set of stages read from the save (HZE, unlocked challenges, C² totals, owned
   features). Each stage carries the settings that are best for it, and they update by themselves on every
   portal and when a milestone is reached. AutoTrimps' "Recommended:" lines (`at-settings-catalogue.csv`)
   are the starting values; the rules marked "needs logic" get their own code.
5. **A settings lock**: once a setting is under autopilot control it's shown as such, with an override switch
   for the owner.
6. **Achievement hunter (after the gap logic):** do a full automated run, list which achievements are still
   missing, then add targeted runs or actions for them.

## Testing

- The repo's tests load the game and the built mod in headless Chrome (like Frozen Cookies Plus's tests
  against the real game), with nothing reaching the internet.
- Playwright's fake clock runs the game forward at about 0.4 s of real time per game minute on a new save
  (an hour in ~25 s), so full automated runs can be tested. To measure: how that holds deeper in the game.
- Tests can also load saves at fixed points (Z60 with no Spire, the first portal…) to check which settings
  the autopilot chooses at each stage.

## Things to verify from the game code before building

The challenge and unique map unlock tables and the Universe 2 unlock are now in `GAME_NOTES.md`. Still to
read: the Mastery costs and effects, and the order to buy them in.
