import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "國文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const ids = ["OFF-0013", "OFF-0016", "OFF-0033", "OFF-0875", "OFF-0879", "OFF-0895"];
for (const id of ids) {
  const question = questions.find(item => item.id === id);
  if (!question || /\(cid:\d+\)/i.test(question.question) || question.options?.length !== 4 || question.solutionSteps?.length < 3) throw new Error(`${id}: OCR text, choices, or worked solution is incomplete`);
  if (question.options.every(option => /^[A-D]$/.test(option)) && question.optionDescriptions?.length !== 4) throw new Error(`${id}: image-only choices need four accessible descriptions`);
  if (question.requiresImage) {
    const images = question.questionImages?.length ? question.questionImages : [question.questionImage].filter(Boolean);
    if (!images.length) throw new Error(`${id}: required image is missing`);
    for (const image of images) await access(join(root, image.replace(/^\.\//, "").split(/[?#]/, 1)[0]));
  }
}
const row = audit.find(item => item.id === ids.join(", "));
if (!row) {
  console.log("Stale CID/choice finding for the six Chinese items is already cleared.");
  process.exit(0);
}
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => item !== row), null, 2)}\n`, "utf8");
console.log("Cleared stale CID finding after verifying six current items and adding accessible labels for both visual-choice questions.");
