import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const checks = new Map([
  ["MAT-0114", [0, "一次函數的 x 截距", "3x＝5", "令 y＝0"]],
  ["MAT-0706", [1, "一次函數斜率與變化量", "−2×3＝−6", "不要再加截距"]],
  ["MAT-0670", [2, "比例尺與長度單位換算", "150,000÷10,000＝15", "除以 10,000"]],
  ["MAT-0146", [0, "路程、速度與時間", "1.5＋1＋0.25＝2.75", "停靠時間"]]
]);
const errors = [];
for (const [id, [answer, knowledgePoint, evidence, tip]] of checks) {
  const item = rows.find(row => row.id === id);
  const worked = `${item?.explanation || ""} ${(item?.solutionSteps || []).join(" ")}`;
  if (!item || item.answer !== answer || item.knowledgePoint !== knowledgePoint || item.options?.length !== 4 || new Set(item.options).size !== 4 || item.solutionSteps?.length !== 3 || !worked.includes(evidence) || !item.teacherTip.includes(tip)) errors.push(`${id}: answer, knowledge point, or distinct worked reasoning mismatch`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Four function, algebra, scale-area, and multi-leg travel items pass targeted solution checks.");
