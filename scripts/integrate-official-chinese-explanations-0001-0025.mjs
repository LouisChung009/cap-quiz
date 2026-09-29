import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataPath = new URL("data/mission-questions.json", root);
const batchPath = new URL("reports/corrected-official-chinese-0001-0025.json", root);
const mission = JSON.parse(await readFile(dataPath, "utf8"));
const corrections = JSON.parse(await readFile(batchPath, "utf8"));
const ids = Array.from({ length: 25 }, (_, index) => `OFF-${String(index + 1).padStart(4, "0")}`);
if (Object.keys(corrections).length !== ids.length || ids.some(id => !corrections[id])) throw new Error("國文解析批次 ID 不完整");

for (const id of ids) {
  const correction = corrections[id];
  const question = mission.find(item => item.id === id && item.subject === "國文" && item.sourceType === "官方歷屆真題");
  if (!question) throw new Error(`找不到官方國文真題 ${id}`);
  if (!correction.explanation || !Array.isArray(correction.solutionSteps) || correction.solutionSteps.length < 3 || !correction.teacherTip) throw new Error(`${id}: 解析欄位不足`);
  for (const [index, value] of Object.entries(correction.optionCorrections || {})) question.options[Number(index)] = value;
  if (!correction.answerKeyReview && !`${correction.explanation} ${correction.solutionSteps.join(" ")}`.includes(question.options[question.answer])) throw new Error(`${id}: 解析未引用正解選項`);
  Object.assign(question, {
    explanation: correction.explanation,
    solutionSteps: correction.solutionSteps,
    teacherTip: correction.teacherTip,
    ...(correction.answerKeyReview ? { answerKeyReview: correction.answerKeyReview } : {}),
  });
}

await writeFile(dataPath, `${JSON.stringify(mission, null, 2)}\n`, "utf8");
console.log("Integrated specific explanations for official Chinese OFF-0001–0025; retained the official answer and recorded the OFF-0011 ambiguity.");
