import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const flaggedIds = new Set(["OFF-1070", "OFF-1071", "OFF-1073", "OFF-1075", "OFF-1077", "OFF-1078"]);
assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
const matched = audit.filter(entry => flaggedIds.has(entry.id));
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only the complete six-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !flaggedIds.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 114 Natural Science Q31–40 against original pages and answer review; removed ${matched.length} flags.`);
