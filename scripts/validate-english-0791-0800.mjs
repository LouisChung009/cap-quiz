import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0791", 2, "has sent"],
  ["ENG-0792", 3, "that"],
  ["ENG-0793", 0, "After the mixture cools"],
  ["ENG-0794", 1, "stayed"],
  ["ENG-0795", 2, "patiently"],
  ["ENG-0796", 0, "converted"],
  ["ENG-0797", 3, "were they"],
  ["ENG-0798", 0, "Store it in a refrigerator and use it soon"],
  ["ENG-0799", 0, "sends"],
  ["ENG-0800", 3, "inconsistent"],
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
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0791–0800 answer keys and teaching explanations passed.");
