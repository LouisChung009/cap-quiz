import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const ids = Array.from({ length: 8 }, (_, index) => `OFF-${String(345 + index).padStart(4, "0")}`);
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const findings = audit.filter(item => ids.includes(item.id));

for (const [index, id] of ids.entries()) {
  const number = index + 3;
  const item = questions.find(row => row.id === id);
  if (!item || item.subject !== "社會" || item.source?.year !== 111 || item.source?.questionNumber !== number) throw new Error(`${id}: source identity mismatch`);
  if (item.options?.length !== 4 || !Number.isInteger(item.answer) || item.answer < 0 || item.answer > 3 || item.solutionSteps?.length < 3 || !item.teacherTip) throw new Error(`${id}: current question or worked explanation incomplete`);
  if (/\(cid:\d+\)|查看官方試題頁面|最完整符合題幹所給的條件與證據/.test([item.question, ...item.options, item.explanation, ...item.solutionSteps].join(" "))) throw new Error(`${id}: OCR placeholder or generic explanation remains`);
  if (number === 3) {
    const image = "./assets/official-exams/111-social-q03-china-routes.png";
    if (!item.requiresImage || !item.questionImages?.includes(image) || !serviceWorker.includes(image)) throw new Error(`${id}: required route map is not attached and offline cached`);
    await access(join(root, image.replace(/^\.\//, "")));
  } else if (item.requiresImage || item.questionImages?.length) throw new Error(`${id}: complete textual material should not use an unnecessary scan`);
}

if (new Set(findings.map(item => item.id)).size !== findings.length) throw new Error("Duplicate findings exist in the reviewed range");
if (!findings.length) {
  console.log("OFF-0345–0352 stale findings are already reconciled; current records passed checks.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Removed ${findings.length} stale findings after verifying OFF-0345–0352 against source page 2 and current question records.`);
