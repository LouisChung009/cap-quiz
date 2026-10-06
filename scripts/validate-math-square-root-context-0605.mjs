import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0605");
const peer = bank.find((row) => row.id === "MAT-0660");
const issues = [];
if (!item || !peer) issues.push("平方根題目缺失");
else {
  if (!item.question.includes("正方形") || !item.question.includes("面積")) issues.push("MAT-0605 缺少幾何情境");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 1 || item.options[item.answer] !== "8 公分") issues.push("MAT-0605 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("64")) || !item.solutionSteps?.some((step) => step.includes("正數")) || !item.explanation?.includes("8 公分")) issues.push("MAT-0605 缺少面積除法、開平方與正值篩選步驟");
  if (!item.teacherTip?.includes("負值")) issues.push("MAT-0605 教師提醒未提示長度不能為負");
  if (item.question === peer.question) issues.push("MAT-0605 仍與 MAT-0660 重複題幹");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0605 applied square-root context, positive-length constraint, and non-duplicate reasoning passed.");
