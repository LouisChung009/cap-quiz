import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = rows.find((row) => row.id === "MAT-0500");
const prior = rows.find((row) => row.id === "MAT-0476");
const problems = [];
if (!item || !prior) problems.push("缺少眾數題目");
else {
  if (!item.question.includes("每週運動天數") || !item.question.includes("至少 3 天")) problems.push("MAT-0500 未成為讀表推理題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 2 || item.options[item.answer] !== "18" ) problems.push("MAT-0500 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("至少 3 天")) || !item.solutionSteps?.some((step) => step.includes("10＋6＋2＝18")) || !item.explanation?.includes("10＋6＋2＝18 人")) problems.push("MAT-0500 缺少條件範圍加總步驟");
  if (!item.teacherTip?.includes("至少") || !item.teacherTip?.includes("頻數相加")) problems.push("MAT-0500 教師提醒缺少條件範圍加總重點");
  if (item.question === prior.question) problems.push("MAT-0500 與 MAT-0476 題幹重複");
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("MAT-0500 frequency-table condition-sum reasoning and non-duplicate context passed.");
