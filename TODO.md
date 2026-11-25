# AutoTrimps Plus — where we left off (2026-11-25)

## Status
- 0.1.0 committed and released; 0.1.1 written (log line after a time warp), not committed yet. 0.1.0 has: the repo, AutoTrimps vendored (SadAugust v7.2.8, commit 0cf73d4,
  unmodified, checksummed), the local loader, build, tests (7) and release workflow.
- **Steam check (2026-11-25):** installed; AutoTrimps runs from the local folder in the Steam app (its
  messages show, the installed mods.js is ours). The "AutoTrimps Plus … is running" line was hidden because
  the game started with a time warp; with time warp off the line shows. Fixed in 0.1.1 (the line waits for
  the warp's end). Still to see once: the line after a time warp, with 0.1.1 installed.

## Next: Tier 1 of docs/AT_GAP_ANALYSIS.md (Universe 1)
1. A full-run harness: the fake clock runs a new save at ~0.4 s real per game minute (an hour in ~25 s).
   Measure it deeper in the game, and add saves at fixed points (first portal, Z60, Z200) for the tests.
2. Progress model: stages read from the save (HZE, challenges done, unlocks, C² totals).
3. Settings from AutoTrimps' "Recommended:" lines (docs/at-settings-catalogue.csv), set by `ATP.setSetting`.
4. Auto Portal mode and the challenge order (docs/GAME_NOTES.md has the U1 unlock table).
5. Void maps and unique maps by zone.
6. Masteries: purchase order (AutoTrimps never buys them). Read their costs and effects into GAME_NOTES first.
7. Turn on autoPerks + presetSwap (AutoTrimps' Perky already picks presets by challenge and zone).

## Later
- Tier 2 and 3 of the gap analysis (farming tables, golden upgrades, heirlooms, Spire TD…).
- Achievement hunter: after a full automated run, list the achievements still missing and add what gets them.
- Universe 2 (opens at Fluffy E8L10, see GAME_NOTES.md).
- Hub listing (docs/HUB_BRIEF.md), once there's a first release.
