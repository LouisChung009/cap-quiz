import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataPath = new URL("data/english.json", root);
const batchPath = new URL("reports/rebuild-english-0001-0100.json", root);
const bank = JSON.parse(await readFile(dataPath, "utf8"));
const batch = JSON.parse(await readFile(batchPath, "utf8"));
if (bank.length !== 1000 || batch.length !== 100) throw new Error("題庫或重建批次題數不符");
const seenIds = new Set();
const seenStems = new Set();
for (const question of batch) {
  const expected = `ENG-${String(Number(question.id.slice(-4))).padStart(4, "0")}`;
  if (question.id !== expected || Number(question.id.slice(-4)) < 1 || Number(question.id.slice(-4)) > 100) throw new Error(`批次 ID 不符：${question.id}`);
  if (seenIds.has(question.id)) throw new Error(`批次 ID 重複：${question.id}`);
  seenIds.add(question.id);
  const stem = question.question.trim().toLowerCase().replace(/\s+/g, " ");
  if (seenStems.has(stem)) throw new Error(`批次題幹重複：${question.id}`);
  seenStems.add(stem);
  if (question.subject !== "英文" || question.options?.length !== 4 || new Set(question.options).size !== 4) throw new Error(`${question.id}: 科目或四選項錯誤`);
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) throw new Error(`${question.id}: 答案索引無效`);
  if (!`${question.explanation} ${(question.solutionSteps || []).join(" ")}`.toLowerCase().includes(String(question.options[question.answer]).toLowerCase())) throw new Error(`${question.id}: 解析未提及正解`);
  if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 3 || !question.teacherTip || question.relatedWords?.length < 2) throw new Error(`${question.id}: 解析或英文提示欄位不足`);
  if (/\b(?:in|according to) (?:report|passage|text|article)\s+\d+/i.test(question.question)) throw new Error(`${question.id}: 引用未提供的材料`);
}
const remainderStems = new Set(bank.slice(100).map(question => question.question.trim().toLowerCase().replace(/\s+/g, " ")));
for (const question of batch) if (remainderStems.has(question.question.trim().toLowerCase().replace(/\s+/g, " "))) throw new Error(`${question.id}: 與其餘題庫重複`);

const replacementById = new Map(batch.map(question => [question.id, question]));
const result = bank.map(question => {
  const replacement = replacementById.get(question.id);
  return replacement ? { ...replacement, review: question.review } : question;
});
if (result.length !== 1000 || new Set(result.map(question => question.id)).size !== 1000) throw new Error("整合後題庫數量或 ID 不唯一");
await writeFile(dataPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log("Integrated 100 reviewed English questions into ENG-0001–0100.");
