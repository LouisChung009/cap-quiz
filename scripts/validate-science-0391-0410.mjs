import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const failures = [];
for (let number = 391; number <= 410; number++) {
  const id = `SCI-${String(number).padStart(4, "0")}`;
  const question = rows.find(item => item.id === id);
  if (!question || question.options?.length !== 4 || new Set(question.options).size !== 4) {
    failures.push(`${id}: missing question or non-unique four options`);
    continue;
  }
  if (question.options[question.answer] === undefined) failures.push(`${id}: answer index is outside option list`);
  if (!question.explanation.includes(question.options[question.answer])) failures.push(`${id}: explanation does not name the correct option`);
  if (question.solutionSteps?.length < 3 || !question.teacherTip) failures.push(`${id}: missing worked steps or teacher tip`);
}
const density = rows.find(item => item.id === "SCI-0393");
if (density?.answer !== 1 || density?.options?.[1] !== "3.0" || !density?.explanation.includes("63÷21＝3.0")) failures.push("SCI-0393: density calculation, answer index, option, and explanation must agree");
const routine = rows.find(item => item.id === "SCI-0405");
if (routine?.knowledgePoint !== "細胞呼吸與ATP" || !routine.explanation.includes("ATP")) failures.push("SCI-0405: cell respiration question must identify ATP as the usable energy carrier");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0391–0410 options, answer references, worked explanations, and key concepts passed.");
