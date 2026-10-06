import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "數學-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const ids = new Set(Array.from({ length: 10 }, (_, index) => `OFF-${String(328 + index).padStart(4, "0")}`));
const reviewed = questions.filter(question => ids.has(question.id));

if (reviewed.length !== ids.size) throw new Error(`Expected ${ids.size} reviewed items, found ${reviewed.length}`);
for (const question of reviewed) {
  if (question.subject !== "數學" || Number(question.source?.year) !== 111 || question.source?.questionNumber !== 11 + Number(question.id.slice(-2)) - 28 || !question.explanation || question.explanation.includes("最完整符合題幹所給的條件與證據") || question.solutionSteps?.length < 3) {
    throw new Error(`${question.id}: current record does not meet reviewed evidence requirements`);
  }
  if (question.options?.length !== 4 || new Set(question.options).size !== 4 || !Number.isInteger(question.answer) || !question.options[question.answer]) throw new Error(`${question.id}: choices or answer index are incomplete`);
  if (question.requiresImage) {
    const images = question.questionImages?.length ? question.questionImages : [question.questionImage].filter(Boolean);
    if (!images.length) throw new Error(`${question.id}: required figure is missing`);
    for (const image of images) await access(join(root, image.replace(/^\.\//, "").split(/[?#]/, 1)[0]));
  }
}

const matched = audit.filter(item => ids.has(item.id));
if (!matched.length) {
  console.log("Stale findings OFF-0328–0337 are already cleared.");
  process.exit(0);
}
if (matched.length !== ids.size) throw new Error(`Expected ${ids.size} stale audit records, found ${matched.length}`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.has(item.id)), null, 2)}\n`, "utf8");
console.log(`Cleared ${matched.length} stale findings after verifying current records OFF-0328–0337.`);
