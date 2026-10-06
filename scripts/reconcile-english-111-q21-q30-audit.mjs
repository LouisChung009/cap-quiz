import { readFile, writeFile } from "node:fs/promises";

const auditPath = new URL("../reports/英文-teacher-audit.json", import.meta.url);
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const clearIds = new Set(["OFF-0295", "OFF-0296", "OFF-0297", "OFF-0298", "OFF-0299", "OFF-0301", "OFF-0303", "OFF-0304"]);
const next = audit.filter(item => !clearIds.has(item.id));
const removed = audit.length - next.length;
if (removed !== clearIds.size) throw new Error(`預期清除 ${clearIds.size} 筆、實際 ${removed} 筆；停止以免誤刪。`);
await writeFile(auditPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(`已撤下 ${removed} 筆已失效的英文 111 年 Q21–30 通用警示；OFF-0302（Q28）保留待人工檢視。`);
