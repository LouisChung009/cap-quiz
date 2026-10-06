import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bank = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = bank.find((row) => row.id === "MAT-0999");
const peer = bank.find((row) => row.id === "MAT-0816");
const issues = [];
if (!item || !peer) issues.push("倍數機率題目缺失");
else {
  if (!item.question.includes("不放回") || !item.question.includes("至少有 1 張")) issues.push("MAT-0999 未成為不放回補事件題");
  if (item.options?.length !== 4 || new Set(item.options).size !== 4 || item.answer !== 2 || item.options[item.answer] !== "49/87") issues.push("MAT-0999 選項或答案索引錯誤");
  if (!item.solutionSteps?.some((step) => step.includes("20/30")) || !item.solutionSteps?.some((step) => step.includes("19/29")) || !item.explanation?.includes("49/87")) issues.push("MAT-0999 缺少不放回補事件計算過程");
  if (!item.teacherTip?.includes("不放回")) issues.push("MAT-0999 教師提醒缺少不放回注意事項");
  if (item.question === peer.question) issues.push("MAT-0999 仍與 MAT-0816 題幹重複");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0999 without-replacement complement probability and non-duplicate reasoning passed.");
