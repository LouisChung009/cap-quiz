import { readFile, writeFile } from "node:fs/promises";

const bankPath = new URL("../data/science.json", import.meta.url);
const reviewPath = new URL("../reports/rebuild-science-0126-0150.json", import.meta.url);
const bank = JSON.parse(await readFile(bankPath, "utf8"));
const reviewed = JSON.parse(await readFile(reviewPath, "utf8"));
if (reviewed.length !== 25) throw new Error("Expected 25 reviewed items");
for (const item of reviewed) {
  const row = bank.find(question => question.id === item.id);
  if (!row || item.o?.length !== 4 || new Set(item.o).size !== 4 || !item.o[item.a] || item.s?.length !== 3) throw new Error("Invalid reviewed item " + item.id);
  Object.assign(row, {
    gradeSemester: "九年級上",
    unit: item.unit,
    knowledgePoint: item.knowledgePoint,
    difficulty: item.difficulty,
    type: item.q.includes("哪個操作") || item.q.includes("設計") ? "實驗與探究選擇" : item.q.includes("調查") || item.q.includes("資料") ? "資料判讀選擇" : "單題選擇",
    question: item.q,
    options: item.o,
    answer: item.a,
    explanation: "正確答案是「" + item.o[item.a] + "」。" + item.e,
    solutionSteps: item.s,
    teacherTip: "先辨認題目給定的條件與要判斷的概念，再逐步核對證據和單位。",
    sourceType: "原創會考程度練習"
  });
}
await writeFile(bankPath, JSON.stringify(bank, null, 2) + "\n", "utf8");
console.log("Integrated 25 science teacher-reviewed questions.");
