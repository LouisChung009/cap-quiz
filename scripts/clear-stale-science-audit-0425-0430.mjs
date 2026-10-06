import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = Array.from({ length: 6 }, (_, index) => `OFF-${String(425 + index).padStart(4, "0")}`);
const answerIndices = [0, 0, 2, 2, 0, 3];
const linkedFindings = audit.filter(item => ids.includes(item.id));

for (let index = 0; index < ids.length; index++) {
  const id = ids[index];
  const question = questions.find(item => item.id === id);
  if (!question || question.subject !== "自然" || question.source?.year !== 111 || question.source?.questionNumber !== index + 29 || question.answer !== answerIndices[index] || question.options?.length !== 4 || question.solutionSteps?.length < 3 || !question.teacherTip) {
    throw new Error(`${id}: source, answer, options, or worked explanation mismatch`);
  }
  if (/答案最符合條件與證據|最完整符合題幹所給的條件與證據/.test(question.explanation)) throw new Error(`${id}: generic explanation remains`);
  if (question.requiresImage) {
    if (!question.questionImage || !question.questionImages?.includes(question.questionImage) || !question.imageAlt || !serviceWorker.includes(question.questionImage)) throw new Error(`${id}: required figure is not correctly wired`);
    await access(join(root, question.questionImage.replace(/^\.\//, "")));
  }
}
if (new Set(linkedFindings.map(item => item.id)).size !== linkedFindings.length) throw new Error("Duplicate stale science findings found");
if (!linkedFindings.length) {
  console.log("OFF-0425–0430 stale findings are already reconciled; current checks passed.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Removed ${linkedFindings.length} stale science explanation findings after rechecking OFF-0425–0430.`);
