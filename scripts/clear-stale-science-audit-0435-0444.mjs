import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expected = [1, 3, 3, 1, 2, 3, 3, 3, 0, 3];
for (let index = 0; index < 10; index++) {
  const number = index + 39;
  const id = `OFF-${String(number + 396).padStart(4, "0")}`;
  const question = questions.find(item => item.id === id);
  if (!question || question.source?.year !== 111 || question.source?.questionNumber !== number || question.answer !== expected[index] || question.options?.length !== 4 || question.solutionSteps?.length < 3 || !question.teacherTip) throw new Error(`${id}: item checks failed; refusing to clear audit record`);
}
const q43 = questions.find(item => item.id === "OFF-0439");
if (!q43.question.includes("甲烷") || !q43.explanation.includes("可燃") || q43.solutionSteps?.some(step => /持續燃燒只能支持瓶內有氧氣/.test(step))) throw new Error("OFF-0439: science explanation check failed; refusing to clear audit record");
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = Array.from({ length: 10 }, (_, index) => `OFF-${String(435 + index).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
const next = audit.filter(item => !ids.includes(item.id));
await writeFile(auditPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(`Reconciled ${stale.length} stale findings after source recheck of OFF-0435–0444.`);
