// The mod starts AutoTrimps and AutoTrimps Plus from its own folder, without the internet.
import { test, expect } from "@playwright/test";
import { loadGame, noErrors } from "./game.mjs";

test("AutoTrimps and AutoTrimps Plus start from the mod folder, with nothing fetched from the internet", async ({ page }) => {
  const { errors, outside } = await loadGame(page);
  const state = await page.evaluate(() => ({
    atLoaded: atConfig.initialise.loaded,
    atBase: atConfig.initialise.basepath,
    modulesMissing: atConfig.modules.installedModules.filter((m) => !atConfig.modules.loadedModules.includes(m)),
    modsMissing: atConfig.modules.installedMods.filter((m) => !atConfig.modules.loadedMods.includes(m)),
    jquery: typeof jQuery === "function" && jQuery.fn.jquery,
    select2: typeof jQuery.fn.select2 === "function",
    settings: Object.keys(autoTrimpSettings).length,
  }));
  expect(state.atLoaded).toBe(true);
  expect(state.atBase).toMatch(/\/Steam\/mods\/autotrimps-plus\/at\/$/);
  expect(state.modulesMissing).toEqual([]);
  expect(state.modsMissing).toEqual([]);
  expect(state.jquery).toBe("3.7.1");
  expect(state.select2).toBe(true);
  expect(state.settings).toBeGreaterThan(400);
  expect(outside, "requests outside localhost").toEqual([]);
  noErrors(errors);
});

test("the game log says AutoTrimps Plus is running, with both versions", async ({ page }) => {
  await loadGame(page);
  const log = await page.locator("#log").innerText();
  const versions = await page.evaluate(() => [ATP.version, atConfig.initialise.version]);
  expect(log).toContain(`AutoTrimps Plus ${versions[0]} is running (with AutoTrimps ${versions[1]})`);
});

test("during a time warp (offline time) a log line waits, and shows once the time warp is over", async ({ page }) => {
  await loadGame(page);
  await page.evaluate(() => { usingRealTimeOffline = true; ATP.say("Test line after warp"); });
  await page.waitForTimeout(1500);
  expect(await page.locator("#log").innerText()).not.toContain("Test line after warp");
  await page.evaluate(() => { usingRealTimeOffline = false; });
  await expect(page.locator("#log")).toContainText("Test line after warp", { timeout: 5000 });
});

test("ATP.setSetting changes an AutoTrimps setting, saves it, and does nothing when it already has that value", async ({ page }) => {
  await loadGame(page);
  const result = await page.evaluate(() => {
    const changed = ATP.setSetting("autoPortal", "Helium Per Hour", 1);
    const again = ATP.setSetting("autoPortal", "Helium Per Hour", 1);
    const saved = JSON.parse(localStorage.getItem("atSettings")).autoPortal;
    const unknown = ATP.setSetting("noSuchSetting", true, 1);
    return { changed, again, now: getPageSetting("autoPortal", 1), saved, unknown };
  });
  expect(result.changed).toBe(true);
  expect(result.again).toBe(false);
  expect(result.now).toBe("Helium Per Hour");
  expect(JSON.stringify(result.saved)).toContain("Helium Per Hour");
  expect(result.unknown).toBe(false);
});
