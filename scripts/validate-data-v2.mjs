import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const required = ["id", "subject", "gradeSemester", "unit", "knowledgePoint", "difficulty", "type", "question", "explanation", "solutionSteps", "teacherTip", "relatedWords", "sourceType", "review"];
const allIds = new Set();
const allQuestions = new Set();
const errors = [];
let total = 0;

const contextPattern = /根據(?:本文|上文|文章|選文|材料|短文|報導|資料)|依據(?:本文|上文|文章|選文|材料|短文|報導|資料)|本文(?:中|主旨|作者|提到|認為|敘述|寫作)|文中(?:提到|指出|敘述|作者)|這篇(?:文章|短文)|由本文|閱讀(?:本文|上文|下文|文章|選文|材料)|according to (?:the|this) (?:text|article|reading|passage)|in the (?:text|article|reading|passage)|the writer|the author/i;

function answerIsNamed(question) {
  if (!Number.isInteger(question.answer) || !question.options?.[question.answer]) return false;
  const solution = `${question.explanation} ${(question.solutionSteps || []).join(" ")}`;
  if (solution.toLowerCase().includes(String(question.options[question.answer]).toLowerCase())) return true;
  const letter = String.fromCharCode(65 + question.answer);
  return new RegExp(`(?:answer|correct answer|答案|正解|正確答案|標答|選項|故選|所以選|因此)\\s*(?:is|為|是|:|=)?\\s*[「"']?${letter}\\b`, "i").test(solution);
}

function validate(question, location) {
  const isConstructedResponse = question.type === "非選擇題";
  for (const field of required) {
    if (!(field in question) || question[field] === "" || question[field] === null) errors.push(`${location}: 缺少 ${field}`);
  }
  if (isConstructedResponse) {
    if (!Array.isArray(question.options) || question.options.length !== 0 || question.answer !== null) errors.push(`${location}: 非選題不可保留選項或索引答案`);
    if (!Array.isArray(question.responseParts) || question.responseParts.length < 2) errors.push(`${location}: 非選題至少需兩個小題答案`);
    for (const [index, part] of (question.responseParts || []).entries()) {
      if (!part.label || !part.prompt || !part.answerDisplay || !Array.isArray(part.acceptableAnswers) || !part.acceptableAnswers.length) errors.push(`${location}: 非選題第 ${index + 1} 小題資料不完整`);
      const solution = `${question.explanation} ${(question.solutionSteps || []).join(" ")}`;
      if (part.answerDisplay && !solution.includes(part.answerDisplay)) errors.push(`${location}: 非選題第 ${index + 1} 小題答案未出現在解析中`);
    }
  } else {
    if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${location}: 選項數量不是 4`);
    if (new Set(question.options).size !== question.options.length) errors.push(`${location}: 選項重複`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) errors.push(`${location}: 答案索引無效`);
  }
  if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 3) errors.push(`${location}: 解題步驟不足`);
  if (question.subject === "英文" && (!Array.isArray(question.relatedWords) || question.relatedWords.length < 2)) errors.push(`${location}: 缺少英文提示`);
  if (question.subject === "英文" && !isConstructedResponse && !answerIsNamed(question)) errors.push(`${location}: 英文解析未能明確指出標答`);
  if (question.subject === "英文" && /\b(?:in|according to) (?:report|passage|text|article)\s+\d+/i.test(question.question)) errors.push(`${location}: 英文題引用未提供的材料`);
  if (question.sourceType === "官方歷屆真題" && (!question.source?.year || !question.source?.questionNumber || !question.source?.url || typeof question.requiresImage !== "boolean" || (question.requiresImage && !question.questionImage) || (question.requiresContext && !question.questionImages?.length))) errors.push(`${location}: 真題來源、圖表判斷或後台紀錄不完整`);
  if (!isConstructedResponse && question.sourceType === "官方歷屆真題" && question.options.join("") === "ABCD" && !question.requiresImage) errors.push(`${location}: 文字真題選項尚未拆分`);
  const contextIsEmbedded = /【閱讀材料(?:摘要)?】/.test(question.question);
  if (question.sourceType === "官方歷屆真題" && contextPattern.test(question.question) && !contextIsEmbedded && (!question.requiresContext || !question.questionImages?.length)) errors.push(`${location}: 引用本文但缺少閱讀材料`);
  if (question.sourceType === "官方歷屆真題" && question.requiresContext && !question.questionImages?.length) errors.push(`${location}: 題組前文缺少材料頁`);
  if (question.sourceType === "官方歷屆真題" && question.optionsInImage && (!question.requiresImage || question.options.some((option, index) => option !== "ABCD"[index]))) errors.push(`${location}: 圖片選項設定錯誤`);
  if (/試題結束|請翻頁繼續作答|\(cid:\d+\)/i.test(`${question.question} ${(question.options || []).join(" ")}`)) errors.push(`${location}: 含試卷頁尾或 OCR 雜訊`);
  if (allIds.has(question.id)) errors.push(`${location}: ID 重複 ${question.id}`);
  else allIds.add(question.id);
  const normalized = `${question.question}|${(question.options || []).join("|")}`.replace(/\s+/g, "").toLowerCase();
  if (allQuestions.has(normalized) && !question.requiresImage) errors.push(`${location}: 題幹與選項重複`);
  else allQuestions.add(normalized);
  total++;
}

for (const file of files) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  if (rows.length !== 1000) errors.push(`${file}: 題數 ${rows.length}`);
  rows.forEach((question, index) => validate(question, `${file}[${index}]`));
  console.log(`${file}: ${rows.length} 題通過格式掃描`);
}

const mission = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
mission.forEach((question, index) => validate(question, `mission[${index}]`));
const official = mission.filter(question => question.sourceType === "官方歷屆真題");
const similar = mission.filter(question => question.type === "會考類題");
if (official.length !== 1088) errors.push(`官方真題 ${official.length}，應為 1088`);
if (similar.length !== 10) errors.push(`類題 ${similar.length}，應為 10`);
for (const [id, number, expectedQuestion, expectedAnswer] of [["OFF-0049", 1, "In the picture, the boy is", "bowing to"], ["OFF-0050", 2, "Listen! The baby", "is crying"]]) {
  const row = mission.find(question => question.id === id);
  if (!row || row.source?.year !== 110 || row.source?.questionNumber !== number || !row.question.includes(expectedQuestion) || row.options[row.answer] !== expectedAnswer) errors.push(`${id}: 110年英文題號、題幹或標答錯置`);
}
const expectedCounts = { 110: { 國文: 48, 英文: 41, 數學: 26, 社會: 63, 自然: 54 }, 111: { 國文: 42, 英文: 43, 數學: 25, 社會: 54, 自然: 50 }, 112: { 國文: 42, 英文: 43, 數學: 25, 社會: 54, 自然: 50 }, 113: { 國文: 42, 英文: 43, 數學: 25, 社會: 54, 自然: 50 }, 114: { 國文: 42, 英文: 43, 數學: 25, 社會: 54, 自然: 50 } };
for (const [year, subjects] of Object.entries(expectedCounts)) {
  for (const [subject, expected] of Object.entries(subjects)) {
    const rows = official.filter(question => String(question.source.year) === year && question.subject === subject);
    const numbers = rows.map(question => question.source.questionNumber).sort((a, b) => a - b);
    if (rows.length !== expected) errors.push(`${year}${subject}: ${rows.length}/${expected}`);
    if (numbers.some((number, index) => number !== index + 1)) errors.push(`${year}${subject}: 題號不連續`);
  }
}
for (const question of official) {
  const images = question.requiresImage ? (question.questionImages?.length ? question.questionImages : [question.questionImage].filter(Boolean)) : [];
  for (const image of images) {
    try {
      await access(join(root, image.replace(/^\.\//, "")));
    } catch {
      errors.push(`${question.id}: 找不到頁圖 ${image}`);
    }
  }
}
if (total !== 6098) errors.push(`總題數 ${total}，應為 6098`);
console.log(`official: ${official.length} 題；similar: ${similar.length} 題；總計 ${total} 題`);
if (errors.length) {
  console.error(errors.slice(0, 100).join("\n"));
  console.error(`共 ${errors.length} 個錯誤`);
  process.exit(1);
}
console.log(`驗證完成：${total} 題、${allIds.size} 個唯一 ID、五年題號與頁圖完整。`);
