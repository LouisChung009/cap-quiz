import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [2, "幾丁質"], [3, "環境光照會影響性狀表現，不代表遺傳訊息必然不同"],
  [0, "二氧化碳吸收部分地表放出的紅外線並再放射，改變地球系統向外釋能的狀況"],
  [1, "向左，與速度方向相反"], [2, "4 個"],
  [3, "陸地升溫較快，陸地上空空氣上升，近地面形成較低氣壓"],
  [0, "攪拌杯中的方糖較快溶解，但平衡時的溶解度不因此改變"],
  [1, "太陽－月球－地球"], [2, "壓力變大，因為受力面積變小而作用力相同"],
  [2, "0.50 m"], [3, "韌皮部被切斷，葉片製造的糖分在剝除處上方累積"],
  [0, "較大，因氧也參與反應並進入氧化鎂"], [1, "25%"],
  [1, "甲流向乙，從高氣壓往低氣壓"], [2, "2 A"],
  [2, "0 J，因支持力方向與位移垂直"],
  [3, "海水 pH 下降，較不利於部分生物形成碳酸鈣殼"],
  [0, "大致沿原方向直線前進"],
  [1, "不同色素在流動溶劑與濾紙間作用不同，移動速度不同而分離"],
  [2, "月全食，地球位於太陽與月球之間"],
];
const expectedUnits = new Map([["SCI-0261", "生物"], ["SCI-0279", "物質與溶液"]]);
const expectedPoints = new Map([
  ["SCI-0265", "化學反應粒子數量關係"],
  ["SCI-0270", "波速頻率與波長"],
  ["SCI-0271", "韌皮部運輸有機養分"],
  ["SCI-0273", "獨立分配與配子機率"],
  ["SCI-0279", "色層分析與混合物分離"],
]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(261 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  const [answer, answerText] = expected[offset];
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== answerText) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing prompt or worked explanation`);
  if (expectedUnits.has(id) && row.unit !== expectedUnits.get(id)) failures.push(`${id}: incorrect subject unit`);
  if (expectedPoints.has(id) && row.knowledgePoint !== expectedPoints.get(id)) failures.push(`${id}: incorrect knowledge point`);
}
for (const [id, clue] of [["SCI-0265", "2H₂＋O₂→2H₂O"], ["SCI-0270", "340 m/s"], ["SCI-0271", "環狀剝除"], ["SCI-0273", "獨立分配"], ["SCI-0279", "黑色水性筆墨"]]) {
  if (!rows.find(row => row.id === id)?.question.includes(clue)) failures.push(`${id}: distinct question context is missing`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0261–0280 answer keys, explanations, metadata, and distinct concepts passed.");
