import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));
const context = "【題組材料】小榮研究 X、Y 兩牌殺蟲劑對甲、乙兩種蚊子的影響。將甲、乙蚊子各分成兩組，置於四個相同的封閉環境中，分別噴灑 X 牌或 Y 牌殺蟲劑。每個月再噴灑一次並記錄存活數；期間存活的蚊子會繁殖。三次噴灑後的存活數如下：甲蚊使用 X 牌為 35、143、705 隻，使用 Y 牌為 80、406、2404 隻；乙蚊使用 X 牌為 25、57、109 隻，使用 Y 牌為 30、62、128 隻。";
const fixes = {
  "OFF-0226": {
    question: `${context}\n\n根據此表分析，下列何種結論最合理？`,
    explanation: "比較同一蚊種接受不同殺蟲劑後的存活數：甲蚊使用 X 牌三次後分別存活 35、143、705 隻；使用 Y 牌則為 80、406、2404 隻，X 牌每次存活數都較少，因此撲殺甲蚊應選 X 牌。正確答案：C。甲、乙蚊對同一藥劑的差異不能直接說明哪一種蚊子較容易被殺；乙蚊則是 X 牌存活數也都低於 Y 牌，故 D 不成立。",
    solutionSteps: [
      "判斷殺蟲效果時，固定蚊種，比較 X、Y 兩牌處理後的存活數；存活數愈少，表示該次撲殺效果愈好。",
      "甲蚊使用 X 牌的三次存活數是 35、143、705；使用 Y 牌是 80、406、2404。X 牌三次都較少，故甲蚊應選 X 牌，選項 C 正確。",
      "乙蚊使用 X 牌的存活數 25、57、109 也都少於 Y 牌的 30、62、128，因此不能說乙蚊應選 Y 牌；A、B 是跨蚊種比較，也不是題目要判斷的同種藥效比較。"
    ],
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0227": {
    question: `${context}\n\n依天擇說解釋這些蚊子得以存活的理由，下列何者最合理？`,
    explanation: "族群中原本就存在個體差異，少數蚊子先天具有較強的殺蟲劑抵抗力；噴藥後較容易存活，並把有利特徵傳給後代，使抗藥性個體比例逐漸增加。正確答案：C。殺蟲劑不是為了讓個體需要而誘發特定突變，也不是直接刺激蚊子取得抵抗力。",
    solutionSteps: [
      "天擇的前提是族群內原本存在可遺傳的個體變異，不是環境需要時才讓個體產生指定變異。",
      "殺蟲劑會淘汰較不耐受的蚊子；原先較有抵抗力的個體較容易存活並繁殖。",
      "因此抗藥性特徵在族群中逐代增加，對應選項 C。殺蟲劑不會直接促使蚊子突變成新物種，也不會刺激個體自行獲得抗性。"
    ],
    requiresImage: false,
    requiresContext: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const number = Number(id.slice(4)) - 178;
  if (!question || question.subject !== "自然" || question.source?.year !== 110 || question.source?.questionNumber !== number) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Embedded complete mosquito data and question-specific solutions for 110 science Q48–49.");
