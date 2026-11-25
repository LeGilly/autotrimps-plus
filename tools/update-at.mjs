// Replaces vendor/autotrimps/ with SadAugust's AutoTrimps at one commit, unmodified.
// Usage: node tools/update-at.mjs <commit>   (a full commit id from github.com/SadAugust/AutoTrimps/commits/main)
// Then follow "Updating AutoTrimps" in MAINTAINING.md (check the diff, run the tests, new version).
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync, cpSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// What the mod needs from AutoTrimps. Its testing/, userFiles/, imgs/ and the installation guides are left out.
const KEEP = ["AutoTrimps2.js", "versionNumber.js", "SettingsGUI.js", "modules", "mods", "css", "LICENSE"];

const commit = process.argv[2];
if (!/^[0-9a-f]{40}$/.test(commit || "")) {
    console.error("Give the full 40-character commit id, e.g. node tools/update-at.mjs 0cf73d4...");
    process.exit(1);
}

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEST = join(ROOT, "vendor", "autotrimps");
const tmp = join(ROOT, ".at-tmp");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

console.log("Downloading AutoTrimps " + commit.slice(0, 7) + "...");
const res = await fetch("https://codeload.github.com/SadAugust/AutoTrimps/tar.gz/" + commit);
if (!res.ok) throw new Error("download failed: HTTP " + res.status);
writeFileSync(join(tmp, "at.tar.gz"), Buffer.from(await res.arrayBuffer()));
execFileSync("tar", ["-xzf", "at.tar.gz"], { cwd: tmp });
const src = join(tmp, readdirSync(tmp).find((n) => n.startsWith("AutoTrimps-")));

for (const name of KEEP) if (!existsSync(join(src, name))) throw new Error("missing in that commit: " + name);
rmSync(DEST, { recursive: true, force: true });
mkdirSync(DEST, { recursive: true });
for (const name of KEEP) cpSync(join(src, name), join(DEST, name), { recursive: true });
// SOURCE.txt: where the files come from, and a checksum per file (tests/vendor.spec.mjs checks them).
const sums = [];
(function walk(dir, rel) {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const r = rel ? rel + "/" + e.name : e.name;
        if (e.isDirectory()) walk(join(dir, e.name), r);
        else sums.push(createHash("sha256").update(readFileSync(join(dir, e.name))).digest("hex") + "  " + r);
    }
})(DEST, "");
writeFileSync(
    join(DEST, "SOURCE.txt"),
    "AutoTrimps by SadAugust, https://github.com/SadAugust/AutoTrimps\n" +
    "Commit " + commit + ", copied unmodified by tools/update-at.mjs.\n" +
    "SHA-256 of each file:\n" + sums.join("\n") + "\n"
);
rmSync(tmp, { recursive: true, force: true });
console.log("vendor/autotrimps now holds " + commit.slice(0, 7) + ". Check the diff in GitHub Desktop, then npm test.");
