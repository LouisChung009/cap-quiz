import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [2, "子葉儲存的養分可支持幼苗初期生長，子葉因此逐漸消耗"], [3, "7.8 g/cm³"],
  [0, "與用電器串聯，過大電流使其熔斷並切斷電路"],
  [1, "同一地震只有一個規模，但不同地點的震度可不同"],
  [2, "小分子尿素可沿濃度差移入透析液，血球與大分子蛋白留在血液中"],
  [2, "大致維持沸點，熱量主要用於液態水轉為水蒸氣"],
  [3, "蝗蟲受到的捕食壓力降低，數量可能上升並增加對草的取食"],
  [0, "沉積期間水流能量逐漸減弱，較粗顆粒先沉降，細顆粒後沉積"],
  [1, "兩份氧氣總量相同，但加入二氧化錳的一份反應較快"],
  [2, "地球進入碎屑帶後，微小粒子高速進入大氣並發光"],
  [3, "磁場穿過線圈的變化會產生感應電流，磁鐵停住後變化消失"],
  [0, "各約 1/2，父親提供的 X 或 Y 染色體決定 XX 或 XY 組合"],
  [1, "光由水進入空氣時傳播方向改變，眼睛將光線反向延長而形成視覺位置差"],
  [2, "升高，因較冷空氣距飽和狀態更近"],
  [3, "增加皮膚散熱，幫助體溫維持在適當範圍"],
  [0, "甲反應通常較快，因單位體積內反應粒子較多"], [1, "魚鷹"],
  [2, "含二氧化碳的雨水與地下水長期溶解石灰岩"],
  [3, "固體中的離子位置固定；溶於水後離子可移動並傳導電流"],
  [0, "金屬通常比木材容易傳導熱"],
];
const units = new Map([
  ["SCI-0323", "電與磁"], ["SCI-0324", "地球科學"], ["SCI-0325", "生物"],
  ["SCI-0326", "熱與溫度"], ["SCI-0327", "生物"], ["SCI-0328", "地球科學"],
  ["SCI-0329", "化學變化與反應"], ["SCI-0330", "地球科學"],
  ["SCI-0331", "電與磁"], ["SCI-0332", "遺傳與演化"], ["SCI-0333", "光與成像"],
  ["SCI-0334", "地球科學"], ["SCI-0335", "生物體的協調"],
  ["SCI-0336", "化學變化與反應"], ["SCI-0338", "地球科學"],
  ["SCI-0339", "化學反應與粒子"],
]);
const revised = new Map([
  ["SCI-0321", ["綠豆種子", "暗處幼苗", "子葉"]],
  ["SCI-0323", ["保險絲", "串聯", "熔斷"]],
  ["SCI-0324", ["同一次地震", "地震規模", "震度"]],
  ["SCI-0325", ["透析液", "尿素", "半透膜"]],
  ["SCI-0326", ["固定氣壓", "沸點", "汽化"]],
  ["SCI-0327", ["青蛙", "蝗蟲", "捕食壓力"]],
  ["SCI-0328", ["粒徑逐漸變小", "水流能量逐漸減弱"]],
  ["SCI-0329", ["過氧化氫", "二氧化錳", "反應速率"]],
  ["SCI-0330", ["彗星", "碎屑帶", "流星雨"]],
  ["SCI-0331", ["檢流計", "磁鐵移動", "感應電流"]],
  ["SCI-0332", ["卵通常提供 X", "精子可能提供 X 或 Y"]],
  ["SCI-0333", ["筷子", "折射", "反向延長"]],
  ["SCI-0334", ["實際含量不變", "相對濕度上升", "露點"]],
  ["SCI-0335", ["出汗", "皮膚血管擴張", "散熱"]],
  ["SCI-0336", ["鎂片", "酸濃度", "有效碰撞"]],
  ["SCI-0338", ["石灰岩", "溶洞", "弱酸性水"]],
  ["SCI-0339", ["氯化鈉晶體", "溶於水", "可移動的鈉離子與氯離子"]],
  ["SCI-0340", ["金屬湯匙", "木匙", "熱傳導"]],
]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(321 + offset).padStart(4, "0")}`;
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
console.log("Science SCI-0321–0340 answer keys, explanations, metadata, and distinct concepts passed.");
