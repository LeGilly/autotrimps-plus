# AutoTrimps Plus — where we left off (2026-11-25)

## Status
- 0.1.0 written, not committed yet: the repo, AutoTrimps vendored (SadAugust v7.2.8, commit 0cf73d4,
  unmodified, checksummed), the local loader, build, tests (6) and release workflow.
- **To check once in the Steam game:** install the 0.1.0 zip, start Trimps, and confirm the log line
  "AutoTrimps Plus 0.1.0 is running…" and that the AutoTrimps settings window works. The tests run the web
  version in Chrome; only the Steam app shows that loading local files works there (NW.js).

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
