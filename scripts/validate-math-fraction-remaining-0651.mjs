import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0651");
const peer = bank.find((row) => row.id === "MAT-0646");
const issues = [];
if (!item || !peer) issues.push("分數加法題目缺失");
else {
  if (!item.question.includes("上午") || !item.question.includes("還剩下全長的幾分之幾")) issues.push("MAT-0651 未成為分段行程剩餘比例題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 3 || item.options[item.answer] !== "3/7") issues.push("MAT-0651 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("2/7＋2/7＝4/7")) || !item.solutionSteps?.some((step) => step.includes("1－4/7＝3/7")) || !item.explanation?.includes("3/7")) issues.push("MAT-0651 缺少兩段累加與剩餘量計算");
  if (!item.teacherTip?.includes("整體視為 1")) issues.push("MAT-0651 教師提醒未指出整體單位量");
  if (item.question === peer.question) issues.push("MAT-0651 仍與 MAT-0646 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0651 like-denominator addition plus remaining-fraction reasoning passed.");
