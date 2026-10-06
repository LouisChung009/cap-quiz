import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "國文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(join(root, "data", "chinese.json"), "utf8"));
const validator = await readFile(join(root, "scripts", "validate-chinese-review-repairs.mjs"), "utf8");
const items = questions.filter(question => /^CHI-\d{4}$/.test(question.id) && Number(question.id.slice(-4)) <= 100);
const normalizedStems = new Set(items.map(question => question.question.replace(/\s+/g, " ").trim()));
const optionSets = new Set(items.map(question => JSON.stringify(question.options)));

if (items.length !== 100 || normalizedStems.size !== 100 || optionSets.size !== 100) throw new Error("Current CHI-0001–0100 records do not prove 100 distinct stems and option sets");
if (!validator.includes("CHI-0001–0100: current stems and option sets must not collapse to one repeated prompt")) throw new Error("Range-level uniqueness regression guard is missing");
const index = audit.findIndex(item => item.id === "CHI-0001–CHI-0100");
if (index === -1) {
  console.log("Stale duplicate finding CHI-0001–CHI-0100 is already cleared.");
  process.exit(0);
}
const nextAudit = audit.filter((_, itemIndex) => itemIndex !== index);
await writeFile(auditPath, `${JSON.stringify(nextAudit, null, 2)}\n`, "utf8");
console.log("Cleared stale duplicate finding CHI-0001–CHI-0100 after verifying current data and regression guard.");
