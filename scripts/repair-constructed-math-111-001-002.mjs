import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0318": {
    type: "非選擇題",
    question: "健康生技公司培養綠藻製作「綠藻粉」，再經加工製成相關保健食品。製作每 1 公克綠藻粉需要 60 億個綠藻細胞。請根據下列資訊回答並寫出解題過程：（1）在光照充沛且細胞皆未死亡的環境下，1 個綠藻細胞每 20 小時可分裂成 4 個，分裂後的細胞也會繼續分裂。從 1 個細胞開始培養 15 天後，共有 4ᵏ 個細胞，求 k。（2）已知 60 億介於 2³² 與 2³³ 之間，判斷這些細胞是否足以製作 8 公克綠藻粉。",
    options: [],
    answer: null,
    explanation: "（1）15 天為 360 小時，可分裂 360÷20=18 次；每次細胞數乘 4，所以總數為 4¹⁸，k=18。（2）4¹⁸=2³⁶=68,719,476,736。製作 8 公克需要 8×60 億=48,000,000,000 個細胞；68,719,476,736 大於 48,000,000,000，因此足夠。",
    solutionSteps: [
      "先把培養時間換成小時：15×24=360 小時。",
      "每 20 小時分裂一次，360÷20=18 次；每次細胞數乘 4，所以培養後共有 4¹⁸ 個細胞，k=18。",
      "將細胞數改寫成 2 的次方：4¹⁸=(2²)¹⁸=2³⁶。",
      "8 公克綠藻粉需 8×60 億=48,000,000,000 個細胞；4¹⁸=68,719,476,736，大於需求，因此足夠製作 8 公克綠藻粉。"
    ],
    responseParts: [
      { label: "（1）", prompt: "k 的值", answerDisplay: "18", acceptableAnswers: ["18"] },
      { label: "（2）", prompt: "是否足夠製作 8 公克綠藻粉？（請回答「足夠」或「不足」）", answerDisplay: "足夠", acceptableAnswers: ["足夠", "是", "可以", "足夠製作"] }
    ],
    teacherTip: "指數成長題先算完整的分裂次數；估算總量時可用已知的 2 次方界線比較，不必計算龐大整數。",
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0319": {
    type: "非選擇題",
    question: "一副完整撲克牌有 4 種花色，每種花色有 13 種點數：2 至 10、J、Q、K、A，共 52 張。遊戲用「牌值」評估尚未發出的牌：未發牌時牌值為 0；發出 2 至 9 點的小牌，牌值加 1；發出 10、J、Q、K、A 的大牌，牌值減 1。例如發出 3、A、8、9、Q、5，牌值為 0+1−1+1+1−1+1=2。請回答並寫出解題過程：（1）若已發出 11 張小牌及 4 張大牌，此時牌值為何？（2）若已發出 28 張牌且牌值為 10，剩餘牌等機率發出，下一張為大牌的機率是多少？",
    options: [],
    answer: null,
    explanation: "（1）牌值為 11−4=7。（2）設已發出 x 張小牌、y 張大牌，則 x+y=28、x−y=10，解得 x=19、y=9。全副牌有 20 張大牌，已發出 9 張大牌，因此剩下 20−9=11 張；總牌數剩 52−28=24 張，機率為 11/24。",
    solutionSteps: [
      "小牌每張使牌值加 1，大牌每張使牌值減 1；發出 11 張小牌及 4 張大牌後，牌值=11−4=7。",
      "全副牌的小牌有 8 個點數×4 種花色=32 張；大牌有 5 個點數×4 種花色=20 張。",
      "設已發出小牌 x 張、大牌 y 張。由 x+y=28、x−y=10，兩式相加得 2x=38，所以 x=19、y=9。",
      "全副牌有 20 張大牌，已發出 9 張，所以剩下 20−9=11 張大牌；剩餘總牌數為 52−28=24 張，故所求機率=11/24。"
    ],
    responseParts: [
      { label: "（1）", prompt: "此時的牌值", answerDisplay: "7", acceptableAnswers: ["7", "+7"] },
      { label: "（2）", prompt: "下一張是大牌的機率（請輸入最簡分數）", answerDisplay: "11/24", acceptableAnswers: ["11/24", "11÷24"] }
    ],
    teacherTip: "牌值差可和已發牌總數聯立，先求小牌與大牌各發出幾張，再用剩餘大牌數除以剩餘總牌數。",
    requiresImage: false,
    requiresContext: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(4)) - 317;
  if (!question || question.subject !== "數學" || question.source?.year !== 111 || question.source?.questionNumber !== expectedNumber) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  delete question.questionImage;
  delete question.questionImages;
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored 111 math Q1–2 as answerable official constructed-response items.");
