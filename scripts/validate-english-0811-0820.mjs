import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0811", 1, "has built"],
  ["ENG-0812", 2, "whose"],
  ["ENG-0813", 3, "Chiayi"],
  ["ENG-0814", 0, "would not have taken"],
  ["ENG-0815", 1, "remarkably"],
  ["ENG-0816", 2, "easy to use or understand"],
  ["ENG-0817", 3, "shall we"],
  ["ENG-0818", 0, "Be available to sign for the package"],
  ["ENG-0819", 1, "arrive"],
  ["ENG-0820", 2, "ambiguous"],
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
console.log("English ENG-0811–0820 answer keys and teaching explanations passed.");
