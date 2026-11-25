// Downloads the Trimps web version the tests run against into .game/ (ignored by git).
// Source: github.com/Trimps/Trimps.github.io, the official web version by the game's author.
// Commit b9edb1d = 5.10.1, the same version as the Steam build (its combo.js says stringVersion '5.10.1').
// Change GAME_COMMIT to test another version.
import { existsSync, mkdirSync, writeFileSync, rmSync, renameSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GAME_COMMIT = "b9edb1dfee270ebf81bef8d934dc71276bf8d963";
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEST = join(ROOT, ".game");
const MARK = join(DEST, ".commit-" + GAME_COMMIT.slice(0, 7));

if (existsSync(MARK)) process.exit(0);
console.log("Downloading Trimps (" + GAME_COMMIT.slice(0, 7) + ") for the tests...");
const res = await fetch("https://codeload.github.com/Trimps/Trimps.github.io/tar.gz/" + GAME_COMMIT);
if (!res.ok) throw new Error("download failed: HTTP " + res.status);
rmSync(DEST, { recursive: true, force: true });
const tmp = join(ROOT, ".game-tmp");
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
writeFileSync(join(tmp, "game.tar.gz"), Buffer.from(await res.arrayBuffer()));
// tar ships with Windows 10+, macOS and Linux.
execFileSync("tar", ["-xzf", "game.tar.gz"], { cwd: tmp });
const folder = readdirSync(tmp).find((n) => n.startsWith("Trimps.github.io-"));
renameSync(join(tmp, folder), DEST);
rmSync(tmp, { recursive: true, force: true });
writeFileSync(MARK, "");
console.log("Game ready in .game/");
