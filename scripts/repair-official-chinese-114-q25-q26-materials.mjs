import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const material = "./assets/official-exams/114-chinese-q25-q26-oyster-passage.svg";
const repairs = new Map([
  [25, {
    id: "OFF-0899",
    stem: "根據本文，下列關於公呆的敘述何者最恰當？",
    explanation: "答案 B。原文指出公呆遇到動物接近時會噴水示警，雖可能嚇走水鳥，卻也會暴露牠們藏在泥灘中的位置，讓挖蛤的人發現。A 把北極圓蛤「明」的長壽錯套到公呆；C 與公呆殼薄、容易破損相反；D 把秋季轉冷後成群死亡誤解成主動一起晒太陽。",
    steps: [
      "在原文找公呆的防禦行為：有動物接近時會一起噴水，可能嚇走水鳥。",
      "作者接著指出，噴水也會暴露牠們的位置，反而讓挖蛤的人發現；這正是 B 的敘述。",
      "「明」是北極圓蛤而非公呆；公呆殼薄易破，秋天成群死亡也不表示牠們為了晒太陽而聚集。"
    ],
    tip: "閱讀生物行為題要分清敘述對象；同一篇文章中的不同蛤蜊不能互換特徵。"
  }],
  [26, {
    id: "OFF-0900",
    stem: "關於本文的寫作分析，下列何者最恰當？",
    explanation: "答案 A。文章以外婆和外孫談「明」與公呆的對話推進：外婆先從勞動經驗描述公呆，外孫則反駁牠們不是懶，而是殼薄、承受不了壓力。祖孫不同的解讀暗示兩代價值觀差異。文章不是懷念親人、宣導生態保育，也不是借公呆說活到老學到老。",
    steps: [
      "辨認全文結構：外婆講述自己挖公呆的往事，外孫提出不同解釋，兩人的對話貫穿文章。",
      "外婆以生活經驗看公呆的習性；外孫則從殼薄、生命短等角度理解牠，呈現世代觀點差異。",
      "因此 A 最恰當；其餘選項所說的懷親、永續倡議與終身學習都不是文章主旨。"
    ],
    tip: "分析寫作手法時，先看人物互動如何推進主題，再判斷選項是否把局部內容誤當全文主旨。"
  }]
]);

for (const [number, repair] of repairs) {
  const question = questions.find(item => item.id === repair.id);
  if (!question || question.source?.year !== 114 || question.source.questionNumber !== number || question.options?.length !== 4) throw new Error(`114國文第${number}題資料不符`);
  question.question = repair.stem;
  question.questionImage = material;
  question.questionImages = [material];
  question.imageAlt = "114年會考國文第25至26題共用閱讀材料，鍾文音〈公呆〉全文掃描裁圖；內容含祖孫對話與公呆習性描述";
  question.requiresImage = true;
  question.requiresContext = true;
  question.explanation = repair.explanation;
  question.solutionSteps = repair.steps;
  question.teacherTip = repair.tip;
}
await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored the shared original reading passage and source-based explanations for 114 Chinese Q25–26.");
