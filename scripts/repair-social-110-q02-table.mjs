import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const question = questions.find(({ id }) => id === "OFF-0117");
if (!question || question.subject !== "社會" || question.source?.year !== 110 || question.source?.questionNumber !== 2) {
  throw new Error("Unexpected or missing 110 social Q2 (OFF-0117)");
}

question.question = "【資料】臺灣四家企業為了提升競爭力採取下列方法：甲：製鞋廠從中國沿海遷到內陸；乙：紡織廠研發吸濕排汗的機能布料；丙：煉鋼廠設置在高雄臨海工業區內；丁：電子廠自東南亞引進大量外籍勞工。\n\n其中何者主要是為了增加產品附加價值？";
question.options = ["甲", "乙", "丙", "丁"];
question.answer = 1;
question.explanation = "增加產品附加價值是透過研發、設計或改善功能，讓產品更有特色並提高消費者願付的價值。乙研發吸濕排汗機能布料，直接提升紡織產品的功能與品質，因此選乙。甲遷廠主要改變生產地點與成本；丙選址於臨海工業區是區位選擇；丁引進外籍勞工是增加勞動力，都不是直接提升產品附加價值。";
question.solutionSteps = [
  "先辨認「產品附加價值」：重點是讓產品本身的功能、品質或特色提升，而非只改變工廠地點或投入要素。",
  "乙透過研發吸濕排汗機能布料，增加布料的實用功能與差異性，能提高產品價值。",
  "甲是遷廠，丙是工廠區位選擇，丁是增加勞動力；三者都沒有直接改良產品本身，因此答案為乙（B）。"
];
question.teacherTip = "遇到產業升級題，分辨策略是在降低成本、調整區位、增加勞力，還是改良產品功能與品質。";
question.requiresImage = false;
question.requiresContext = false;

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Transcribed 110 social Q2 table, cleaned options, and added a specific solution.");
