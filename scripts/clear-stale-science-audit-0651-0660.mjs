import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const auditPath = join(root, "reports/自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = Array.from({ length: 10 }, (_, index) => `OFF-${String(651 + index).padStart(4, "0")}`);
const answerIndices = [0, 3, 0, 3, 2, 1, 1, 1, 0, 2];
const figureFiles = new Map([
  ["OFF-0651", "112-science-q41-separation-flow.png"],
  ["OFF-0652", "112-science-q42-parallel-circuits.png"],
  ["OFF-0654", "112-science-q44-carbon-chart.png"],
  ["OFF-0656", "112-science-q46-wind-power-curve.png"],
  ["OFF-0659", "112-science-q49-liquefaction-model.svg"],
  ["OFF-0660", "112-science-q50-liquefaction-profiles.png"]
]);

for (let index = 0; index < ids.length; index++) {
  const id = ids[index];
  const item = questions.find(question => question.id === id);
  if (!item || item.source?.year !== 112 || item.source?.questionNumber !== 41 + index || item.answer !== answerIndices[index]) {
    throw new Error(`${id}: source identity or official answer mismatch`);
  }
  if (!item.answerKeyReview?.status || item.options?.length !== 4 || item.solutionSteps?.length < 3 || !item.explanation || !item.teacherTip) {
    throw new Error(`${id}: answer or teaching data incomplete`);
  }
  if (figureFiles.has(id) && !item.questionImages?.some(image => image.endsWith(figureFiles.get(id)))) {
    throw new Error(`${id}: required source figure is not attached`);
  }
}
const auditSet = new Set(ids);
const remaining = audit.filter(finding => !auditSet.has(finding.id));
const removed = audit.length - remaining.length;
if (removed !== ids.length) throw new Error(`Expected ${ids.length} stale findings; found ${removed}`);
await writeFile(auditPath, `${JSON.stringify(remaining, null, 2)}\n`, "utf8");
console.log(`Reconciled ${removed} generic stale findings after 112 Science Q41–50 source-data verification.`);
