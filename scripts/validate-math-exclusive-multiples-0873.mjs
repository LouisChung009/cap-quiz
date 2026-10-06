import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0873");
const peer = bank.find((row) => row.id === "MAT-0853");
const issues = [];
if (!item || !peer) issues.push("倍數事件題目缺失");
else {
  if (!item.question.includes("但不能同時") || !item.question.includes("2 的倍數或 3 的倍數")) issues.push("MAT-0873 未成為互斥重疊條件題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 0 || item.options[item.answer] !== "1/2") issues.push("MAT-0873 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("10＋6−2×3")) || !item.solutionSteps?.some((step) => step.includes("10/20＝1/2")) || !item.explanation?.includes("恰好符合一個條件")) issues.push("MAT-0873 缺少交集扣兩次的解題過程");
  if (!item.teacherTip?.includes("扣兩次")) issues.push("MAT-0873 教師提醒未指出互斥條件的交集處理");
  if (item.question === peer.question) issues.push("MAT-0873 仍與 MAT-0853 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0873 exclusive multiples event and double-subtracted overlap passed.");
