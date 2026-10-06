import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "math.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const revisions = new Map([
  ["MAT-0831", {
    knowledgePoint: "正多邊形外角與邊數",
    difficulty: "基礎",
    question: "一個正多邊形的每個外角都是 40°。這個正多邊形有幾條邊？",
    options: ["7 條", "8 條", "10 條", "9 條"],
    answer: 3,
    explanation: "凸多邊形各外角和為 360°；正多邊形每個外角相等，因此邊數＝360°÷40°＝9，答案 D。",
    solutionSteps: ["多邊形一周的外角和是 360°。", "正多邊形每個外角都是 40°，所以邊數為 360÷40＝9。", "這個正多邊形有 9 條邊，選 D。"],
    teacherTip: "正多邊形的邊數可用 360° 除以一個外角；別把內角和公式套用在外角。"
  }],
  ["MAT-0460", {
    knowledgePoint: "等差數列通項",
    question: "音樂廳座位每列比前一列多 4 個：第 1 列有 5 個，第 2 列有 9 個。第 12 列有多少個座位？",
    options: ["45 個", "48 個", "53 個", "49 個"],
    answer: 3,
    explanation: "座位數形成首項 5、公差 4 的等差數列。第 12 列座位數＝5＋(12−1)×4＝5＋44＝49 個，答案 D。本題問第 12 列，不是前 12 列總數。",
    solutionSteps: ["辨認首項 a₁＝5、公差 d＝4。", "第 12 項使用 a₁₂＝a₁＋11d＝5＋11×4。", "第 12 列有 49 個座位，選 D；不要把各列座位數相加。"],
    teacherTip: "分清第 n 列的數量與前 n 列總數；前者用等差數列通項，後者才用等差級數。"
  }],
  ["MAT-0340", {
    knowledgePoint: "長方體體積",
    question: "一個長方體體積為 60 立方公分，底面長 5 公分、寬 4 公分。它的高是多少公分？",
    options: ["2 公分", "4 公分", "6 公分", "3 公分"],
    answer: 3,
    explanation: "長方體體積＝長×寬×高。底面積為 5×4＝20 平方公分，所以高＝60÷20＝3 公分，答案 D。",
    solutionSteps: ["先求底面積：5×4＝20 平方公分。", "以體積除以底面積求高：60÷20＝3。", "長方體高為 3 公分，選 D；單位由立方公分除以平方公分得到公分。"],
    teacherTip: "反求長方體高度用體積除以底面積；注意結果應是長度單位。"
  }],
  ["MAT-0747", {
    knowledgePoint: "菱形面積",
    difficulty: "基礎",
    question: "菱形的兩條對角線長分別為 10 公分與 24 公分，面積是多少平方公分？",
    options: ["44 平方公分", "80 平方公分", "120 平方公分", "176 平方公分"],
    answer: 2,
    explanation: "菱形面積等於兩條對角線乘積的一半：10×24÷2＝120 平方公分，答案 C。",
    solutionSteps: ["取菱形兩條對角線長 10 公分和 24 公分。", "套用面積公式：對角線乘積÷2＝10×24÷2。", "面積為 120 平方公分，選 C。"],
    teacherTip: "菱形面積用兩條對角線相乘再除以 2；不要誤用梯形的兩底和乘高公式。"
  }],
  ["MAT-0645", {
    knowledgePoint: "三角形內外角互補",
    difficulty: "基礎",
    question: "三角形的一個外角為 120°。與這個外角相鄰的內角是多少度？",
    options: ["60°", "70°", "50°", "120°"],
    answer: 0,
    explanation: "三角形一個外角與其相鄰內角形成一直線，兩角互補，和為 180°。相鄰內角＝180°−120°＝60°，答案 A。",
    solutionSteps: ["外角與同一頂點的相鄰內角形成一直線。", "一直線上的鄰角和為 180°，所以內角＝180°−120°。", "相鄰內角為 60°，選 A；外角定理所指的是兩個不相鄰內角和。"],
    teacherTip: "相鄰內角與外角互補；不要把它和「外角等於兩個不相鄰內角和」混為一談。"
  }],
  ["MAT-0648", {
    knowledgePoint: "立體圖形縮放與體積倍率",
    difficulty: "中等",
    question: "一個長方體的長、寬、高都放大為原來的 2 倍，體積會變成原來的幾倍？",
    options: ["4 倍", "6 倍", "2 倍", "8 倍"],
    answer: 3,
    explanation: "長方體體積為長×寬×高。三個維度各放大 2 倍，新體積倍率為 2×2×2＝8，因此體積變成 8 倍，答案 D。",
    solutionSteps: ["設原長、寬、高為 l、w、h，原體積是 lwh。", "三邊都放大 2 倍後，新體積為 (2l)(2w)(2h)＝8lwh。", "新體積是原來的 8 倍，選 D；不能只乘一個維度倍率。"],
    teacherTip: "立體圖形三個方向的長度都改變，體積倍率要將三個長度倍率相乘；邊長倍增時體積增為八倍。"
  }],
  ["MAT-0857", {
    knowledgePoint: "二次方程式與畢氏定理的面積建模",
    question: "長方形花圃的長比寬多 1 公尺，面積為 12 平方公尺。由花圃一角走到對角的直線距離是多少公尺？",
    options: ["3 公尺", "4 公尺", "5 公尺", "6 公尺"],
    answer: 2,
    explanation: "設寬為 x 公尺、長為 x＋1，則 x(x＋1)＝12，解得 x＝3 或 −4；長度取正值，所以花圃為 3×4 公尺。對角線長為 √(3²＋4²)＝5 公尺，答案 C。",
    solutionSteps: ["依長寬差與面積列式 x(x＋1)＝12，因式分解得 (x−3)(x＋4)＝0。", "寬取正值 3 公尺，長為 4 公尺。", "對角線用畢氏定理：√(3²＋4²)＝5 公尺，選 C。"],
    teacherTip: "先由面積和長寬差求矩形尺寸，再用畢氏定理；負根不符合長度情境。"
  }],
  ["MAT-0944", {
    knowledgePoint: "菱形對角線與面積反求",
    difficulty: "中等",
    question: "菱形面積為 80 平方公分，其中一條對角線長 10 公分。另一條對角線長多少公分？",
    options: ["8 公分", "12 公分", "16 公分", "20 公分"],
    answer: 2,
    explanation: "菱形面積＝兩對角線乘積÷2。設另一對角線為 d，80＝10×d÷2，故 d＝160÷10＝16 公分，答案 C。",
    solutionSteps: ["設未知對角線為 d，列式 80＝10d÷2。", "兩邊乘 2 得 160＝10d，再除以 10。", "另一條對角線長 16 公分，選 C。"],
    teacherTip: "反求對角線時要把面積公式倒過來；兩條對角線乘積是面積的兩倍。"
  }]
]);

for (const [id, revision] of revisions) {
  const row = rows.find(item => item.id === id);
  if (!row) throw new Error(`Missing target ${id}`);
  Object.assign(row, revision);
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Repaired one answer/explanation mismatch and diversified ${revisions.size - 1} math templates.`);
