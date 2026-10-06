import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0608");
const peer = bank.find((row) => row.id === "MAT-0567");
const issues = [];
if (!item || !peer) issues.push("最大公因數題目缺失");
else {
  if (!item.question.includes("緞帶") || !item.question.includes("最多") || !item.question.includes("幾段")) issues.push("MAT-0608 未成為最大等份數的情境題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 0 || item.options[item.answer] !== "5 段" ) issues.push("MAT-0608 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("gcd(84,126)＝42")) || !item.solutionSteps?.some((step) => step.includes("84÷42＝2")) || !item.explanation?.includes("5 段")) issues.push("MAT-0608 缺少最大公因數與份數檢查步驟");
  if (!item.teacherTip?.includes("段數")) issues.push("MAT-0608 教師提醒未區分段數與段長");
  if (item.question === peer.question) issues.push("MAT-0608 仍與 MAT-0567 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0608 GCD equal-piece context and count-versus-length reasoning passed.");
