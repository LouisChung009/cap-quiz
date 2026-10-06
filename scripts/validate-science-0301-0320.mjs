import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [2, "蝌蚪可取得的食物減少，族群可能下降"], [3, "逐漸升高，並向中性靠近"],
  [0, "6 cm"], [1, "具有選擇性通透，可調節物質進出"],
  [2, "仍可發亮，因為另一支路仍形成完整電路"], [3, "空氣中的水蒸氣接觸較冷的葉面後凝結"],
  [0, "原有變異中較適合環境的深色個體繁殖較多，使族群比例改變"], [1, "2 N"],
  [2, "2：1"], [3, "物質可循環利用，能量則沿食物鏈傳遞並逐漸散失"],
  [0, "浮在水面且部分露出"], [1, "氯化鈉和水"], [2, "P 波傳播速度通常較快"],
  [3, "約 7 g 二氧化碳逸散到空氣中，若把逸散氣體也計入總系統，質量仍守恆"],
  [0, "2 A"], [1, "潮濕環境通常有利分解者活動，使枯葉分解較快"],
  [2, "10 條"], [3, "減小"],
  [0, "氣流沿迎風坡上升冷卻凝結，越嶺後下沉增溫而較乾燥"],
  [1, "柏油地逕流較多，因雨水較難滲入地面"],
];
const units = new Map([
  ["SCI-0311", "物質與密度"], ["SCI-0312", "化學反應與粒子"],
  ["SCI-0315", "電與磁"], ["SCI-0316", "生物"],
  ["SCI-0317", "遺傳與演化"], ["SCI-0318", "力與運動"],
]);
const revised = new Map([
  ["SCI-0305", ["並聯支路", "另一支路"]],
  ["SCI-0316", ["烘乾至恆重", "乾質量", "主要差異是水分"]],
  ["SCI-0319", ["迎風坡", "下沉增溫", "背風坡"]],
  ["SCI-0320", ["不透水柏油", "地表逕流", "地下水補注"]],
]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(301 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  const [answer, answerText] = expected[offset];
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== answerText) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing prompt or worked explanation`);
  if (units.has(id) && row.unit !== units.get(id)) failures.push(`${id}: incorrect subject unit`);
}
for (const [id, clues] of revised) {
  const row = rows.find(item => item.id === id);
  const content = row ? `${row.question} ${row.explanation} ${row.solutionSteps.join(" ")}` : "";
  if (clues.some(clue => !content.includes(clue))) failures.push(`${id}: revised concept/evidence is missing`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0301–0320 answer keys, explanations, metadata, and distinct concepts passed.");
