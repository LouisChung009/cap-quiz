import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = rows.find(row => row.id === "MAT-0248");
const comparison = rows.find(row => row.id === "MAT-0659");
const issues = [];
if (!item || !comparison) issues.push("圓面積題目不存在");
else {
  if (!item.question.includes("直徑為 8 公尺") || item.unit !== "幾何與測量" || item.knowledgePoint !== "圓面積") issues.push("MAT-0248 情境或分類錯誤");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 2 || item.options[item.answer] !== "16π") issues.push("MAT-0248 選項或答案索引錯誤");
  if (!item.explanation?.includes("8÷2＝4 公尺") || !item.solutionSteps?.some(step => step.includes("8÷2＝4 公尺"))) issues.push("MAT-0248 缺少直徑換半徑的解題步驟");
  if (!item.solutionSteps?.some(step => step.includes("π×4²＝16π")) || !item.teacherTip?.includes("不是直徑")) issues.push("MAT-0248 面積計算或易錯提醒缺漏");
  if (item.question.replace(/\s/g, "") === comparison.question.replace(/\s/g, "")) issues.push("MAT-0248 仍與 MAT-0659 重複題幹");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0248 diameter-to-radius area calculation and non-duplicate context passed.");
