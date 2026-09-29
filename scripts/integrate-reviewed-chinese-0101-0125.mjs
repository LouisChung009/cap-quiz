import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataPath = new URL("data/chinese.json", root);
const batchPath = new URL("reports/rebuild-chinese-0101-0125.json", root);
const bank = JSON.parse(await readFile(dataPath, "utf8"));
const batch = JSON.parse(await readFile(batchPath, "utf8"));
if (bank.length !== 1000 || batch.length !== 25) throw new Error("題庫或批次題數不符");

const ids = new Set();
const stems = new Set();
for (const question of batch) {
  const number = Number(question.id.slice(-4));
  if (question.id !== `CHI-${String(number).padStart(4, "0")}` || number < 101 || number > 125) throw new Error(`批次 ID 不符：${question.id}`);
  if (ids.has(question.id)) throw new Error(`批次 ID 重複：${question.id}`);
  ids.add(question.id);
  const stem = question.question.trim().toLowerCase().replace(/\s+/g, " ");
  if (stems.has(stem)) throw new Error(`批次題幹重複：${question.id}`);
  stems.add(stem);
  if (question.subject !== "國文" || question.options?.length !== 4 || new Set(question.options).size !== 4) throw new Error(`${question.id}: 科目或選項錯誤`);
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) throw new Error(`${question.id}: 答案索引無效`);
  if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 3 || !question.teacherTip || !question.review) throw new Error(`${question.id}: 解題或必要欄位不足`);
}

const remainder = new Set(bank.filter(question => !ids.has(question.id)).map(question => question.question.trim().toLowerCase().replace(/\s+/g, " ")));
for (const question of batch) if (remainder.has(question.question.trim().toLowerCase().replace(/\s+/g, " "))) throw new Error(`${question.id}: 與其餘題庫題幹重複`);
const replacements = new Map(batch.map(question => [question.id, question]));
const result = bank.map(question => replacements.has(question.id) ? { ...replacements.get(question.id), review: question.review } : question);
if (result.length !== 1000 || new Set(result.map(question => question.id)).size !== 1000) throw new Error("整合後題數或 ID 唯一性錯誤");
await writeFile(dataPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log("Integrated 25 reviewed Chinese questions into CHI-0101–0125.");
