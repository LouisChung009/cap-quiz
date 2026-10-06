import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const checks = new Map([
  ["MAT-0711", [1, "平行四邊形面積", "126÷18＝7", "反求平行四邊形的高"]],
  ["MAT-0597", [1, "圓柱體積", "r²＝9", "半徑不取負值"]],
  ["MAT-0648", [3, "立體圖形縮放與體積倍率", "2×2×2＝8", "三個方向"]],
  ["MAT-0487", [2, "梯形面積", "72÷12＝6", "斜邊"]],
  ["MAT-0964", [3, "長方體表面積", "6＋40＝46", "無上蓋盒子"]]
]);
const errors = [];
for (const [id, [answer, knowledgePoint, evidence, tip]] of checks) {
  const item = rows.find(row => row.id === id);
  const workedSolution = `${item?.explanation || ""} ${(item?.solutionSteps || []).join(" ")}`;
  if (!item || item.answer !== answer || item.knowledgePoint !== knowledgePoint || item.options?.length !== 4 || new Set(item.options).size !== 4 || item.solutionSteps?.length !== 3 || !workedSolution.includes(evidence) || !item.teacherTip.includes(tip)) errors.push(`${id}: geometry key, reverse calculation, or worked explanation mismatch`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Five geometry items pass inverse formula, unit, surface-area, key, and worked-solution checks.");
