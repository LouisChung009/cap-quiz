import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0881", 3, "measure"],
  ["ENG-0882", 1, "was sorting"],
  ["ENG-0883", 0, "Join the waiting list"],
  ["ENG-0884", 0, "watching"],
  ["ENG-0885", 1, "for"],
  ["ENG-0886", 2, "less"],
  ["ENG-0887", 0, "Go to section D"],
  ["ENG-0888", 3, "were replaced"],
  ["ENG-0889", 0, "put up"],
  ["ENG-0890", 1, "therefore"],
  ["ENG-0891", 2, "has updated"],
  ["ENG-0892", 3, "whose"],
  ["ENG-0893", 0, "6:30 p.m."],
  ["ENG-0894", 0, "would not have stopped"],
  ["ENG-0895", 1, "carefully"],
  ["ENG-0896", 2, "visual"],
  ["ENG-0897", 3, "don't they"],
  ["ENG-0898", 0, "Move bicycles away from the path"],
  ["ENG-0899", 0, "shuts"],
  ["ENG-0900", 1, "credible"],
];
const failures = [];
for (const [id, answer, option] of expected) {
  const row = rows.find(item => item.id === id);
  if (!row || row.answer !== answer || row.options?.length !== 4 || row.options?.[answer] !== option) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip || row.relatedWords?.length < 2) {
    failures.push(`${id}: missing question or teaching explanation fields`);
  }
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0881–0900 answer keys and teaching explanations passed.");
