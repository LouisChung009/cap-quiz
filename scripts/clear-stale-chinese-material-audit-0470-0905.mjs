import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "國文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const groups = [
  ["OFF-0470"],
  ["OFF-0471", "OFF-0472"],
  ["OFF-0473", "OFF-0474", "OFF-0475"],
  ["OFF-0476", "OFF-0477", "OFF-0478", "OFF-0479"],
  ["OFF-0481", "OFF-0486", "OFF-0488"],
  ["OFF-0695"],
  ["OFF-0905"]
];
for (const group of groups) {
  for (const id of group) {
    const question = questions.find(item => item.id === id);
    if (!question || question.subject !== "國文" || question.question.length < 100 || /\(cid:\d+\)/i.test(question.question) || question.options?.length !== 4 || question.solutionSteps?.length < 3) {
      throw new Error(`${id}: passage, OCR cleanup, options, or worked solution is incomplete`);
    }
    if (question.requiresImage && !question.questionImage && !question.questionImages?.length) throw new Error(`${id}: required visual material is not linked`);
  }
}
const rowIds = new Set(groups.map(group => group.join(", ")));
const matched = audit.filter(item => rowIds.has(item.id));
if (!matched.length) {
  console.log("Selected stale Chinese material findings are already cleared.");
  process.exit(0);
}
if (matched.length !== groups.length) throw new Error(`Expected ${groups.length} grouped findings, found ${matched.length}`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !rowIds.has(item.id)), null, 2)}\n`, "utf8");
console.log(`Cleared ${matched.length} stale findings covering ${groups.flat().length} self-contained questions.`);
