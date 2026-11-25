// Opens the real game (web version, see tools/get-game.mjs) and loads the built mod into it,
// the way the Steam app runs Trimps\mods\mods.js after the game.
import { expect } from "@playwright/test";

// clock: install Playwright's fake clock first, so a test can run game time forward with page.clock.runFor.
export async function loadGame(page, { clock = false } = {}) {
  if (clock) await page.clock.install();
  const errors = [];
  const outside = []; // requests to anything but localhost made after the mod started
  let modStarted = false;
  page.on("pageerror", (e) => errors.push(String(e)));
  // The tests stay offline: anything outside localhost is refused (and noted once the mod is running).
  await page.route(/^https?:\/\/(?!localhost)/, (r) => {
    if (modStarted) outside.push(r.request().url());
    return r.abort();
  });
  await page.goto("/.game/index.html");
  await page.waitForFunction(() => typeof game !== "undefined" && game.global, null, { timeout: 60_000 });
  modStarted = true;
  await page.addScriptTag({ url: "/Steam/mods/mods.js" });
  if (clock) {
    // With the fake clock, timers only run when the test advances time.
    for (let i = 0; i < 120; i++) {
      if (await page.evaluate(() => !!(window.ATP && ATP.ready))) break;
      await page.clock.runFor(1000);
    }
  }
  await page.waitForFunction(() => window.ATP && ATP.ready, null, { timeout: 90_000 });
  return { errors, outside };
}

export function noErrors(errors) {
  expect(errors, "no script errors").toEqual([]);
}
