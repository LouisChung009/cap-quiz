import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const dataPath = new URL("data/chinese.json", root);
const batchPath = new URL("reports/rebuild-chinese-0001-0100.json", root);
const bank = JSON.parse(await readFile(dataPath, "utf8"));
const batch = JSON.parse(await readFile(batchPath, "utf8"));
if (bank.length !== 1000 || batch.length !== 100) throw new Error("題庫或重建批次題數不符");
const seenIds = new Set();
const seenStems = new Set();
for (const question of batch) {
  const number = Number(question.id.slice(-4));
  if (question.id !== `CHI-${String(number).padStart(4, "0")}` || number < 1 || number > 100) throw new Error(`批次 ID 不符：${question.id}`);
  if (seenIds.has(question.id)) throw new Error(`批次 ID 重複：${question.id}`);
  seenIds.add(question.id);
  const stem = question.question.trim().replace(/\s+/g, " ");
  if (seenStems.has(stem)) throw new Error(`批次題幹重複：${question.id}`);
  seenStems.add(stem);
  if (question.subject !== "國文" || question.options?.length !== 4 || new Set(question.options).size !== 4) throw new Error(`${question.id}: 科目或四選項錯誤`);
  if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) throw new Error(`${question.id}: 答案索引無效`);
  if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 3 || !question.teacherTip || !question.review) throw new Error(`${question.id}: 解析或題庫欄位不足`);
  if (/UNRESOLVED|答案不唯一|多個正解|沒有正解/.test(`${question.explanation} ${question.solutionSteps.join(" ")}`)) throw new Error(`${question.id}: 仍有未解或多解標記`);
}
const remainderStems = new Set(bank.slice(100).map(question => question.question.trim().replace(/\s+/g, " ")));
for (const question of batch) if (remainderStems.has(question.question.trim().replace(/\s+/g, " "))) throw new Error(`${question.id}: 與其餘題庫重複`);

const replacementById = new Map(batch.map(question => [question.id, question]));
const result = bank.map(question => {
  const replacement = replacementById.get(question.id);
  return replacement ? { ...replacement, review: question.review } : question;
});
if (result.length !== 1000 || new Set(result.map(question => question.id)).size !== 1000) throw new Error("整合後題庫數量或 ID 不唯一");
await writeFile(dataPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log("Integrated 100 reviewed Chinese questions into CHI-0001–0100.");
