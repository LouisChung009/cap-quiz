import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(path, "utf8"));

const fixes = {
  "OFF-0090": {
    type: "非選擇題",
    options: [],
    answer: null,
    explanation: "（1）標示 38 公克代表實際排放量與 38 的差距不大於與相鄰標示 36、40 的差距，因此最小可為 37 公克、最大可為 39 公克（在 37 或 39 的等距情形可標示 38）。答案：37 公克、39 公克。（2）原排放量介於 37 至 39 公克，減少為 90% 後介於 33.3 至 35.1 公克。最接近的偶數標示可能為 34；若實際值達 35 公克以上，36 也可能，因此所有可能標示為 34、36 公克。答案：34 公克與 36 公克。",
    solutionSteps: [
      "相鄰偶數標示 36 與 38 的中點是 37；38 與 40 的中點是 39。等距時可採任一最近標示，因此 38 對應的實際碳排放量最小為 37 公克、最大為 39 公克。",
      "將兩端都乘以 90%：37×0.9=33.3，39×0.9=35.1，所以減量後實際排放量介於 33.3 至 35.1 公克。",
      "此區間內最接近的偶數標示有 34 公克；35 公克時 34、36 等距可標示 36，且 35.1 也最接近 36，因此所有可能標示為 34、36 公克。"
    ],
    responseParts: [
      { label: "（1）", prompt: "可能的最小碳排放量（公克）", answerDisplay: "37", acceptableAnswers: ["37", "37公克"] },
      { label: "（1）", prompt: "可能的最大碳排放量（公克）", answerDisplay: "39", acceptableAnswers: ["39", "39公克"] },
      { label: "（2）", prompt: "減少為 90% 後，所有可能的碳足跡標示（由小到大，以逗號分隔）", answerDisplay: "34、36 公克", acceptableAnswers: ["34,36", "34，36", "34、36", "34和36", "34及36", "34公克、36公克"] }
    ],
    teacherTip: "四捨五入或最近值標示題要先找相鄰標示的中點；端點等距時可能同時對應兩種標示，別漏掉邊界值。",
    requiresImage: false,
    requiresContext: false
  },
  "OFF-0091": {
    type: "非選擇題",
    options: [],
    answer: null,
    explanation: "（1）若橫切 h 刀、縱切 v 刀，且 h+v=4，蛋糕塊數為 (h+1)(v+1)。刀數分配 (0,4)、(1,3)、(2,2)、(3,1)、(4,0) 分別切成 5、8、9、8、5 塊，因此所有可能數量為 5、8 或 9 塊。（2）不焦脆的蛋糕塊位於內部，共 (h−1)(v−1)=60。令 a=h−1、b=v−1，則 ab=60 且 a+b≤18。60 的因數配對（含交換）有 (1,60)、(2,30)、(3,20)、(4,15)、(5,12)、(6,10)，前四組和大於 18，只有 (5,12)、(6,10) 及其交換符合條件。因 h+v=a+b+2，總刀數為 19 或 18；所有可能答案是 18、19 刀。",
    solutionSteps: [
      "橫切 h 刀、縱切 v 刀會分成 h+1 列及 v+1 行，蛋糕塊總數為 (h+1)(v+1)。",
      "取 h=2、v=2，符合 h+v=4，蛋糕塊數為 (2+1)(2+1)=9，故 9 是一種可能答案。",
      "所有側面都不焦脆的蛋糕塊不在外圍，數量為 (h−1)(v−1)。令 a=h−1、b=v−1，則 ab=60，且 h+v=a+b+2≤20，所以 a+b≤18。",
      "60 的正因數配對中，符合 a+b≤18 的有 (5,12)、(6,10) 及其對調；對應 h+v=a+b+2 為 19 或 18 刀。"
    ],
    responseParts: [
      { label: "（1）", prompt: "任一種可能的蛋糕塊數", answerDisplay: "5、8 或 9", acceptableAnswers: ["5", "8", "9"] },
      { label: "（2）", prompt: "所有可能的切刀總數（由小到大，以逗號分隔）", answerDisplay: "18、19 刀", acceptableAnswers: ["18,19", "18，19", "18、19", "18和19", "18或19", "18及19", "18刀、19刀"] }
    ],
    teacherTip: "切割題先把橫、縱切刀數設為變數；總塊數看切線分出的列與行，內部塊數則要扣掉四周外框。",
    requiresImage: false,
    requiresContext: false
  }
};

for (const [id, fix] of Object.entries(fixes)) {
  const question = questions.find((item) => item.id === id);
  if (!question || question.subject !== "數學" || question.source?.year !== 110 || question.source?.questionNumber !== Number(id.slice(4)) - 89) {
    throw new Error(`Unexpected or missing source item ${id}`);
  }
  Object.assign(question, fix);
  delete question.questionImage;
  delete question.questionImages;
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Restored 110 math Q1–2 as answerable official constructed-response items.");
