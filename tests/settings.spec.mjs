// The AT+ switch and the AutoTrimps settings AT+ keeps at their recommended values.
import { test, expect } from "@playwright/test";
import { loadGame, noErrors } from "./game.mjs";

test("every recommended setting exists in AutoTrimps, every option label matches, and all are applied", async ({ page }) => {
  const { errors } = await loadGame(page);
  const problems = await page.evaluate(() => {
    ATP.runAll();
    const bad = [];
    for (const [id, value] of ATP.BASELINE.concat(ATP.progressSettings())) {
      const setting = autoTrimpSettings[id];
      if (!setting) { bad.push(`${id}: no such AutoTrimps setting`); continue; }
      let want = value;
      if (setting.type === "multitoggle" && typeof value === "string") {
        want = ATP.optionIndex(id, value);
        if (want < 0) { bad.push(`${id}: no option "${value}"`); continue; }
      }
      if (JSON.stringify(getPageSetting(id, 1)) !== JSON.stringify(want)) bad.push(`${id}: ${JSON.stringify(getPageSetting(id, 1))} instead of ${JSON.stringify(want)}`);
    }
    return bad;
  });
  expect(problems).toEqual([]);
  noErrors(errors);
});

test("the AT+ switch is the first setting in AutoTrimps' Core tab, on by default, and managed settings are outlined", async ({ page }) => {
  await loadGame(page);
  await page.evaluate(() => ATP.runAll());
  const ui = await page.evaluate(() => ({
    first: document.getElementById("Core").children[1].id,
    on: autoTrimpSettings.atpEnabled.enabled,
    outlined: document.querySelectorAll(".atpManaged").length,
    autoPerksOutlined: document.getElementById("autoPerksParent").classList.contains("atpManaged"),
  }));
  expect(ui.first).toBe("atpEnabledParent");
  expect(ui.on).toBe(true);
  expect(ui.autoPerksOutlined).toBe(true);
  expect(ui.outlined).toBeGreaterThan(70);
});

test("a managed setting changed by hand is put back; with the switch off it stays as you set it", async ({ page }) => {
  await loadGame(page);
  const result = await page.evaluate(() => {
    ATP.runAll();
    setPageSetting("hitsSurvived", 3, 1); // by hand
    ATP.runAll();
    const putBack = getPageSetting("hitsSurvived", 1);
    settingChanged("atpEnabled"); // the switch, as clicked
    setPageSetting("hitsSurvived", 3, 1);
    ATP.runAll();
    return { putBack, keptWhenOff: getPageSetting("hitsSurvived", 1), outlinedWhenOff: document.querySelectorAll(".atpManaged").length };
  });
  expect(result.putBack).toBe(1.5);
  expect(result.keptWhenOff).toBe(3);
  await expect.poll(() => page.evaluate(() => document.querySelectorAll(".atpManaged").length)).toBe(0);
  await expect(page.locator("#log")).toContainText("AutoTrimps Plus is off");
});

test("the switch is remembered after reloading the game", async ({ page }) => {
  await loadGame(page);
  await page.evaluate(() => settingChanged("atpEnabled"));
  await page.reload();
  await page.waitForFunction(() => typeof game !== "undefined" && game.global);
  await page.addScriptTag({ url: "/Steam/mods/mods.js" });
  await page.waitForFunction(() => window.ATP && ATP.ready, null, { timeout: 90_000 });
  expect(await page.evaluate(() => autoTrimpSettings.atpEnabled.enabled)).toBe(false);
});

test("AT+ waits in Universe 2 and says so", async ({ page }) => {
  await loadGame(page);
  await page.evaluate(() => { game.global.universe = 2; });
  await expect(page.locator("#log")).toContainText("only plays Universe 1 for now", { timeout: 5000 });
  expect(await page.evaluate(() => ATP.isActive())).toBe(false);
});

test("Masteries: Headstart I–II and Hyperspeed I–II rushed, the rest in the players' order, tier by tier", async ({ page }) => {
  const { errors } = await loadGame(page);
  const bought = await page.evaluate(() => {
    const order = [];
    let cost = 10;
    for (let i = 0; i < 15; i++) {
      game.global.essence = getNextTalentCost(); // exactly one more each time
      const before = Object.keys(game.talents).filter((id) => game.talents[id].purchased);
      ATP.runAll();
      const after = Object.keys(game.talents).filter((id) => game.talents[id].purchased);
      order.push(after.filter((id) => !before.includes(id))[0]);
    }
    return { order, essence: game.global.essence };
  });
  expect(bought.order).toEqual([
    "bounty", "portal", "headstart", // Headstart I 3rd
    "turkimp", "herbalist", "headstart2", // Headstart II 6th
    "bionic", "scry", "daily", "hyperspeed", // Hyperspeed I 10th
    "explorers", "voidPower", "voidPower2", "magimp", "hyperspeed2", // Hyperspeed II 15th
  ]);
  expect(bought.essence).toBe(0);
  noErrors(errors);
});

test("Masteries: with the rushed ones bought, each tier fills in the players' order; every Mastery in the game is in the list", async ({ page }) => {
  await loadGame(page);
  const r = await page.evaluate(() => {
    for (const id of ["bounty", "portal", "turkimp", "bionic", "explorers", "housing", "headstart", "herbalist"]) game.talents[id].purchased = true;
    ATP.MASTERY_RUSH = [];
    const next = ATP.nextMastery();
    const missing = Object.keys(game.talents).filter((id) => !ATP.MASTERY_ORDER.includes(id));
    const unknown = ATP.MASTERY_ORDER.filter((id) => !game.talents[id]);
    return { next, missing, unknown, count: ATP.MASTERY_ORDER.length };
  });
  expect(r.next).toBe("scry");
  expect(r.missing).toEqual([]);
  expect(r.unknown).toEqual([]);
  expect(r.count).toBe(60);
});
