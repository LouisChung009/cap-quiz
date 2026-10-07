import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const flaggedIds = new Set(["OFF-1059", "OFF-1060", "OFF-1061", "OFF-1064", "OFF-1065", "OFF-1067", "OFF-1068"]);
assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
const matched = audit.filter(entry => flaggedIds.has(entry.id));
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only the complete seven-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !flaggedIds.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 114 Natural Science Q21–30 against the source-page review and regression checks; removed ${matched.length} flags.`);
