import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "英文-teacher-audit.json");
const bank = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = Array.from({ length: 100 }, (_, index) => `ENG-${String(601 + index).padStart(4, "0")}`);
const findings = audit.filter(item => ids.includes(item.id));

for (const id of ids) {
  const question = bank.find(item => item.id === id);
  if (!question || !question.question || question.options?.length !== 4 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3 || !question.explanation || question.solutionSteps?.length < 2) {
    throw new Error(`${id}: current record is missing or malformed`);
  }
  if (/\breport\s*(?:number\s*)?\d+\b|\brapid\b/i.test(question.question)) throw new Error(`${id}: stale report/rapid premise still matches current stem`);
}

if (new Set(findings.map(item => item.id)).size !== findings.length) throw new Error("Duplicate stale findings found in English audit register");
if (!findings.length) {
  console.log("ENG-0601–0700 stale premise findings are already reconciled; current bank checks passed.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Removed ${findings.length} stale English report/rapid premise findings after scanning current ENG-0601–0700 stems.`);
