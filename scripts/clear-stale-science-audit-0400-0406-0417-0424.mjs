import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = [
  ...Array.from({ length: 7 }, (_, index) => `OFF-${String(400 + index).padStart(4, "0")}`),
  ...Array.from({ length: 8 }, (_, index) => `OFF-${String(417 + index).padStart(4, "0")}`)
];
const linkedFindings = audit.filter(item => ids.includes(item.id));

for (const id of ids) {
  const question = questions.find(item => item.id === id);
  if (!question || question.subject !== "自然" || question.options?.length !== 4 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3 || question.solutionSteps?.length < 3 || !question.teacherTip) {
    throw new Error(`${id}: current question record is incomplete`);
  }
  if (/最完整符合題幹所給的條件與證據|答案最符合條件與證據/.test(question.explanation)) throw new Error(`${id}: generic explanation remains`);
  if (question.requiresImage) {
    if (!question.questionImage || !question.questionImages?.includes(question.questionImage) || !serviceWorker.includes(question.questionImage)) {
      throw new Error(`${id}: required image is not linked and offline-cached`);
    }
    await access(join(root, question.questionImage.replace(/^\.\//, "")));
  }
}

if (new Set(linkedFindings.map(item => item.id)).size !== linkedFindings.length) throw new Error("Duplicate stale findings found for a reviewed question");
if (!linkedFindings.length) {
  console.log("Selected OFF-0400–0406 and OFF-0417–0424 stale findings are already reconciled; current item checks passed.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Removed ${linkedFindings.length} stale findings after revalidating current science items.`);
