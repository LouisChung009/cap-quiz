import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "math.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const revisions = new Map([
  ["MAT-0114", {
    knowledgePoint: "一次函數的 x 截距",
    question: "直線 y＝3x－5 與 x 軸交於何處？該交點的 x 座標是多少？",
    options: ["5/3", "3/5", "−5/3", "5"],
    answer: 0,
    explanation: "x 軸上所有點的 y 座標都是 0。令 y＝0，得 0＝3x－5，因此 3x＝5，x＝5/3；交點為 (5/3, 0)，答案 A。",
    solutionSteps: ["求 x 軸交點時，先令 y＝0。", "解方程式 0＝3x－5，得 3x＝5。", "所以 x＝5/3，交點 x 座標為 5/3，選 A。"],
    teacherTip: "x 截距是交點的 x 座標；求值時令 y＝0，不要把 x、y 座標顛倒。"
  }],
  ["MAT-0706", {
    knowledgePoint: "一次函數斜率與變化量",
    question: "一次函數 y＝−2x＋7 中，當 x 增加 3 時，y 的變化量是多少？",
    options: ["增加 6", "減少 6", "減少 2", "增加 3"],
    answer: 1,
    explanation: "一次函數 y＝mx＋b 的斜率 m 表示 x 每增加 1，y 的變化量為 m。此處斜率為 −2，x 增加 3，故 y 的變化量為 −2×3＝−6，也就是減少 6，答案 B。",
    solutionSteps: ["讀出斜率 m＝−2；截距 7 不影響變化量。", "x 增加 3，y 的變化量為 m×3＝−2×3＝−6。", "負變化量表示 y 減少 6，選 B。"],
    teacherTip: "斜率表示每單位 x 對 y 的變化；求變化量時乘以 x 的增量，不要再加截距。"
  }],
  ["MAT-0670", {
    question: "一張比例尺為 1：25,000 的地圖上，長方形農地長 2 公分、寬 1.2 公分。實際農地面積是多少公頃？",
    options: ["1.5 公頃", "150 公頃", "15 公頃", "0.15 公頃"],
    answer: 2,
    explanation: "地圖 1 公分代表實際 25,000 公分＝250 公尺。實際長為 2×250＝500 公尺，寬為 1.2×250＝300 公尺，面積為 500×300＝150,000 平方公尺。1 公頃＝10,000 平方公尺，所以面積為 15 公頃，答案 C。",
    solutionSteps: ["把比例尺換成實際長度：1 公分代表 250 公尺，因此農地長、寬分別為 500 公尺和 300 公尺。", "實際面積＝500×300＝150,000 平方公尺。", "150,000÷10,000＝15 公頃，選 C；面積須由實際長、寬相乘，不能只換一次比例尺。"],
    teacherTip: "比例尺先換算兩個實際邊長，再求面積；平方公尺換公頃要除以 10,000。"
  }],
  ["MAT-0146", {
    question: "火車第一段以每小時 80 公里行駛 120 公里，停靠 15 分鐘後，再以相同速度行駛 80 公里。從出發到抵達共經過多少小時？",
    options: ["2.75 小時", "2.5 小時", "3 小時", "3.25 小時"],
    answer: 0,
    explanation: "第一段行車時間為 120÷80＝1.5 小時；第二段為 80÷80＝1 小時；停靠 15 分鐘＝0.25 小時。總時間為 1.5＋1＋0.25＝2.75 小時，答案 A。",
    solutionSteps: ["分段用時間＝路程÷速度：第一段 120÷80＝1.5 小時。", "第二段 80÷80＝1 小時，停靠時間 15 分鐘＝0.25 小時。", "總經過時間＝1.5＋1＋0.25＝2.75 小時，選 A。"],
    teacherTip: "平均速度相同也要分開處理行車與停靠時間；分鐘換小時後再相加。"
  }]
]);

for (const [id, revision] of revisions) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing target ${id}`);
  Object.assign(row, revision);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Reworked ${revisions.size} high-similarity algebra and scale items into distinct reasoning tasks.`);
