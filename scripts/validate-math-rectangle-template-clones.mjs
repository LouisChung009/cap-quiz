import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const expected = new Map([
  ["MAT-0037", [0, "比與比例的長方形面積", "150", "25÷5＝5", "按比的總份數分配"]],
  ["MAT-0179", [0, "二元一次聯立方程式與情境應用", "7 張", "40x＝320", "回答題目指定的票種"]],
  ["MAT-0704", [3, "固定周長的正方形與長方形面積比較", "正方形大 6.25 平方公分", "72.25－66＝6.25", "相同周長不代表相同面積"]],
  ["MAT-0156", [2, "固定周長的矩形面積比較", "正方形大 4 平方公分", "64−60＝4", "固定周長"]],
  ["MAT-0351", [1, "周長與面積關係", "增加 6 平方公分", "66−60＝6", "新舊面積差"]],
  ["MAT-0538", [3, "長方形內框與面積差", "216", "18×12＝216", "兩個步道寬度"]],
  ["MAT-0668", [2, "畢氏定理與長方形面積", "60", "√144＝12", "畢氏定理"]]
]);
const errors = [];
for (const [id, [answer, knowledgePoint, correctOption, evidence, tip]] of expected) {
  const item = rows.find(row => row.id === id);
  if (!item || item.answer !== answer || item.knowledgePoint !== knowledgePoint || item.options?.length !== 4 || new Set(item.options).size !== 4 || item.options[answer] !== correctOption || item.solutionSteps?.length !== 3 || !item.explanation.includes(evidence) || !item.teacherTip.includes(tip)) errors.push(`${id}: required distinct geometry reasoning, answer, or worked explanation missing`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Four rectangle-template replacements pass area-comparison, area-change, inner-frame, and Pythagorean checks.");
