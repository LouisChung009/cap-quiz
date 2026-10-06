import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "math.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const changes = new Map([
  ["MAT-0711", {
    question: "一個平行四邊形的面積是 126 平方公分，底長 18 公分。對應的垂直高是多少公分？",
    options: ["6 公分", "7 公分", "8 公分", "9 公分"],
    answer: 1,
    explanation: "平行四邊形面積＝底×高，因此高＝面積÷底＝126÷18＝7 公分，答案 B。",
    solutionSteps: ["用底乘高求面積；反求高時以面積除以底。", "126÷18＝7。", "對應的垂直高為 7 公分，選 B；不可把斜邊當成高。"],
    teacherTip: "反求平行四邊形的高要以面積除以底，並確認題目給的是對應底長。"
  }],
  ["MAT-0597", {
    question: "一個圓柱體積為 45π 立方公分，高為 5 公分。它的底面半徑是多少公分？",
    options: ["2 公分", "3 公分", "4 公分", "5 公分"],
    answer: 1,
    explanation: "圓柱體積 V＝πr²h。45π＝π×r²×5，約去 π 後 r²＝9；半徑取正值，所以 r＝3 公分，答案 B。",
    solutionSteps: ["由 V＝πr²h 代入 45π＝πr²×5。", "兩邊除以 5π，得 r²＝9。", "半徑為正數，r＝3 公分，選 B。"],
    teacherTip: "反求半徑時要先除以 π 和高，再開平方根；半徑不取負值。"
  }],
  ["MAT-0648", {
    question: "一個長方體體積為 90 立方公分，底面長 3 公分、寬 3 公分。它的高是多少公分？",
    options: ["8 公分", "9 公分", "12 公分", "10 公分"],
    answer: 3,
    explanation: "長方體體積＝底面積×高。底面積為 3×3＝9 平方公分，因此高＝90÷9＝10 公分，答案 D。",
    solutionSteps: ["先算底面積：3×3＝9 平方公分。", "用體積除以底面積求高：90÷9＝10。", "長方體的高為 10 公分，選 D。"],
    teacherTip: "反求長方體高時用體積除以底面積，並檢查立方單位除以平方單位後得到長度。"
  }],
  ["MAT-0487", {
    question: "一個梯形的上底為 8 公分、下底為 16 公分，面積為 72 平方公分。兩底之間的垂直高是多少公分？",
    options: ["4 公分", "5 公分", "6 公分", "8 公分"],
    answer: 2,
    explanation: "梯形面積 A＝(上底＋下底)×高÷2。72＝(8＋16)×h÷2＝12h，所以 h＝6 公分，答案 C。",
    solutionSteps: ["先計算兩底和的一半：(8＋16)÷2＝12。", "梯形面積等於 12×高，因此高＝72÷12＝6 公分。", "兩底間的垂直高為 6 公分，選 C。"],
    teacherTip: "反求梯形的高，可用面積除以兩底和的一半；高是垂直距離，不是斜邊。"
  }],
  ["MAT-0964", {
    question: "一個沒有上蓋的長方體收納盒，長 2 公分、寬 3 公分、高 4 公分。製作盒身至少需要多少平方公分的材料？（不計接縫）",
    options: ["38 平方公分", "42 平方公分", "48 平方公分", "46 平方公分"],
    answer: 3,
    explanation: "無上蓋收納盒包含底面與四個側面：底面 2×3＝6；兩個長側面共 2×(2×4)＝16；兩個寬側面共 2×(3×4)＝24。總面積 6＋16＋24＝46 平方公分，答案 D。",
    solutionSteps: ["盒底面積為 2×3＝6 平方公分。", "四個側面面積合計為 2×2×4＋2×3×4＝16＋24＝40 平方公分。", "不含上蓋，材料面積為 6＋40＝46 平方公分，選 D。"],
    teacherTip: "無上蓋盒子不計頂面；逐一列出底面與兩組側面，避免誤用完整長方體表面積。"
  }]
]);

for (const [id, revision] of changes) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing target ${id}`);
  Object.assign(row, revision);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Reworked ${changes.size} formula-recall clones into reverse-calculation and real-use geometry tasks.`);
