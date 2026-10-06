import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = rows.find(row => row.id === "MAT-0289");
const comparison = rows.find(row => row.id === "MAT-0893");
const issues = [];
if (!item || !comparison) issues.push("連續整數題目不存在");
else {
  if (!item.question.includes("六個連續整數") || !item.question.includes("和為 81")) issues.push("MAT-0289 六數情境缺漏");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 0 || item.options[item.answer] !== "11") issues.push("MAT-0289 選項或答案索引錯誤");
  if (!item.solutionSteps?.some(step => step.includes("6n＋15＝81")) || !item.solutionSteps?.some(step => step.includes("n＝11"))) issues.push("MAT-0289 列式或解方程步驟缺漏");
  if (!item.teacherTip?.includes("偏移量") || item.question.replace(/\s/g, "") === comparison.question.replace(/\s/g, "")) issues.push("MAT-0289 教師提醒缺漏或仍重複五數題");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0289 six-consecutive-integer equation and non-duplicate context passed.");
