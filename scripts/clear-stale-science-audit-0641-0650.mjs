import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const auditPath = join(root, "reports/自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = Array.from({ length: 10 }, (_, index) => `OFF-${String(641 + index).padStart(4, "0")}`);
const answers = [2, 2, 2, 3, 2, 0, 1, 3, 3, 0];
const figures = new Map([
  ["OFF-0641", "112-science-q31-tail-vessels.png"],
  ["OFF-0642", "112-science-q32-saliva-volume-graph.png"],
  ["OFF-0645", "112-science-q35-strawberry-flower.png"],
  ["OFF-0646", "112-science-q36-sun-shadow-map.png"],
  ["OFF-0647", "112-science-q37-magnetic-force-diagram.png"]
]);

for (let index = 0; index < ids.length; index++) {
  const id = ids[index];
  const item = questions.find(question => question.id === id);
  if (!item || item.source?.year !== 112 || item.source?.questionNumber !== 31 + index || item.answer !== answers[index]) {
    throw new Error(`${id}: source identity or official key mismatch`);
  }
  if (!item.answerKeyReview?.status || item.options?.length !== 4 || item.solutionSteps?.length < 3 || !item.explanation || !item.teacherTip) {
    throw new Error(`${id}: answer key or teaching content incomplete`);
  }
  if (figures.has(id) && !item.questionImages?.some(path => path.endsWith(figures.get(id)))) throw new Error(`${id}: source figure is not bound`);
  if (["OFF-0643", "OFF-0644", "OFF-0648", "OFF-0649", "OFF-0650"].includes(id) && item.requiresImage) {
    throw new Error(`${id}: text-transcribed stimulus should not require an image`);
  }
}
const q32 = questions.find(question => question.id === "OFF-0642");
if (!q32.explanation.includes("約 0.5 mL") || !q32.explanation.includes("約 5.5 mL") || !q32.solutionSteps[2].includes("約 4.5")) {
  throw new Error("OFF-0642: two-graph reasoning regression");
}

const idSet = new Set(ids);
const retained = audit.filter(finding => !idSet.has(finding.id));
const removed = audit.length - retained.length;
if (removed !== ids.length) throw new Error(`Expected ${ids.length} stale findings; found ${removed}`);
await writeFile(auditPath, `${JSON.stringify(retained, null, 2)}\n`, "utf8");
console.log(`Reconciled ${removed} stale generic findings after 112 Science Q31–40 source-page verification.`);
