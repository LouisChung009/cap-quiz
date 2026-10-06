import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0991");
const peer = bank.find((row) => row.id === "MAT-0814");
const issues = [];
if (!item || !peer) issues.push("二次式因式分解題目缺失");
else {
  if (!item.question.includes("x²＋bx＋12") || !item.question.includes("(x＋3)")) issues.push("MAT-0991 未成為因式分解係數反推題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 3 || item.options[item.answer] !== "b＝7，另一因式為 (x＋4)" ) issues.push("MAT-0991 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("3×□＝12")) || !item.solutionSteps?.some((step) => step.includes("b＝7")) || !item.explanation?.includes("b＝7")) issues.push("MAT-0991 缺少未知係數與因式的推導過程");
  if (!item.teacherTip?.includes("交叉檢查")) issues.push("MAT-0991 教師提醒缺少展開驗算");
  if (item.question === peer.question) issues.push("MAT-0991 仍與 MAT-0814 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0991 factor-form coefficient reasoning and non-duplicate context passed.");
