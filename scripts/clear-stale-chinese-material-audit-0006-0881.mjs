import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "國文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const ids = ["OFF-0006", "OFF-0038", "OFF-0881"];
for (const id of ids) {
  const question = questions.find(item => item.id === id);
  if (!question || question.subject !== "國文" || /\(cid:\d+\)/i.test(question.question) || question.options?.length !== 4 || question.solutionSteps?.length < 3 || question.question.length < 60) {
    throw new Error(`${id}: CID/OCR, material, options, or solution issue remains`);
  }
  if (id === "OFF-0881" && (!question.question.includes("仄聲貼右") || !question.question.includes("上聯末字為仄聲"))) throw new Error("OFF-0881: diagram facts are not transcribed");
  if (question.requiresImage && !question.questionImage && !question.questionImages?.length) throw new Error(`${id}: required image is missing`);
}
const row = audit.find(item => item.id === ids.join(", "));
if (!row) {
  console.log("Stale finding for OFF-0006/0038/0881 is already cleared.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => item !== row), null, 2)}\n`, "utf8");
console.log("Cleared stale CID/missing-material finding for OFF-0006, OFF-0038, and OFF-0881.");
