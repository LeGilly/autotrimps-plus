// The run planner: what AT+ picks as the next run, how the current run ends, and that AutoTrimps then
// portals into it. Game states are built directly (highest zone, owned perks, Dailies), then the planner runs.
import { test, expect } from "@playwright/test";
import { loadGame, noErrors } from "./game.mjs";

// Sets up a Universe 1 state: highest zone cleared, total helium, which unlock challenges are done.
async function setState(page, { hze = 0, helium = 1000, done = [], challenge = "", dailiesDone = [], headstart = false } = {}) {
  await page.evaluate(({ hze, helium, done, challenge, dailiesDone, headstart }) => {
    game.talents.headstart.purchased = headstart;
    game.global.highestLevelCleared = hze;
    game.global.totalHeliumEarned = helium;
    for (const run of ATP.UNLOCK_RUNS) {
      const finished = done === "all" || done.includes(run.name);
      const perk = game.challenges[run.name].unlocks;
      if (perk && game.portal[perk]) game.portal[perk].locked = !finished;
    }
    const all = done === "all";
    game.global.sLevel = all || done.includes("Scientist") ? 5 : 0;
    game.global.decayDone = all || done.includes("Decay");
    game.global.frugalDone = all || done.includes("Frugal");
    game.global.slowDone = all || done.includes("Slow");
    game.global.challengeActive = challenge;
    game.global.recentDailies = dailiesDone.map((d) => getDailyTimeString(d));
    ATP.runAll();
  }, { hze, helium, done, challenge, dailiesDone, headstart });
  return page.evaluate(() => ({
    plan: ATP.status.plan,
    autoPortal: getPageSetting("autoPortal", 1),
    heliumChallenge: getPageSetting("heliumChallenge", 1),
    heliumHourChallenge: getPageSetting("heliumHourChallenge", 1),
    dailyPortalStart: getPageSetting("dailyPortalStart", 1),
    dontPortalBefore: getPageSetting("heliumHrDontPortalBefore", 1),
  }));
}

test("a new save: a run without challenge that ends when helium per hour drops, then the same again", async ({ page }) => {
  const { errors } = await loadGame(page);
  const s = await setState(page, { hze: 0, helium: 0 });
  expect(s.autoPortal).toBe("Helium Per Hour");
  expect(s.heliumHourChallenge).toBe("None");
  expect(s.plan.next).toBe("a run without challenge");
  noErrors(errors);
});

test("Discipline (open from 30 helium) is the next run once the highest zone is 10 past its end (zone 20)", async ({ page }) => {
  await loadGame(page);
  expect((await setState(page, { hze: 25, helium: 30 })).heliumChallenge).toBe("Off"); // open, but zone 25 < 20 + 10
  const s = await setState(page, { hze: 30, helium: 30 });
  expect(s.heliumChallenge).toBe("Discipline");
  expect(s.heliumHourChallenge).toBe("Discipline");
  expect(s.autoPortal).toBe("Helium Per Hour"); // this run has no challenge: it ends on helium per hour
  expect(s.plan.next).toContain("Range");
});

test("during an unlock run the run ends as soon as it's completed, and the next unlock is lined up in order", async ({ page }) => {
  await loadGame(page);
  const s = await setState(page, { hze: 50, done: ["Discipline"], challenge: "Metal" });
  expect(s.autoPortal).toBe("Helium Challenges");
  expect(s.heliumChallenge).toBe("Size"); // Metal itself counts as done: it will be when AutoTrimps portals
  expect(s.plan.thisRun).toContain("Artisanistry");
});

test("unlock runs follow the order they open in, skipping the ones done and the ones not open yet", async ({ page }) => {
  await loadGame(page);
  expect((await setState(page, { hze: 50, done: ["Discipline", "Metal", "Size"] })).heliumChallenge).toBe("Scientist");
  expect((await setState(page, { hze: 50, done: ["Discipline", "Metal", "Size", "Scientist"] })).heliumChallenge).toBe("Meditate");
  // Trimp opens at zone 60: with a highest zone of 50, after Meditate there is nothing to unlock yet
  const s = await setState(page, { hze: 50, done: ["Discipline", "Metal", "Size", "Scientist", "Meditate"] });
  expect(s.heliumChallenge).toBe("Balance"); // the best helium challenge instead (zone 40 + 10 ≤ 50)
});

test("with every unlock done, normal runs use the best helium challenge your total helium allows", async ({ page }) => {
  await loadGame(page);
  expect((await setState(page, { hze: 45, done: "all" })).heliumHourChallenge).toBe("None"); // Balance from zone 40 + 10
  expect((await setState(page, { hze: 60, done: "all" })).heliumHourChallenge).toBe("Balance");
  await page.evaluate(() => { game.global.prisonClear = 1; });
  expect((await setState(page, { hze: 95, done: "all", helium: 99e3 })).heliumHourChallenge).toBe("Balance"); // Electricity from 100K
  expect((await setState(page, { hze: 95, done: "all", helium: 100e3 })).heliumHourChallenge).toBe("Electricity");
  // the thresholds: Life 1M, Crushed 3M, Nom 10M, Toxicity 35M (each also needs its zone)
  expect((await setState(page, { hze: 300, done: "all", helium: 2e6 })).heliumHourChallenge).toBe("Life");
  expect((await setState(page, { hze: 300, done: "all", helium: 5e6 })).heliumHourChallenge).toBe("Crushed");
  expect((await setState(page, { hze: 140, done: "all", helium: 20e6 })).heliumHourChallenge).toBe("Crushed"); // Nom needs zone 145
  expect((await setState(page, { hze: 300, done: "all", helium: 20e6 })).heliumHourChallenge).toBe("Nom");
  // Lead from 80M with Headstart I; without it Toxicity stays the best
  expect((await setState(page, { hze: 300, done: "all", helium: 90e6 })).heliumHourChallenge).toBe("Toxicity");
  expect((await setState(page, { hze: 300, done: "all", helium: 90e6, headstart: true })).heliumHourChallenge).toBe("Lead");
  expect((await setState(page, { hze: 300, done: "all", helium: 200e6, headstart: true })).heliumHourChallenge).toBe("Corrupted");
  expect((await setState(page, { hze: 300, done: "all", helium: 600e6, headstart: true })).heliumHourChallenge).toBe("Domination");
  // inside Balance, helium per hour may not portal before zone 41 (the bonus comes with zone 40)
  const inBalance = await setState(page, { hze: 60, done: "all", challenge: "Balance" });
  expect(inBalance.dontPortalBefore).toBe(41);
  expect(inBalance.autoPortal).toBe("Helium Per Hour");
});

test("unlock challenges that end where they open wait until they can be completed: Decay until 65, Devastation until 180", async ({ page }) => {
  await loadGame(page);
  const allBut = (name) => ["Discipline", "Metal", "Size", "Scientist", "Meditate", "Decay", "Trimp", "Trapper", "Frugal", "Mapocalypse", "Coordinate", "Slow", "Mapology", "Devastation"].filter((n) => n !== name);
  expect((await setState(page, { hze: 60, done: allBut("Decay") })).heliumChallenge).not.toBe("Decay");
  expect((await setState(page, { hze: 65, done: allBut("Decay") })).heliumChallenge).toBe("Decay");
  expect((await setState(page, { hze: 175, done: allBut("Devastation") })).heliumChallenge).not.toBe("Devastation");
  expect((await setState(page, { hze: 180, done: allBut("Devastation") })).heliumChallenge).toBe("Devastation");
});

test("Dailies: open ones are run after the unlock runs, but one about to expire goes first", async ({ page }) => {
  await loadGame(page);
  // zone 120, everything unlocked, no Daily done: Daily next
  let s = await setState(page, { hze: 120, done: "all" });
  expect(s.dailyPortalStart).toBe(true);
  expect(s.plan.next).toContain("Daily (7 open)");
  // an unlock run due (Coordinate), and the oldest Daily done: the unlock run first
  const notCoordinate = ["Discipline", "Metal", "Size", "Scientist", "Meditate", "Decay", "Trimp", "Trapper", "Frugal", "Mapocalypse"];
  s = await setState(page, { hze: 120, done: notCoordinate, dailiesDone: [-6] });
  expect(s.dailyPortalStart).toBe(false);
  expect(s.heliumChallenge).toBe("Coordinate");
  // the oldest Daily still open: it expires next, so it goes before Coordinate
  s = await setState(page, { hze: 120, done: notCoordinate, dailiesDone: [] });
  expect(s.dailyPortalStart).toBe(true);
  expect(s.heliumChallenge).toBe("Coordinate"); // still the fallback if AutoTrimps finds no Daily
  // all done: no Daily
  s = await setState(page, { hze: 120, done: "all", dailiesDone: [-6, -5, -4, -3, -2, -1, 0] });
  expect(s.dailyPortalStart).toBe(false);
  // Dailies open at zone 100 (highest zone cleared 99)
  s = await setState(page, { hze: 98, done: "all" });
  expect(s.dailyPortalStart).toBe(false);
});

test("an unlock run stuck for 2 hours ends as a normal run, and its challenge waits 10 more zones", async ({ page }) => {
  await loadGame(page);
  await setState(page, { hze: 80, done: ["Discipline", "Metal", "Size", "Scientist", "Meditate", "Decay", "Trimp"], challenge: "Trapper" });
  const result = await page.evaluate(() => {
    const realNow = Date.now;
    const start = realNow();
    Date.now = () => start + 2 * 3600 * 1000 + 1000; // two hours later, same zone
    ATP.runAll();
    Date.now = realNow;
    return { autoPortal: getPageSetting("autoPortal", 1), postponed: ATP.state.postponed, next: ATP.status.plan.next };
  });
  expect(result.autoPortal).toBe("Helium Per Hour");
  expect(result.postponed.Trapper).toBe(90);
  expect(result.next).not.toContain("Trapper");
  expect(result.next).toContain("Balance"); // nothing else to unlock at zone 80 (Frugal opens at 100)
});

test("end to end: when an unlock run is completed, AutoTrimps portals straight into the next one AT+ chose", async ({ page }) => {
  const { errors } = await loadGame(page);
  await setState(page, { hze: 50, done: ["Discipline"], challenge: "Metal" });
  const after = await page.evaluate(() => {
    const portalsBefore = game.global.totalPortals;
    // Metal completed: the game clears the challenge and unlocks the perk; the portal is open
    game.portal.Artisanistry.locked = false;
    game.global.challengeActive = "";
    game.global.portalActive = true;
    autoPortalCheck(); // AutoTrimps' own portal step, as in its main loop
    return { portals: game.global.totalPortals - portalsBefore, challenge: game.global.challengeActive };
  });
  expect(after.portals).toBe(1);
  expect(after.challenge).toBe("Size");
  noErrors(errors);
});

test("end to end: with nothing due after an unlock run, AutoTrimps portals into a run without challenge", async ({ page }) => {
  const { errors } = await loadGame(page);
  const s = await setState(page, { hze: 30, done: ["Discipline"], challenge: "Metal" }); // Size opens at 35, Balance from 50
  expect(s.heliumChallenge).toBe("Off");
  const after = await page.evaluate(() => {
    const portalsBefore = game.global.totalPortals;
    game.portal.Artisanistry.locked = false;
    game.global.challengeActive = "";
    game.global.portalActive = true;
    autoPortalCheck();
    return { portals: game.global.totalPortals - portalsBefore, challenge: game.global.challengeActive };
  });
  expect(after.portals).toBe(1);
  expect(after.challenge).toBe("");
  noErrors(errors);
});

test("end to end: with a Daily due, AutoTrimps portals into the oldest open Daily", async ({ page }) => {
  const { errors } = await loadGame(page);
  const notCoordinate = ["Discipline", "Metal", "Size", "Scientist", "Meditate", "Decay", "Trimp", "Trapper", "Frugal", "Mapocalypse", "Slow", "Mapology", "Devastation"];
  const s = await setState(page, { hze: 120, done: notCoordinate, challenge: "Coordinate" });
  expect(s.dailyPortalStart).toBe(true);
  const after = await page.evaluate(() => {
    game.portal.Coordinated.locked = false;
    game.global.challengeActive = "";
    game.global.portalActive = true;
    autoPortalCheck();
    return { challenge: game.global.challengeActive, day: game.global.dailyChallenge && game.global.dailyChallenge.seed };
  });
  expect(after.challenge).toBe("Daily");
  noErrors(errors);
});
