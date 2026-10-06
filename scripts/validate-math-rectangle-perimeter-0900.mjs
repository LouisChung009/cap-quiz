import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0900");
const peer = bank.find((row) => row.id === "MAT-0602");
const issues = [];
if (!item || !peer) issues.push("長方形面積題缺失");
else {
  if (!item.question.includes("周長") || !item.question.includes("面積")) issues.push("MAT-0900 未加入周長限制情境");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 2 || item.options[item.answer] !== "54 平方公分") issues.push("MAT-0900 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("2(長＋寬)")) || !item.solutionSteps?.some((step) => step.includes("54")) || !item.explanation?.includes("54 平方公分")) issues.push("MAT-0900 缺少由周長列式與求面積步驟");
  if (!item.teacherTip?.includes("周長")) issues.push("MAT-0900 教師提醒缺少周長關係");
  if (item.question === peer.question) issues.push("MAT-0900 仍與 MAT-0602 重複題幹");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0900 rectangle perimeter constraint, derived area, and non-duplicate reasoning passed.");
