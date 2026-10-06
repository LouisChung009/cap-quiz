import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "math.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const revisions = new Map([
  ["MAT-0156", {
    knowledgePoint: "固定周長的矩形面積比較",
    question: "一個正方形與一個長方形的周長都是 32 公分。正方形邊長為 8 公分，長方形長 10 公分、寬 6 公分。哪個圖形的面積較大，大多少平方公分？",
    options: ["長方形大 4 平方公分", "兩者相同", "正方形大 4 平方公分", "正方形大 8 平方公分"],
    answer: 2,
    explanation: "正方形面積為 8×8＝64 平方公分；長方形面積為 10×6＝60 平方公分。正方形大 64−60＝4 平方公分，答案 C。兩者周長相同，不代表面積相同。",
    solutionSteps: ["先算正方形面積：8×8＝64 平方公分。", "再算長方形面積：10×6＝60 平方公分。", "64−60＝4，正方形面積較大 4 平方公分，選 C。"],
    teacherTip: "固定周長的不同矩形面積未必相同；比較時要分別求面積，不能只憑周長判斷。"
  }],
  ["MAT-0351", {
    question: "一個長方形長 12 公分、寬 5 公分。若長減少 1 公分、寬增加 1 公分，周長仍不變；面積會如何改變？",
    options: ["減少 6 平方公分", "增加 6 平方公分", "不變", "增加 12 平方公分"],
    answer: 1,
    explanation: "原面積為 12×5＝60 平方公分。調整後長 11 公分、寬 6 公分，周長仍是 2×(11＋6)＝34 公分，面積為 66 平方公分，因此增加 66−60＝6 平方公分，答案 B。",
    solutionSteps: ["先算原面積：12×5＝60 平方公分。", "新長寬為 11、6，周長 2×(11＋6)＝34，確實不變；新面積 11×6＝66。", "面積增加 66−60＝6 平方公分，選 B。"],
    teacherTip: "周長固定時，長寬此消彼長，面積仍可能改變；題目問面積改變量，須算新舊面積差。"
  }],
  ["MAT-0538", {
    knowledgePoint: "長方形內框與面積差",
    question: "一座長 20 公尺、寬 14 公尺的長方形花圃，沿內側四周鋪設寬 1 公尺的步道。步道內部可種植的長方形區域面積是多少平方公尺？",
    options: ["204", "224", "196", "216"],
    answer: 3,
    explanation: "步道沿內側四周各占 1 公尺，所以種植區的長為 20−2＝18 公尺，寬為 14−2＝12 公尺。種植面積為 18×12＝216 平方公尺，答案 D。",
    solutionSteps: ["內側步道在長、寬的兩端各占 1 公尺，種植區長為 18 公尺、寬為 12 公尺。", "計算種植區面積：18×12＝216 平方公尺。", "題目問的是步道內部區域，不是整座花圃或步道面積，選 D。"],
    teacherTip: "環繞四邊的內側步道會讓長與寬各減去兩個步道寬度；先求內部尺寸再求面積。"
  }],
  ["MAT-0668", {
    knowledgePoint: "畢氏定理與長方形面積",
    question: "一個長方形的對角線長 13 公分，其中一邊長 5 公分。這個長方形的面積是多少平方公分？",
    options: ["30", "48", "60", "65"],
    answer: 2,
    explanation: "長方形對角線與兩邊形成直角三角形。另一邊長為 √(13²−5²)＝√144＝12 公分，因此面積為 5×12＝60 平方公分，答案 C。",
    solutionSteps: ["對角線是直角三角形的斜邊，設另一邊為 x，則 x²＋5²＝13²。", "x²＝169−25＝144，因長度為正，x＝12 公分。", "面積為 5×12＝60 平方公分，選 C。"],
    teacherTip: "長方形對角線不是邊長；先用畢氏定理求另一邊，再用長乘寬求面積。"
  }]
]);

for (const [id, revision] of revisions) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing target ${id}`);
  Object.assign(row, revision);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Reworked ${revisions.size} repeated rectangle-template items into distinct reasoning tasks.`);
