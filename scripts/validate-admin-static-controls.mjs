import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, "admin", "index.html"), "utf8");
const section = html.match(/<section class="panel attention-actions"[\s\S]*?<\/section>/)?.[0];
if (!section) throw new Error("Admin intervention guidance section is missing");
if (/<button\b/i.test(section)) throw new Error("Admin intervention guidance contains a button without an implemented action");
const statusLabels = [...section.matchAll(/<span class="action-status">([^<]+)<\/span>/g)].map(match => match[1].trim());
if (statusLabels.length !== 3) throw new Error(`Expected 3 visible non-interactive status labels; found ${statusLabels.length}`);
for (const phrase of ["目前不會發送提醒", "目前不會建立任務", "複習排程尚未提供"]) {
  if (!statusLabels.some(label => label.includes(phrase))) throw new Error(`Missing transparent unavailable-state label: ${phrase}`);
}
console.log("Admin intervention guidance has no fake buttons and clearly states unavailable actions.");
