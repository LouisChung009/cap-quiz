import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "國文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const rows = JSON.parse(await readFile(join(root, "data", "chinese.json"), "utf8"));
const validator = await readFile(join(root, "scripts", "validate-chinese-review-repairs.mjs"), "utf8");
const expectedIds = [];
const checkedRanges = [];

for (let start = 101; start <= 1000; start += 100) {
  const end = start + 99;
  const group = rows.filter(row => {
    const number = Number(row.id.slice(-4));
    return number >= start && number <= end;
  });
  const uniqueStems = new Set(group.map(row => row.question.replace(/\s+/g, " ").trim()));
  const uniqueItems = new Set(group.map(row => `${row.question}|${[...row.options].sort().join("|")}`));
  if (group.length !== 100 || uniqueStems.size !== 100 || uniqueItems.size !== 100) throw new Error(`CHI-${start}–${end}: duplicate or missing current items`);
  const id = `CHI-${String(start).padStart(4, "0")}–CHI-${String(end).padStart(4, "0")}`;
  expectedIds.push(id);
  checkedRanges.push(`${start}–${end}`);
}
if (!validator.includes("expected 100 distinct question stems and item contents")) throw new Error("Persistent range uniqueness check is missing");
const staleRows = audit.filter(item => expectedIds.includes(item.id));
if (!staleRows.length) {
  console.log("Stale exact-clone findings for CHI-0101–1000 are already cleared.");
  process.exit(0);
}
if (staleRows.length !== expectedIds.length) throw new Error(`Expected ${expectedIds.length} range findings, found ${staleRows.length}`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !expectedIds.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Cleared ${staleRows.length} disproven exact-clone findings; each checked range contains 100 unique stems and item contents (${checkedRanges.join(", ")}).`);
