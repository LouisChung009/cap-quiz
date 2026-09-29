import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0100": {
    question: `動物園準備了 100 張刮刮樂，送給開幕當日前 100 位遊客每人一張，其中 32 張可刮中獎品。獎品種類與數量如下：北極熊絨毛玩偶 1 個、獅子玩偶 1 個、造型馬克杯 10 個、紀念鑰匙圈 20 個。若小柏是第一位遊客，且每張刮刮樂被拿到的機會相等，則小柏刮中玩偶的機率為何？`,
    options: ["1/2", "1/16", "8/25", "1/50"],
    answer: 3,
    explanation: "答案 D「1/50」。題目問刮中玩偶，表中玩偶有北極熊與獅子各 1 個，共 2 張中獎刮刮樂。小柏從 100 張等機會取得一張，因此機率為 2/100=1/50。32 是所有中獎刮刮樂的總數，不是計算玩偶機率時的母數；其餘 30 張為杯子或鑰匙圈。",
    solutionSteps: ["由表格把『玩偶』限定為北極熊絨毛玩偶 1 個與獅子玩偶 1 個，有利刮刮樂共 2 張。", "總共發出 100 張，而且每張被拿到的機會相等，所有可能結果是 100 張，不是只有 32 張中獎券。", "機率=有利結果數÷全部可能結果數=2/100=1/50，選 D。"],
    requiresImage: false
  },
  "OFF-0101": {
    question: "美美和小儀到超市購物，超市舉辦摸彩活動，單次消費每滿 100 元可拿 1 張摸彩券。美美一次買 5 盒金幣巧克力拿到 3 張券；小儀一次買 5 盒金幣巧克力與 1 個蛋糕拿到 4 張券。若每盒金幣巧克力售價為 x 元、每個蛋糕 150 元，則 x 的範圍為何？",
    options: ["50 ≤ x < 60", "60 ≤ x < 70", "70 ≤ x < 80", "80 ≤ x < 90"],
    answer: 1,
    explanation: "答案 B「60 ≤ x < 70」。拿到 3 張券表示美美消費滿 300 元但未滿 400 元，所以 300≤5x<400，即 60≤x<80。拿到 4 張券表示小儀消費滿 400 元但未滿 500 元，所以 400≤5x+150<500，即 50≤x<70。兩條件取交集得 60≤x<70。",
    solutionSteps: ["美美的消費 5x 對應 3 張券：300≤5x<400，除以 5 得 60≤x<80。", "小儀的消費 5x+150 對應 4 張券：400≤5x+150<500；減 150 再除以 5，得 50≤x<70。", "x 必須同時符合兩個人的消費資料，取區間交集 [60,80)∩[50,70)=[60,70)，選 B。"],
    requiresImage: false
  },
  "OFF-0102": {
    question: "已知 a₁、a₂、……、a₄₀ 為等差數列，其中 a₁ 為正數，且 a₂₀+a₂₂=0。判斷下列敘述何者正確？",
    options: ["a₂₁ + a₂₂ > 0", "a₂₁ + a₂₂ < 0", "a₂₁ × a₂₂ > 0", "a₂₁ × a₂₂ < 0"],
    answer: 1,
    explanation: "答案 B「a₂₁+a₂₂<0」。等差數列中相鄰兩項對稱於中項：a₂₀+a₂₂=2a₂₁=0，所以 a₂₁=0。又 a₂₀=a₁+19d、a₂₁=a₁+20d=0，故公差 d=−a₁/20<0；因此 a₂₂=a₂₁+d<0，得到 a₂₁+a₂₂<0。",
    solutionSteps: ["利用等差數列性質，a₂₀+a₂₂=2a₂₁；已知和為 0，所以 a₂₁=0。", "由 a₂₁=a₁+20d=0 且 a₁>0，可得 d=−a₁/20<0，因此下一項 a₂₂=a₂₁+d<0。", "所以 a₂₁+a₂₂=0+a₂₂<0，選 B；乘積為 0，故 C、D 都不成立。"],
    requiresImage: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  const expectedNumber = Number(id.slice(4)) - 89;
  if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== expectedNumber) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  delete question.questionImage;
  delete question.questionImages;
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Repaired 110 math Q11–13 materials, options, and worked explanations.");
