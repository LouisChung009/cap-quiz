import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0919");
const peer = bank.find((row) => row.id === "MAT-0876");
const issues = [];
if (!item || !peer) issues.push("聯立方程式題目缺失");
else {
  if (!item.question.includes("套票") || !item.question.includes("比學生票貴多少")) issues.push("MAT-0919 未轉為套票價格差問題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 0 || item.options[item.answer] !== "2 百元") issues.push("MAT-0919 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("2a＋s＝19")) || !item.solutionSteps?.some((step) => step.includes("a＋2s＝17")) || !item.solutionSteps?.some((step) => step.includes("2 百元"))) issues.push("MAT-0919 缺少聯立消去與票價差推導");
  if (!item.teacherTip?.includes("單位")) issues.push("MAT-0919 教師提醒缺少單位提醒");
  if (item.question === peer.question) issues.push("MAT-0919 仍與 MAT-0876 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0919 bundle-equation elimination and non-duplicate reasoning passed.");
