import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0141");
const peer = bank.find((row) => row.id === "MAT-0012");
const issues = [];
if (!item || !peer) issues.push("一次方程式題目缺失");
else {
  if (!item.question.includes("3/4") || !item.question.includes("(2x－8)")) issues.push("MAT-0141 未涵蓋分數係數與分配律");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 3 || item.options[item.answer] !== "26") issues.push("MAT-0141 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("6x－24")) || !item.solutionSteps?.some((step) => step.includes("2x＝52")) || !item.explanation?.includes("x＝26")) issues.push("MAT-0141 缺少分配律及解方程步驟");
  if (!item.teacherTip?.includes("分配")) issues.push("MAT-0141 教師提醒未涵蓋分配律");
  if (item.question === peer.question) issues.push("MAT-0141 仍與 MAT-0012 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0141 fractional-coefficient equation, distributive property, and non-duplicate check passed.");
