import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  {
    id: "OFF-0320",
    question: "下列何者為 156 的質因數？",
    options: ["11", "12", "13", "14"],
    answer: 2,
    explanation: "156＝2×78＝2²×39＝2²×3×13。質因數必須同時是 156 的因數且為質數；四個選項中只有 13 符合，答案 C。",
    solutionSteps: ["先分解 156：156＝2×78。", "繼續分解：78＝2×39，39＝3×13，所以 156＝2²×3×13。", "質因數是分解後的質數 2、3、13；選項中只有 13，答案 C。"],
    teacherTip: "因數不一定是質數；例如 12 雖能整除 156，卻不是質數。",
    requiresImage: false,
  },
  {
    id: "OFF-0321",
    question: "圖（二）為一個長方體的展開圖，且長方體的底面為正方形。根據圖中標示的長度，求此長方體的體積為何？",
    options: ["144", "224", "264", "300"],
    answer: 1,
    explanation: "展開圖中標示 12 的橫向長度包含 3 個相同的正方形邊，因此底面邊長為 12÷3＝4。標示 22 的縱向總長包含長方體高及上下兩個底面邊長，所以高為 22−4−4＝14。體積＝底面積×高＝4²×14＝224，答案 B。",
    solutionSteps: ["橫向 12 跨過 3 個相同側面寬度，所以正方形底面邊長為 12÷3＝4。", "縱向總長 22 由長方體高和上下兩個邊長組成，高＝22−2×4＝14。", "體積＝4×4×14＝224，答案 B。"],
    teacherTip: "讀展開圖時先辨認長度跨過幾個面，再分清側面高度與底面邊長。",
    requiresImage: true,
  },
  {
    id: "OFF-0322",
    question: "算式 9/22＋11/18－（23/22－7/18）之值為何？",
    options: ["4/11", "9/10", "1/9", "5/4"],
    answer: 0,
    explanation: "先去括號：9/22＋11/18－23/22＋7/18。分母相同的項合併，得（9−23）/22＋（11＋7）/18＝−14/22＋18/18＝−7/11＋1＝4/11，答案 A。",
    solutionSteps: ["減去括號時，括號內每一項都要變號：9/22＋11/18−23/22＋7/18。", "合併同分母分數：（9−23）/22＋（11＋7）/18＝−14/22＋1。", "−14/22＝−7/11，因此 −7/11＋1＝4/11，答案 A。"],
    teacherTip: "括號前是減號時，括號內各項都要變號；最後再約分。",
    requiresImage: false,
  },
  {
    id: "OFF-0323",
    question: "√2022 的值介於下列哪兩個整數之間？",
    options: ["25、30", "30、35", "35、40", "40、45"],
    answer: 3,
    explanation: "比較鄰近的平方數：44²＝1936，45²＝2025。因為 1936＜2022＜2025，所以 44＜√2022＜45，介於 40 與 45 之間，答案 D。",
    solutionSteps: ["找出接近 2022 的完全平方數：44²＝1936。", "再算 45²＝2025，得到 1936＜2022＜2025。", "開平方後 44＜√2022＜45，因此選 40、45，答案 D。"],
    teacherTip: "估算平方根時，先找被開方數左右相鄰的完全平方數。",
    requiresImage: false,
  },
  {
    id: "OFF-0324",
    question: "已知坐標平面上有一直線 L 與一點 A。若 L 的方程式為 x＝−2，A 點坐標為（6，5），則 A 點到直線 L 的距離為何？",
    options: ["3", "4", "7", "8"],
    answer: 3,
    explanation: "直線 x＝−2 是垂直線，點到該線的垂直距離只看 x 坐標差。A 點的 x 坐標為 6，距離＝|6−（−2）|＝8，答案 D。",
    solutionSteps: ["直線 x＝−2 上每一點的 x 坐標都是 −2。", "A 點的 x 坐標為 6；垂直距離是兩個 x 坐標的差。", "|6−（−2）|＝8，答案 D。"],
    teacherTip: "點到垂直線的最短距離是水平距離，因此只需比較 x 坐標。",
    requiresImage: false,
  },
  {
    id: "OFF-0325",
    question: "多項式 39x²＋5x−14 可因式分解成（3x＋a）（bx＋c），其中 a、b、c 均為整數，求 a＋2c 之值為何？",
    options: ["−12", "−3", "3", "12"],
    answer: 0,
    explanation: "比較 x² 項係數：3b＝39，所以 b＝13。比較常數項：ac＝−14；再由一次項係數 3c＋13a＝5，找整數解可得 a＝2、c＝−7。故 a＋2c＝2＋2（−7）＝−12，答案 A。",
    solutionSteps: ["展開（3x＋a）（bx＋c），得 3b x²＋（3c＋ab）x＋ac。", "比較係數：3b＝39 得 b＝13；再解 13a＋3c＝5、ac＝−14，得 a＝2、c＝−7。", "代入所求：a＋2c＝2＋2×（−7）＝−12，答案 A。"],
    teacherTip: "先比較二次項、常數項建立條件，再檢查一次項係數是否符合。",
    requiresImage: false,
  },
];

for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.options.length !== 4 || item.solutionSteps.length !== 3) throw new Error(`Invalid or answer mismatch: ${item.id}`);
  Object.assign(row, { question: item.question, options: item.options, optionsInImage: false, requiresImage: item.requiresImage, explanation: item.explanation, solutionSteps: item.solutionSteps, teacherTip: item.teacherTip });
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Reconstructed official questions 3–8 from the 111 math source page and added worked solutions.");
