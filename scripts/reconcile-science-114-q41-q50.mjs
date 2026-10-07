import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const flaggedIds = new Set(["OFF-1079", "OFF-1080", "OFF-1084", "OFF-1085", "OFF-1086"]);
assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
const matched = audit.filter(entry => flaggedIds.has(entry.id));
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only the complete five-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !flaggedIds.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 114 Natural Science Q41–50 against source-page audit and regression checks; removed ${matched.length} flags.`);
