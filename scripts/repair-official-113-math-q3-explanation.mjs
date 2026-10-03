import { readFile, writeFile } from "node:fs/promises";

const path = "data/mission-questions.json";
const rows = JSON.parse(await readFile(path, "utf8"));
const question = rows.find(item => item.id === "OFF-0748");
if (!question) throw new Error("OFF-0748 not found");
if (!question.solutionSteps[0].startsWith("由題圖讀出聯立式")) throw new Error("Unexpected solution; refusing to overwrite");

question.explanation = "答案是 C「−4」。將 y＝−3x 代入 5x−3y＝28，得 5x−3(−3x)＝28，即 14x＝28，所以 x＝2、y＝−6。題目指定 a＝x、b＝y，因此 a＋b＝2＋(−6)＝−4。";
question.solutionSteps = [
  "題目已給 y＝−3x，代入 5x−3y＝28，得到 5x−3(−3x)＝28。",
  "合併同類項得 14x＝28，所以 x＝2；再代回 y＝−3x 得 y＝−6。",
  "a＝x、b＝y，因此 a＋b＝2＋(−6)＝−4，對應選項 C。"
];

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Corrected 113 Math Q3 solution wording to match its text-only stem.");
