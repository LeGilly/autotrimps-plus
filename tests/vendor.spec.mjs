// AutoTrimps' files in vendor/autotrimps/ are exactly as tools/update-at.mjs copied them.
import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = fileURLToPath(new URL("../vendor/autotrimps/", import.meta.url));

test("AutoTrimps' files are unmodified (they match the checksums in SOURCE.txt)", () => {
  const listed = readFileSync(join(DIR, "SOURCE.txt"), "utf8")
    .split("\n")
    .filter((l) => /^[0-9a-f]{64}  /.test(l))
    .map((l) => [l.slice(66), l.slice(0, 64)]);
  const actual = [];
  (function walk(dir, rel) {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? rel + "/" + e.name : e.name;
      if (e.isDirectory()) walk(join(dir, e.name), r);
      else if (r !== "SOURCE.txt") actual.push([r, createHash("sha256").update(readFileSync(join(dir, e.name))).digest("hex")]);
    }
  })(DIR, "");
  const sort = (a) => [...a].sort((x, y) => x[0].localeCompare(y[0]));
  expect(sort(actual)).toEqual(sort(listed));
});
