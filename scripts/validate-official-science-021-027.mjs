import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const records = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expectedAnswers = [3, 0, 2, 0, 0, 3, 3];
const failures = [];

for (let offset = 0; offset < expectedAnswers.length; offset++) {
  const questionNumber = 21 + offset;
  const id = `OFF-${String(178 + questionNumber).padStart(4, "0")}`;
  const record = records.find(item => item.id === id);
  if (!record || record.answer !== expectedAnswers[offset]) failures.push(`${id}: unexpected or missing answer key`);
  if (!record || record.options?.length !== 4 || new Set(record.options).size !== 4) failures.push(`${id}: expected four distinct options`);
  if (!record || !record.explanation || record.solutionSteps?.length < 3 || !record.teacherTip) failures.push(`${id}: incomplete worked explanation`);
}

const heating = records.find(item => item.id === "OFF-0196");
if (heating?.solutionSteps?.[0]?.includes("表(三)")) failures.push("OFF-0196: explanation refers to a table not present in the question");

const carrot = records.find(item => item.id === "OFF-0200");
if (carrot?.explanation?.match(/正確答案為 A/)) failures.push("OFF-0200: redundant answer restatement remains in explanation");
if (!carrot?.question?.includes("395 mL") || !carrot.question.includes("328 mL")) failures.push("OFF-0200: fixed-time experiment data missing from the stem");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OFF-0199–0205 (110 Natural Sciences Q21–27) content regressions passed.");
