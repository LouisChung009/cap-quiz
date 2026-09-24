import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const required = ["id", "subject", "gradeSemester", "unit", "knowledgePoint", "difficulty", "type", "question", "options", "answer", "explanation", "solutionSteps", "teacherTip", "relatedWords", "sourceType", "review"];
const allIds = new Set(), allQuestions = new Set(), errors = [];
let total = 0;

for (const file of files) {
  const questions = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  if (questions.length !== 1000) errors.push(`${file}: 題數為 ${questions.length}，應為 1000`);
  for (const [index, question] of questions.entries()) {
    const location = `${file}[${index}]`;
    for (const field of required) if (!(field in question) || question[field] === "" || question[field] === null) errors.push(`${location}: 缺少 ${field}`);
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${location}: 選項數量不是 4`);
    if (new Set(question.options).size !== question.options.length) errors.push(`${location}: 選項重複`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) errors.push(`${location}: 答案索引無效`);
    if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 3) errors.push(`${location}: 解題步驟不足`);
    if (question.subject === "英文" && (!Array.isArray(question.relatedWords) || question.relatedWords.length < 2)) errors.push(`${location}: 缺少英文同義／類似詞`);
    if (allIds.has(question.id)) errors.push(`${location}: ID 重複 ${question.id}`); else allIds.add(question.id);
    const normalized = question.question.replace(/\s+/g, "").toLowerCase();
    if (allQuestions.has(normalized)) errors.push(`${location}: 題幹重複`); else allQuestions.add(normalized);
    total += 1;
  }
  console.log(`${file}: ${questions.length} 題通過格式掃描`);
}
if (total !== 5000) errors.push(`總題數為 ${total}，應為 5000`);
if (errors.length) { console.error(errors.slice(0, 100).join("\n")); console.error(`共 ${errors.length} 個錯誤`); process.exit(1); }
console.log(`驗證完成：${total} 題、${allIds.size} 個唯一 ID、${allQuestions.size} 個唯一題幹，0 個錯誤。`);
