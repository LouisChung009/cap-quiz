import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataPath = new URL("data/mission-questions.json", root);
const batchPath = new URL("reports/corrected-official-english-0001-0025.json", root);
const mission = JSON.parse(await readFile(dataPath, "utf8"));
const corrections = JSON.parse(await readFile(batchPath, "utf8"));
const ids = Array.from({ length: 23 }, (_, index) => `OFF-${String(index + 51).padStart(4, "0")}`);
if (ids.some(id => !corrections[id])) throw new Error("英文解析批次 OFF-0051–0073 不完整");

for (const id of ids) {
  const correction = corrections[id];
  const question = mission.find(item => item.id === id && item.subject === "英文" && item.sourceType === "官方歷屆真題");
  if (!question) throw new Error(`找不到官方英文真題 ${id}`);
  if (!correction.explanation || !Array.isArray(correction.solutionSteps) || correction.solutionSteps.length < 3 || !correction.teacherTip) throw new Error(`${id}: 解析欄位不足`);
  const solution = `${correction.explanation} ${correction.solutionSteps.join(" ")}`.toLowerCase();
  const normalize = value => String(value).toLowerCase().replace(/[\s.,!?;:]+$/g, "");
  const option = normalize(question.options[question.answer]);
  const letter = String.fromCharCode(65 + question.answer);
  const answerLabel = new RegExp(`(?:answer|correct answer|答案|正解|正確答案|標答|選項|故選|所以選|因此)\\s*(?:is|為|是|:|=)?\\s*[「"']?${letter}\\b`, "i");
  if (!normalize(solution).includes(option) && !answerLabel.test(solution)) throw new Error(`${id}: 解析未能明確指出標答`);
  Object.assign(question, {
    explanation: correction.explanation,
    solutionSteps: correction.solutionSteps,
    teacherTip: correction.teacherTip,
    ...(correction.answerKeyReview ? { answerKeyReview: correction.answerKeyReview } : {}),
  });
}

await writeFile(dataPath, `${JSON.stringify(mission, null, 2)}\n`, "utf8");
console.log("Integrated specific explanations for official English OFF-0051–0073.");
