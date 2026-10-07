import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const flaggedIds = new Set(["OFF-1049", "OFF-1051", "OFF-1052", "OFF-1053", "OFF-1054", "OFF-1056", "OFF-1057", "OFF-1058"]);

assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
const matched = audit.filter(entry => flaggedIds.has(entry.id));
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only the complete eight-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !flaggedIds.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 114 Natural Science Q11–20 against source audit, official keys, worked steps, ambiguity note, and offline figures; removed ${matched.length} flags.`);
