// The version in mods.js (shown in the game log) matches the changelog and the built mod.
import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

test("the mod version matches the newest changelog entry and the built mod", () => {
  const version = read("mods.js").match(/version: '([^']+)'/)[1];
  const changelog = read("CHANGELOG.md").match(/^## (\d+\.\d+\.\d+)/m)[1];
  const built = read("Steam/mods/mods.js").match(/version: '([^']+)'/)[1];
  const readme = read("Steam/mods/autotrimps-plus/README.txt");
  expect(version).toBe(changelog);
  expect(built).toBe(version);
  expect(readme).toContain("AutoTrimps Plus " + version);
});
