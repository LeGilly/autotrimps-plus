// AutoTrimps, loaded from the mod folder, actually plays: a new save gets going by itself.
import { test, expect } from "@playwright/test";
import { loadGame, noErrors } from "./game.mjs";

test("on a new save, AutoTrimps traps Trimps, hires workers and starts fighting within 3 game minutes", async ({ page }) => {
  const { errors, outside } = await loadGame(page, { clock: true });
  // About 16 s of real time per game minute with the fake clock.
  for (let minute = 0; minute < 3; minute++) await page.clock.runFor(60_000);
  const s = await page.evaluate(() => ({
    trimps: game.resources.trimps.owned,
    farmers: game.jobs.Farmer.owned,
    cell: game.global.lastClearedCell + 1,
    fighting: game.global.fighting,
  }));
  expect(s.trimps).toBeGreaterThanOrEqual(5);
  expect(s.farmers).toBeGreaterThanOrEqual(1);
  expect(s.fighting || s.cell > 0).toBe(true);
  expect(outside, "requests outside localhost").toEqual([]);
  noErrors(errors);
});
