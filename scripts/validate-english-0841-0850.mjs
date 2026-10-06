import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0841", 2, "postpone"],
  ["ENG-0842", 3, "were preparing"],
  ["ENG-0843", 0, "Pine Street"],
  ["ENG-0844", 1, "drinking"],
  ["ENG-0845", 2, "of"],
  ["ENG-0846", 3, "thinner"],
  ["ENG-0847", 0, "Pick up the book before the hold expires"],
  ["ENG-0848", 1, "will be sent"],
  ["ENG-0849", 2, "put on"],
  ["ENG-0850", 3, "yet"],
];
const failures = [];
for (const [id, answer, option] of expected) {
  const row = rows.find(item => item.id === id);
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== option) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip || row.relatedWords?.length < 2) failures.push(`${id}: missing teaching explanation fields`);
}
const comparative = rows.find(row => row.id === "ENG-0846");
if (!comparative?.question.includes("thick stack of papers") || !comparative.question.includes("leaves room to zip") || !comparative.solutionSteps?.some(step => step.includes("thick stack of papers"))) failures.push("ENG-0846: comparative lacks explicit thickness evidence");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0841–0850 answer keys and teaching explanations passed.");
