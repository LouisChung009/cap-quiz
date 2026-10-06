import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const item = rows.find(row => row.id === "MAT-0891");
const issues = [];
if (!item) issues.push("MAT-0891 不存在");
else {
  if (item.answer !== 2 || item.options?.[item.answer] !== "16π") issues.push("答案索引或正確選項錯誤");
  if (item.unit !== "幾何" || item.knowledgePoint !== "圓面積" || item.difficulty !== "中等") issues.push("分類或難度不符兩步題要求");
  if (!item.question.includes("鏤空") || !item.question.includes("5 公尺") || !item.question.includes("3 公尺")) issues.push("題幹材料缺失");
  if (!item.solutionSteps?.some(step => step.includes("25π－9π＝16π")) || item.solutionSteps.length < 3) issues.push("逐步解題不完整");
  if (!item.teacherTip?.includes("大圓面積減小圓面積")) issues.push("教師提醒缺失");
}
if (issues.length) {
  console.error(issues.join("\n"));
  process.exit(1);
}
console.log("MAT-0891 ring-area context, answer, and solution passed.");
