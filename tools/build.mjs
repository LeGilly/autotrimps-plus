#!/usr/bin/env node
// Builds the Steam mod, laid out as it goes into Trimps\mods:
//   Steam/mods/mods.js                     (the loader, from ./mods.js)
//   Steam/mods/autotrimps-plus/lib/        (jQuery, select2)
//   Steam/mods/autotrimps-plus/at/         (AutoTrimps, unmodified, from vendor/autotrimps/)
//   Steam/mods/autotrimps-plus/atp/        (our files, from src/)
//   dist/autotrimps-plus-<version>.zip     (the contents of Steam/mods, if the `zip` command exists)
// Usage: npm run build (or node tools/build.mjs)

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const loader = fs.readFileSync(path.join(root, "mods.js"), "utf8");
const version = loader.match(/version: '([^']+)'/)[1];

const out = path.join(root, "Steam", "mods");
const folder = path.join(out, "autotrimps-plus");
fs.rmSync(path.join(root, "Steam"), { recursive: true, force: true });
fs.mkdirSync(folder, { recursive: true });

fs.writeFileSync(path.join(out, "mods.js"), loader);
fs.cpSync(path.join(root, "vendor", "lib"), path.join(folder, "lib"), { recursive: true });
fs.cpSync(path.join(root, "vendor", "autotrimps"), path.join(folder, "at"), { recursive: true });
fs.cpSync(path.join(root, "src"), path.join(folder, "atp"), { recursive: true });
fs.copyFileSync(path.join(root, "LICENSE"), path.join(folder, "LICENSE"));
fs.writeFileSync(
    path.join(folder, "README.txt"),
    "AutoTrimps Plus " + version + "\r\n" +
    "Source, licences and instructions: https://github.com/LeGilly/autotrimps-plus\r\n" +
    "at/ is AutoTrimps by SadAugust (and the authors before), unmodified. GPL-3.0.\r\n" +
    "lib/ holds jQuery and select2 (MIT, their licence files are next to them).\r\n"
);

let files = 0;
(function count(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) e.isDirectory() ? count(path.join(dir, e.name)) : files++;
})(out);
console.log("Built Steam/mods (AutoTrimps Plus " + version + ", " + files + " files)");

try {
    const dist = path.join(root, "dist");
    fs.mkdirSync(dist, { recursive: true });
    const zip = path.join(dist, "autotrimps-plus-" + version + ".zip");
    if (fs.existsSync(zip)) fs.unlinkSync(zip);
    execSync('zip -qr "' + zip + '" mods.js autotrimps-plus', { cwd: out });
    console.log("Zipped " + path.relative(root, zip));
} catch (e) {
    console.log("(zip skipped: " + e.message.split("\n")[0] + ")");
}
