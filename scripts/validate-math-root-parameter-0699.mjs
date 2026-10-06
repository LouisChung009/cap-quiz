import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0699");
const peer = bank.find((row) => row.id === "MAT-0625");
const issues = [];
if (!item || !peer) issues.push("二次方程式題目缺失");
else {
  if (!item.question.includes("一根為 2") || !item.question.includes("k")) issues.push("MAT-0699 未成為已知根求參數題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 3 || item.options[item.answer] !== "另一根 3，k＝−5") issues.push("MAT-0699 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("2r＝6")) || !item.solutionSteps?.some((step) => step.includes("k＝−5")) || !item.explanation?.includes("另一根 3，k＝−5")) issues.push("MAT-0699 缺少代根求參數的解題步驟");
  if (!item.teacherTip?.includes("代回")) issues.push("MAT-0699 教師提醒未提示代回檢查");
  if (item.question === peer.question) issues.push("MAT-0699 仍與 MAT-0625 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0699 known-root parameter reasoning and non-duplicate context passed.");
