import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = rows.find(row => row.id === "MAT-0243");
const comparison = rows.find(row => row.id === "MAT-0402");
const issues = [];
if (!item || !comparison) issues.push("角度比題目不存在");
else {
  if (!item.question.includes("相鄰的外角") || !item.question.includes("2：3：4")) issues.push("MAT-0243 未保留內角比與外角的兩步情境");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 2 || item.options[item.answer] !== "100°") issues.push("MAT-0243 選項或答案索引錯誤");
  if (item.solutionSteps?.length < 3 || !item.solutionSteps.some(step => step.includes("4×20°＝80°")) || !item.solutionSteps.some(step => step.includes("180°－80°＝100°"))) issues.push("MAT-0243 缺少比例與互補角兩步解題");
  if (!item.explanation?.includes("答案 C") || !item.teacherTip?.includes("互補")) issues.push("MAT-0243 解析或教師提醒缺少關鍵概念");
  if (item.question.replace(/[\s一]/g, "") === comparison.question.replace(/[\s一]/g, "")) issues.push("MAT-0243 仍與 MAT-0402 重複題幹");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0243 two-step ratio/exterior-angle reasoning and non-duplicate context passed.");
