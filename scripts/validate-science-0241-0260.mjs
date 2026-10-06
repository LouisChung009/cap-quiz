import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [2, "由肺泡擴散進入微血管中的血液"], [3, "空氣中的水蒸氣接觸冷罐後凝結"],
  [0, "線圈匝數增加，使相同電流產生較強磁性"], [1, "兩者週期大致相同，質量不是此條件下的決定因素"],
  [1, "60 J"], [1, "4 g"], [2, "兩者是同一元素的同位素，質量數不同"],
  [3, "甲站較遠，因為 P、S 波到時差較大"], [0, "A 型"], [2, "0.075 mm"],
  [0, "12 條，每條染色體含兩條姐妹染色分體"], [1, "8%"],
  [2, "空氣中的水蒸氣凝結成小水滴或冰晶"], [3, "40 m"], [0, "4 A"],
  [1, "乙反應較快，但兩組最後產生的二氧化碳總量相同"],
  [2, "地球大致位於太陽與月球之間"], [3, "180 g"], [0, "酸性"], [1, "0.75 g/cm³"],
];
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(241 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  const [answer, answerText] = expected[offset];
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== answerText) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing prompt or worked explanation`);
}
const distinctChecks = [
  ["SCI-0249", "抗 A 血清", "血型抗原與凝集反應"],
  ["SCI-0252", "1,600 kJ ÷ 20,000 kJ × 100%＝8%", "能量傳遞效率計算"],
  ["SCI-0255", "兩個 6 Ω 電阻並聯", "並聯電阻與總電流"],
  ["SCI-0256", "粉末只改變速率，不改變總量", "反應速率與接觸面積"],
];
for (const [id, clue, point] of distinctChecks) {
  const row = rows.find(item => item.id === id);
  if (!row?.question.includes(clue) && !`${row?.explanation} ${row?.solutionSteps?.join(" ")}`.includes(clue)) failures.push(`${id}: distinct replacement is missing`);
  if (row?.knowledgePoint !== point) failures.push(`${id}: incorrect knowledge point`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0241–0260 answer keys, explanations, and distinct concepts passed.");
