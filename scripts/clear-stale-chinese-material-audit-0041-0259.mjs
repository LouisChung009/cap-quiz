import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "國文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const groups = [
  ["OFF-0041"],
  ["OFF-0043", "OFF-0045", "OFF-0047", "OFF-0048"],
  ["OFF-0233", "OFF-0236"],
  ["OFF-0257", "OFF-0258", "OFF-0259"]
];
const ids = new Set(groups.flat());
const items = questions.filter(question => ids.has(question.id));

if (items.length !== ids.size) throw new Error(`Expected ${ids.size} current questions, found ${items.length}`);
for (const question of items) {
  if (question.subject !== "國文" || !question.question || !question.explanation || question.solutionSteps?.length < 3 || question.options?.length !== 4) {
    throw new Error(`${question.id}: incomplete question or teaching fields`);
  }
  if (question.id === "OFF-0041" && (question.question.length < 500 || question.options[3].includes("魯冰花") || question.options[3].length > 100)) throw new Error("OFF-0041: reading text or clean D choice is not present");
  if (["OFF-0043", "OFF-0045", "OFF-0047", "OFF-0048"].includes(question.id) && question.question.length < 250) throw new Error(`${question.id}: shared passage material is incomplete`);
  if (question.id === "OFF-0233" && !question.question.includes("【圖示文字】")) throw new Error("OFF-0233: image text transcription is missing");
  if (question.id === "OFF-0236") {
    if (!question.requiresImage || !question.questionImage?.includes("111-chinese-q04-original-glyph-crop.svg")) throw new Error("OFF-0236: source-faithful glyph crop is not enabled");
    await access(join(root, question.questionImage.replace(/^\.\//, "").split(/[?#]/, 1)[0]));
  }
  if (["OFF-0257", "OFF-0258", "OFF-0259"].includes(question.id) && question.question.length < 200) throw new Error(`${question.id}: chart/poster transcription is incomplete`);
}

const matchingRows = audit.filter(item => groups.some(group => item.id === group.join(", ")));
if (matchingRows.length !== groups.length) throw new Error(`Expected ${groups.length} stale grouped findings, found ${matchingRows.length}`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !groups.some(group => item.id === group.join(", "))), null, 2)}\n`, "utf8");
console.log(`Cleared ${matchingRows.length} stale material findings covering ${ids.size} Chinese official questions.`);
