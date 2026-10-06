import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "英文-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = Array.from({ length: 27 }, (_, index) => `OFF-${String(63 + index).padStart(4, "0")}`);
const linkedFindings = audit.filter(item => ids.includes(item.id));

for (const [index, id] of ids.entries()) {
  const question = questions.find(item => item.id === id);
  if (!question || question.subject !== "英文" || question.source?.year !== 110 || question.source?.questionNumber !== index + 15 || question.options?.length !== 4 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3 || question.solutionSteps?.length < 3 || !question.explanation || !question.teacherTip) {
    throw new Error(`${id}: current record is incomplete or source mapping changed`);
  }
  if (/查看官方試題頁面|\(cid:\d+\)|最完整符合題幹所給的條件與證據/.test([question.question, ...question.options, question.explanation].join(" "))) {
    throw new Error(`${id}: placeholder, OCR residue, or known generic explanation remains`);
  }
  if (question.requiresImage) {
    if (!question.questionImage || !question.questionImages?.includes(question.questionImage) || !serviceWorker.includes(question.questionImage)) throw new Error(`${id}: required figure is not linked and cached`);
    await access(join(root, question.questionImage.replace(/^\.\//, "")));
  }
}
for (const [id, figure] of [["OFF-0065", "110-english-q17-food-choices.svg"], ["OFF-0068", "110-english-q20-woollie-tea-choices.svg"]]) {
  const question = questions.find(item => item.id === id);
  if (!question?.requiresImage || question.questionImage !== `./assets/official-exams/${figure}` || !question.imageAlt || question.questionImage.endsWith(".webp")) {
    throw new Error(`${id}: picture options must use a focused crop, not a full-page scan`);
  }
}
if (questions.find(item => item.id === "OFF-0070")?.requiresImage || questions.find(item => item.id === "OFF-0070")?.questionImage) {
  throw new Error("110 English Q22 is fully transcribed and must not show an unnecessary full-page scan");
}
if (new Set(linkedFindings.map(item => item.id)).size !== linkedFindings.length) throw new Error("Duplicate stale English audit findings found");
if (!linkedFindings.length) {
  console.log("OFF-0063–0089 findings are already reconciled; current text and figure checks passed.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Removed ${linkedFindings.length} stale English OCR/material/explanation findings after rechecking OFF-0063–0089.`);
