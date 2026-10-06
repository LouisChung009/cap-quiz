import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "國文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const groups = [
  ["OFF-0261", "OFF-0262", "OFF-0263"],
  ["OFF-0269", "OFF-0270", "OFF-0271", "OFF-0272"]
];
for (const group of groups) {
  for (const id of group) {
    const question = questions.find(item => item.id === id);
    if (!question || question.subject !== "國文" || !question.question.startsWith("【閱讀材料】") && !question.question.startsWith("【閱讀材料】柏拉圖") && !question.question.startsWith("【資料甲】") || question.question.length < 200 || question.options?.length !== 4 || question.solutionSteps?.length < 3) {
      throw new Error(`${id}: text material or answer-teaching fields are incomplete`);
    }
    if (question.requiresImage && !question.questionImage && !question.questionImages?.length) throw new Error(`${id}: required figure is missing`);
  }
}
const rowIds = new Set(groups.map(group => group.join(", ")));
const found = audit.filter(row => rowIds.has(row.id));
if (!found.length) {
  console.log("Stale findings for OFF-0261–0263 and OFF-0269–0272 are already cleared.");
  process.exit(0);
}
if (found.length !== groups.length) throw new Error(`Expected ${groups.length} grouped findings, found ${found.length}`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(row => !rowIds.has(row.id)), null, 2)}\n`, "utf8");
console.log(`Cleared ${found.length} stale findings covering ${groups.flat().length} self-contained Chinese questions.`);
