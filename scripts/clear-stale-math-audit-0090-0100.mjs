import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "數學-teacher-audit.json");
const questionsPath = join(root, "data", "mission-questions.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(questionsPath, "utf8"));
const ids = new Set(Array.from({ length: 11 }, (_, index) => `OFF-${String(90 + index).padStart(4, "0")}`));
const reviewed = questions.filter(question => ids.has(question.id));

if (reviewed.length !== ids.size) throw new Error(`Expected ${ids.size} reviewed items, found ${reviewed.length}`);
for (const question of reviewed) {
  if (question.subject !== "數學" || Number(question.source?.year) !== 110 || !question.explanation || question.explanation.length < 45 || question.explanation.includes("最完整符合題幹所給的條件與證據")) {
    throw new Error(`${question.id}: current record does not satisfy reviewed evidence and solution requirements`);
  }
  if (!Array.isArray(question.solutionSteps) || question.solutionSteps.length < 3) throw new Error(`${question.id}: insufficient worked steps`);
  if (question.type === "非選擇題") {
    if (question.options?.length !== 0 || question.answer !== null || !Array.isArray(question.responseParts) || question.responseParts.length < 2) throw new Error(`${question.id}: constructed-response format is incomplete`);
  } else if (question.options?.length !== 4 || !Number.isInteger(question.answer) || !question.options[question.answer]) {
    throw new Error(`${question.id}: multiple-choice options or answer index are incomplete`);
  }
}

const matched = audit.filter(item => ids.has(item.id));
if (matched.length === 0) {
  console.log("Stale findings OFF-0090–0100 are already cleared.");
  process.exit(0);
}
if (matched.length !== ids.size) throw new Error(`Expected ${ids.size} stale audit records, found ${matched.length}`);
const nextAudit = audit.filter(item => !ids.has(item.id));
await writeFile(auditPath, `${JSON.stringify(nextAudit, null, 2)}\n`, "utf8");
console.log(`Cleared ${matched.length} stale findings after verifying current records OFF-0090–0100.`);
