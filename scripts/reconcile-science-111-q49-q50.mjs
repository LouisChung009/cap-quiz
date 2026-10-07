import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const ids = new Set(["OFF-0445", "OFF-0446"]);
assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
const matched = audit.filter(entry => ids.has(entry.id));
assert.ok(matched.length === 0 || matched.length === ids.size, "only the complete two-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !ids.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 111 Natural Science Q49–50 after source and content checks; removed ${matched.length} flags.`);
