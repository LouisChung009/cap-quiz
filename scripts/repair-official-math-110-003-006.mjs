import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0092": {
    question: "若二元一次聯立方程式 x = 4y、6y − x = 10 的解為 x = a、y = b，則 a + b 之值為何？",
    options: ["−15", "−3", "5", "25"],
    answer: 3,
    explanation: "答案 D「25」。由 x = 4y 代入 6y − x = 10，得 6y − 4y = 10，因此 y = 5、x = 20，故 a + b = 20 + 5 = 25。",
    solutionSteps: ["先用 x = 4y 代入另一式 6y − x = 10，得到 6y − 4y = 10。", "合併同類項得 2y = 10，所以 y = 5；再由 x = 4y 算出 x = 20。", "a = x、b = y，因此 a + b = 20 + 5 = 25，選 D。"],
    requiresImage: false
  },
  "OFF-0093": {
    question: "如圖，矩形 ABCD 與 △BDE 中，A 點在 BE 上。若矩形 ABCD 的面積為 20，△BDE 的面積為 24，則 △ADE 的面積為何？",
    options: ["10", "12", "14", "16"],
    answer: 2,
    explanation: "答案 C「14」。△BDE 的底 BE 可分成 AB 與 AE，且兩部分以 AD 為共同高，因此 △BDE 的面積等於 △BAD 與 △ADE 面積之和。△BAD 是矩形 ABCD 的一半，面積為 20 ÷ 2 = 10；所以 △ADE = 24 − 10 = 14。",
    solutionSteps: ["矩形 ABCD 的對角線 BD 把矩形分成等面積兩個三角形，所以 △BAD 面積是 20 ÷ 2 = 10。", "因 A 在 BE 上，△BDE 可沿 AD 分成 △BAD 和 △ADE，兩三角形合起來就是題目給的 24。", "因此 △ADE 面積 = 24 − 10 = 14，選 C。"],
    requiresImage: true
  },
  "OFF-0094": {
    question: "5⁶ 是 5³ 的多少倍？",
    options: ["2", "3", "25", "125"],
    answer: 3,
    explanation: "答案 D「125」。求 5⁶ 是 5³ 的幾倍，要計算 5⁶ ÷ 5³。同底數相除，指數相減，得 5⁶⁻³ = 5³ = 125。",
    solutionSteps: ["把『5⁶ 是 5³ 的多少倍』轉成比值 5⁶ ÷ 5³。", "同底數的冪相除，底數不變、指數相減：5⁶ ÷ 5³ = 5³。", "5³ = 5 × 5 × 5 = 125，選 D。"],
    requiresImage: false
  },
  "OFF-0095": {
    question: "下列等式何者不成立？",
    options: ["4√3 + 2√3 = 6√3", "4√3 − 2√3 = 2√3", "4√3 × 2√3 = 8√3", "4√3 ÷ 2√3 = 2"],
    answer: 2,
    explanation: "答案 C「4√3 × 2√3 = 8√3」不成立。左邊相乘為 4 × 2 × √3 × √3 = 8 × 3 = 24，並非 8√3。其餘三式成立：同類根式加減係數相加減；除法中 √3 約去，結果為 2。",
    solutionSteps: ["檢查 A、B：同類根式可合併係數，4√3 + 2√3 = 6√3，4√3 − 2√3 = 2√3，均成立。", "檢查 C：相乘時 √3 × √3 = 3，所以左式等於 4 × 2 × 3 = 24；右式 8√3 不等於 24。", "檢查 D：(4√3) ÷ (2√3) = (4 ÷ 2)(√3 ÷ √3) = 2，因此只有 C 不成立。"],
    requiresImage: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(-2)) - 89;
  if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== expectedNumber) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  if (!fix.requiresImage) {
    delete question.questionImage;
    delete question.questionImages;
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored original math notation and worked solutions for 110 Q3–6.");
