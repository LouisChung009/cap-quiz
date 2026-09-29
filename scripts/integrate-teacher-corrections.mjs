import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const missionPath = join(root, "data", "mission-questions.json");
const mission = JSON.parse(await readFile(missionPath, "utf8"));
const subjects = ["國文", "英文", "數學", "自然", "社會"];
const replacements = new Map();

for (const subject of subjects) {
  const correctedPath = join(root, "reports", `${subject}-corrected-mission.json`);
  const rows = JSON.parse(await readFile(correctedPath, "utf8"));
  for (const row of rows) {
    if (row.subject !== subject || replacements.has(row.id)) throw new Error(`${subject}: 科目或 ID 重複錯誤 ${row.id}`);
    replacements.set(row.id, row);
  }
}

const integrated = mission.map((item) => {
  const corrected = replacements.get(item.id);
  if (!corrected) throw new Error(`教師修正版缺少 ${item.id}`);
  replacements.delete(item.id);
  return corrected;
});
if (replacements.size) throw new Error(`出現未知 ID: ${[...replacements.keys()].slice(0, 10).join(", ")}`);

await writeFile(missionPath, `${JSON.stringify(integrated, null, 2)}\n`, "utf8");
console.log(`整合完成：${integrated.length} 題，五科 ID 全數對應。`);
