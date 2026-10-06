import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = rows.find(row => row.id === "MAT-0251");
const comparison = rows.find(row => row.id === "MAT-0839");
const issues = [];
if (!item || !comparison) issues.push("比例應用題目不存在");
else {
  if (!item.question.includes("共分得 42 張") || !item.question.includes("多分得幾張")) issues.push("MAT-0251 總量／差量情境缺漏");
  if (item.unit !== "比與比例應用" || item.knowledgePoint !== "比例總量與差量" || item.difficulty !== "中等") issues.push("MAT-0251 分類或難度不符多步任務");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 1 || item.options[item.answer] !== "6 張") issues.push("MAT-0251 選項或答案索引錯誤");
  if (!item.solutionSteps?.some(step => step.includes("3＋4＝7")) || !item.solutionSteps?.some(step => step.includes("42÷7＝6")) || !item.solutionSteps?.some(step => step.includes("4－3＝1") && step.includes("1×6＝6"))) issues.push("MAT-0251 缺少總份數、每份量或份數差推理");
  if (!item.teacherTip?.includes("份數差乘每份量") || item.question.replace(/\s/g, "") === comparison.question.replace(/\s/g, "")) issues.push("MAT-0251 易錯提醒缺漏或仍與 MAT-0839 重複題幹");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0251 total-split ratio reasoning and non-duplicate context passed.");
