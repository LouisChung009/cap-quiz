import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = rows.find(row => row.id === "MAT-0405");
const comparison = rows.find(row => row.id === "MAT-0574");
const issues = [];
if (!item || !comparison) issues.push("外角題目不存在");
else {
  if (!item.question.includes("外角為 125°") || !item.question.includes("比為 2：3")) issues.push("MAT-0405 外角與比例情境缺漏");
  if (item.difficulty !== "中等" || item.knowledgePoint !== "三角形外角與角度比") issues.push("MAT-0405 考點或難度不符兩步推理");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 0 || item.options[item.answer] !== "75°") issues.push("MAT-0405 選項或答案索引錯誤");
  if (!item.solutionSteps?.some(step => step.includes("不相鄰內角的和") && step.includes("125°")) || !item.solutionSteps?.some(step => step.includes("2＋3＝5") && step.includes("125°÷5＝25°")) || !item.solutionSteps?.some(step => step.includes("3×25°＝75°"))) issues.push("MAT-0405 外角定理或比例計算步驟缺漏");
  if (!item.teacherTip?.includes("外角不包含") || item.question.replace(/\s/g, "") === comparison.question.replace(/\s/g, "")) issues.push("MAT-0405 易錯提醒缺漏或仍與 MAT-0574 重複題幹");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0405 exterior-angle ratio reasoning and non-duplicate context passed.");
