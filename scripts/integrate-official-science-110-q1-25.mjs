import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataPath = new URL("data/mission-questions.json", root);
const reportPath = new URL("reports/corrected-official-science-110-q1-25.json", root);
const mission = JSON.parse(await readFile(dataPath, "utf8"));
const report = JSON.parse(await readFile(reportPath, "utf8"));
const officialAnswerIndexes = [0, 3, 2, 3, 3, 2, 0, 1, 1, 0, 2, 3, 1, 0, 0, 2, 0, 2, 1, 2, 3, 0, 2, 0, 0];
let integrated = 0;

for (let number = 1; number <= 25; number += 1) {
  const id = `OFF-${String(number + 178).padStart(4, "0")}`;
  if (number === 2) continue;
  const correction = report[id];
  const question = mission.find(item => item.id === id && item.subject === "自然" && item.sourceType === "官方歷屆真題");
  if (!correction || !question) throw new Error(`缺少官方自然科第 ${number} 題資料：${id}`);
  if (question.answer !== officialAnswerIndexes[number - 1]) throw new Error(`${id}: 現有答案索引與官方答案表不符`);
  if (!/^verified/.test(correction.answerKeyReview?.status || "")) throw new Error(`${id}: 答案核對未通過，拒絕整合`);
  if (!correction.explanation || !Array.isArray(correction.solutionSteps) || correction.solutionSteps.length < 3 || !correction.teacherTip) throw new Error(`${id}: 解題內容不足`);
  Object.assign(question, {
    explanation: correction.explanation,
    solutionSteps: correction.solutionSteps,
    teacherTip: correction.teacherTip,
    answerKeyReview: correction.answerKeyReview,
  });
  integrated += 1;
}

await writeFile(dataPath, `${JSON.stringify(mission, null, 2)}\n`, "utf8");
console.log(`Integrated ${integrated} answer-verified official 110 Natural Science explanations; OFF-0180 was independently corrected.`);
