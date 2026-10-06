import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [2, "望，月面大部分明亮", "月相與日地月位置", "地球科學"],
  [3, "月球軌道平面相對地球公轉軌道面傾斜，多數望月時未完全排成直線", "月球軌道傾角與月食", "地球科學"],
  [0, "彈性位能轉為地震波能量", "板塊運動與地震", "地球科學"],
  [1, "鋒面附近雲量增加及降雨", "鋒面與降雨", "地球科學"],
  [2, "甲", "地層與化石判讀", "地球科學"],
  [3, "30 公尺／公里", "等高線地形圖與坡度", "地球科學"],
  [0, "月球引力及地球自轉下海水分布變化", "潮汐與天體引力", "地球科學"],
  [1, "砂礫層與黏土層交界附近的砂礫層中", "地下水滲透與不透水層", "地球科學"],
  [2, "氣溫下降，風向及降雨也可能改變", "氣團與天氣變化", "地球科學"],
  [3, "地球與火星公轉速度不同造成相對位置改變", "太陽系行星與公轉", "地球科學"],
];
const evidence = new Map([
  ["SCI-0382", ["農曆十五", "並非每次望月都會發生月食", "月球軌道平面", "軌道交點"]],
  ["SCI-0386", ["等高線間隔為 20 公尺", "100 公尺", "160 公尺", "2 公里", "60÷2＝30"]],
  ["SCI-0388", ["砂礫層", "緻密黏土層", "交界上方", "不透水層"]],
]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(381 + offset).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  const [answer, option, knowledgePoint, unit] = expected[offset];
  if (!item) {
    failures.push(`${id}: missing`);
    continue;
  }
  if (item.answer !== answer || item.options?.length !== 4 || item.options?.[answer] !== option) failures.push(`${id}: answer/options mismatch`);
  if (new Set(item.options || []).size !== 4) failures.push(`${id}: duplicate options`);
  if (item.knowledgePoint !== knowledgePoint || item.unit !== unit) failures.push(`${id}: unit/knowledge-point mismatch`);
  if (!item.explanation || !item.teacherTip || item.solutionSteps?.length < 3) failures.push(`${id}: incomplete worked teaching content`);
  const content = `${item.question} ${item.explanation} ${item.solutionSteps.join(" ")}`;
  if (evidence.has(id) && evidence.get(id).some(clue => !content.includes(clue))) failures.push(`${id}: revised evidence/context missing`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0381–0390 answer keys, options, evidence, metadata, and worked explanations passed.");
