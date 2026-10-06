import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [3, "靠風帶走花粉，羽毛狀柱頭有助攔截"], [0, "木質部"],
  [1, "用帶火星木條測試"], [2, "葉片與外界的氣體交換"],
  [3, "風加快葉片周圍水蒸氣移除，使蒸散較快"], [0, "減少水分散失，但也降低二氧化碳進入"],
  [1, "細胞呼吸"], [2, "形成含氮的蛋白質與葉綠素"],
  [3, "只有部分傳遞，其餘用於生命活動或散失，總量少於 10 000"],
  [0, "燃燒使植物中的碳轉成二氧化碳釋入空氣"],
  [1, "唾液澱粉酶在高溫下活性降低，澱粉未被分解"],
  [2, "甲樹在那些年份的生長條件相對較有利，但單憑年輪寬度不能指定唯一因素"],
  [3, "18,000 kJ"], [0, "進行光合作用"], [2, "Aa × Aa"],
  [1, "乳糜管，再進入淋巴系統"], [2, "分解者"], [3, "單側光使莖產生向光性生長"],
  [0, "環境資源與限制因子使族群接近承載量"], [1, "8 條"],
];
const points = new Map([["SCI-0292", "年輪與環境條件推論"]]);
const checks = new Map([
  ["SCI-0281", ["羽毛狀柱頭", "風媒花"]], ["SCI-0285", ["有風組", "水蒸氣"]],
  ["SCI-0286", ["二氧化碳進入", "保水"]], ["SCI-0292", ["年輪寬度", "單一原因"]],
  ["SCI-0293", ["18,000", "未傳遞"]],
]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(281 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  const [answer, answerText] = expected[offset];
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== answerText) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing prompt or worked explanation`);
  if (points.has(id) && row.knowledgePoint !== points.get(id)) failures.push(`${id}: incorrect knowledge point`);
}
for (const [id, clues] of checks) {
  const row = rows.find(item => item.id === id);
  if (!row || clues.some(clue => !`${row.question} ${row.explanation} ${row.solutionSteps.join(" ")}`.includes(clue))) failures.push(`${id}: revised concept/evidence is missing`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0281–0300 answer keys, explanations, metadata, and distinct concepts passed.");
