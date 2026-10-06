import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [1, "有絲分裂，染色體數通常維持相同", "細胞分裂與組織修復", "生物"],
  [2, "倒立、縮小、實像", "透鏡成像與焦距", "理化"],
  [3, "聚合型板塊邊界", "板塊邊界與地震火山", "地球科學"],
  [1, "0.4 A", "並聯電路電流分流", "理化"],
  [0, "封住傷口以減少失血，並降低病原進入的機會", "血液凝固與傷口防護", "生物"],
  [1, "氯化鈉和水", "酸鹼中和與粒子", "理化"],
  [2, "地球自轉軸傾斜，使北半球較朝向太陽，日照時間及太陽高度增加", "地軸傾斜與季節日照", "地球科學"],
  [2, "粒子彼此接近但可互相滑動", "物質狀態與粒子排列", "理化"],
  [3, "生態演替由先驅生物開始，逐步改變環境並形成較複雜的群落", "生態演替與先驅生物", "生物"],
  [0, "30 J", "功與能量轉換", "理化"],
  [1, "等於 5 N", "浮力與排水體積", "理化"],
  [2, "酵素作用部位的形狀與特定受質相配，澱粉酶可催化澱粉而非蛋白質", "酵素專一性與受質", "生物"],
  [3, "偏向法線，且速率降低", "折射與光路", "理化"],
  [0, "甲地附近氣壓梯度較大，風通常較強", "等壓線疏密與風速", "地球科學"],
  [1, "配子中基因組合的變異", "染色體互換與遺傳變異", "生物"],
  [2, "32 g", "化學反應質量比", "理化"],
  [3, "變質岩", "岩石循環與變質作用", "地球科學"],
  [0, "胸腔內壓降低，外界空氣在壓力差作用下流入", "肺泡氣體交換", "生物"],
  [1, "通常增加，但不同物質有差異", "溶解與溫度因素", "理化"],
  [2, "3 m/s²", "牛頓第二運動定律", "理化"],
];
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(341 + offset).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  const [answer, option, knowledgePoint, unit] = expected[offset];
  if (!item) {
    failures.push(`${id}: missing`);
    continue;
  }
  if (item.answer !== answer || item.options?.length !== 4 || item.options?.[answer] !== option) failures.push(`${id}: answer/options mismatch`);
  if (item.knowledgePoint !== knowledgePoint || item.unit !== unit) failures.push(`${id}: knowledge point/unit mismatch`);
  if (!item.question || !item.explanation || !item.teacherTip || item.solutionSteps?.length < 3) failures.push(`${id}: missing worked teaching content`);
  if (new Set(item.options || []).size !== 4) failures.push(`${id}: duplicate options`);
}
const neutralization = rows.find(row => row.id === "SCI-0346");
const ecologicalSuccession = rows.find(row => row.id === "SCI-0349");
if (!neutralization?.question.includes("恰好完全中和的比例") || neutralization.question.includes("足量鹽酸")) failures.push("SCI-0346: neutralization stem must specify stoichiometric amounts, not excess acid");
if (ecologicalSuccession?.knowledgePoint !== "生態演替與先驅生物") failures.push("SCI-0349: knowledge point must match ecological succession");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0341–0360 answer keys, options, knowledge points, units, and worked solutions passed.");
