import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const folders = [".", "api", "client", "admin", "account"], files = [];
for (const folder of folders) for (const entry of await readdir(folder, { withFileTypes: true })) if (entry.isFile() && entry.name.endsWith(".js")) files.push(`${folder}/${entry.name}`);
for (const file of files) { const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" }); if (result.status) throw new Error(`${file}: ${result.stderr}`); }
console.log(`Syntax OK: ${files.length} JavaScript files`);
