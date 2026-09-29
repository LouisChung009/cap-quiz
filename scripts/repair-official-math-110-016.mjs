import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find((item) => item.id === "OFF-0105");

if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== 16) {
  throw new Error("Unexpected or missing 110 math Q16 source item OFF-0105");
}

Object.assign(question, {
  question: "圖（六）為某超商促銷：任一個飯糰加一瓶指定飲料，每組優惠價 39 元。阿賢買相差 4 元的兩種飯糰各 1 個結帳時，店員說：「要不要多買 2 瓶指定飲料？搭配促銷後 2 組優惠價的金額，只比你買 2 個飯糰的金額多 30 元。」若阿賢只多買 1 瓶指定飲料，且店員以對消費者最便宜的方式結帳，則與原本只買 2 個飯糰相比，他要多付多少元？",
  options: ["12 元", "13 元", "15 元", "16 元"],
  answer: 1,
  explanation: "答案 B「13 元」。設較便宜的飯糰為 x 元，另一種為 x+4 元。兩組優惠價共 78 元，依題意比兩個飯糰原價多 30 元，故 78=(x+x+4)+30，解得 x=22，另一種為 26 元。只買一瓶飲料時，最便宜方式是讓 26 元飯糰搭配飲料用 39 元優惠，再加 22 元飯糰，合計 61 元；原本兩個飯糰為 48 元，多付 61−48=13 元。",
  solutionSteps: [
    "設較便宜飯糰為 x 元，另一種為 x+4 元；兩個飯糰原價合計 2x+4 元。",
    "兩組促銷價為 2×39=78 元，且比兩個飯糰原價多 30 元，所以 2x+4+30=78，解得 x=22；兩種飯糰價格為 22 元與 26 元。",
    "只買一瓶飲料時，讓 26 元飯糰搭配指定飲料用 39 元優惠，另加 22 元飯糰，最便宜總額為 39+22=61 元；原價兩飯糰是 22+26=48 元，因此多付 61−48=13 元，選 B。"
  ],
  teacherTip: "促銷比較題先分清楚「原價合計」和「優惠組合價」，再依最便宜的搭配方式比較總額。",
  requiresImage: false,
  requiresContext: false
});
delete question.questionImage;
delete question.questionImages;

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired 110 math Q16 promotion text, choices, and worked explanation.");
