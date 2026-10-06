import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const dataPath = join(root, "data", "mission-questions.json");
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(dataPath, "utf8"));
const ids = Array.from({ length: 10 }, (_, index) => `OFF-${String(116 + index).padStart(4, "0")}`);
const linkedFindings = audit.filter(item => ids.includes(item.id));

for (const id of ids) {
  const question = questions.find(item => item.id === id);
  if (!question || question.subject !== "社會" || question.options?.length !== 4 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3 || question.solutionSteps?.length < 3 || !question.teacherTip) {
    throw new Error(`${id}: current record is incomplete; stale finding cannot be cleared`);
  }
  if (/\(cid:\d+\)|查看官方試題頁面|最完整符合題幹所給的條件與證據/.test([question.question, ...question.options, question.explanation, ...question.solutionSteps].join(" "))) {
    throw new Error(`${id}: OCR placeholder or known generic content remains`);
  }
  if (question.requiresImage) {
    if (!question.questionImage || !question.questionImages?.includes(question.questionImage) || !serviceWorker.includes(question.questionImage)) {
      throw new Error(`${id}: required figure is not wired and offline-cached`);
    }
    await access(join(root, question.questionImage.replace(/^\.\//, "")));
  }
}

if (new Set(linkedFindings.map(item => item.id)).size !== linkedFindings.length) throw new Error("Duplicate stale findings found for a reviewed question");
if (!linkedFindings.length) {
  console.log("OFF-0116–0125 stale findings are already reconciled; current item checks passed.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Removed ${linkedFindings.length} stale findings after revalidating current OFF-0116–0125 records.`);
