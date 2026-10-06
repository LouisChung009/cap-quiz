import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [2, "氧氣產量趨近平緩，表示二氧化碳不再是唯一限制因素"],
  [3, "乙葉片較可能變藍黑；結果支持二氧化碳是光合作用原料之一"],
  [0, "植物葉片散失到空氣中的水蒸氣凝結"], [1, "1/4"],
  [2, "能量由生產者傳向消費者，部分會散失為熱，需持續由外界輸入"],
  [3, "仍可發亮，因為另一支路仍形成閉合電路"], [0, "340 公尺"],
  [1, "水層底部，因為鐵珠密度大於水與油"],
  [2, "地球自轉軸傾斜，且公轉使北半球此時朝向太陽傾斜"],
  [3, "暖鋒，暖空氣沿冷空氣上方緩慢爬升"],
  [0, "水分子由薯條細胞向外移動"], [1, "記憶細胞辨識相同抗原並迅速增殖"],
  [3, "44 g"], [2, "溶液呈酸性，氫離子濃度大於純水"],
  [2, "水的比熱較大，相同質量升高相同溫度需要較多熱量"],
  [1, "20,000 Pa"], [3, "4 m/s²"],
  [0, "折射後會聚於透鏡另一側主軸上的焦點"], [0, "0.12 度"],
  [1, "月球軌道面相對地球公轉軌道面有傾斜"],
];
const expectedUnits = new Map([["SCI-0220", "地球科學"], ["SCI-0229", "地球科學"]]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(221 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  const [answer, answerText] = expected[offset];
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== answerText) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing prompt or worked explanation`);
  if (expectedUnits.has(id) && row.unit !== expectedUnits.get(id)) failures.push(`${id}: incorrect subject unit (${row.unit})`);
}
const contentExpectations = [
  ["SCI-0221", "二氧化碳供應量不同", "氧氣產量趨近平緩"],
  ["SCI-0222", "氫氧化鈉溶液以吸收二氧化碳", "二氧化碳是光合作用原料之一"],
  ["SCI-0225", "太陽能被植物固定", "單向流動"],
];
for (const [id, questionClue, explanationClue] of contentExpectations) {
  const row = rows.find(item => item.id === id);
  if (!row?.question.includes(questionClue) || !`${row.explanation} ${row.solutionSteps.join(" ")}`.includes(explanationClue)) {
    failures.push(`${id}: distinct replacement concept or reasoning is missing`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0221–0240 answer keys, explanations, metadata, and duplicate-template replacements passed.");
