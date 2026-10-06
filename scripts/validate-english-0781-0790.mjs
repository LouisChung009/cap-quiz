import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0781", 2, "A safe place"],
  ["ENG-0782", 2, "was tasting"],
  ["ENG-0783", 3, "A reusable bottle"],
  ["ENG-0784", 0, "to practice"],
  ["ENG-0785", 1, "for"],
  ["ENG-0786", 2, "easier"],
  ["ENG-0787", 1, "The west path"],
  ["ENG-0788", 3, "will be displayed"],
  ["ENG-0789", 0, "turn off"],
  ["ENG-0790", 1, "so"],
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
const shelter = rows.find(row => row.id === "ENG-0781");
const reusableContainer = rows.find(row => row.id === "ENG-0783");
if (!shelter?.question.includes("heavy rain")) failures.push("ENG-0781: unnatural or incomplete weather phrase");
if (!reusableContainer?.question.includes("must bring a reusable container") || !reusableContainer.explanation.includes("符合全部條件")) failures.push("ENG-0783: reusable-container requirement is ambiguous");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0781–0790 answer keys, evidence, and teaching explanations passed.");
