import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = Array.from({ length: 4 }, (_, index) => `OFF-${String(431 + index).padStart(4, "0")}`);
const keys = [1, 3, 1, 0];
const findings = audit.filter(item => ids.includes(item.id));

for (let index = 0; index < ids.length; index++) {
  const id = ids[index];
  const question = questions.find(item => item.id === id);
  if (!question || question.subject !== "自然" || question.source?.year !== 111 || question.source?.questionNumber !== index + 35 || question.answer !== keys[index] || question.options?.length !== 4 || question.solutionSteps?.length < 3 || !question.teacherTip) throw new Error(`${id}: source, answer, options, or solution mismatch`);
  if (question.requiresImage || question.questionImage || question.questionImages?.length) throw new Error(`${id}: current text question unexpectedly relies on a missing image`);
  if (/答案最符合條件與證據|最完整符合題幹所給的條件與證據/.test(question.explanation)) throw new Error(`${id}: generic explanation remains`);
}
if (new Set(findings.map(item => item.id)).size !== findings.length) throw new Error("Duplicate stale findings found");
if (!findings.length) {
  console.log("OFF-0431–0434 stale findings are already reconciled; current text and solution checks passed.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Removed ${findings.length} stale science material/explanation findings after rechecking OFF-0431–0434.`);
