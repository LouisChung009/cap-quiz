import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0851", 0, "has checked"],
  ["ENG-0852", 1, "whose"],
  ["ENG-0853", 0, "June 30"],
  ["ENG-0854", 2, "would have heard"],
  ["ENG-0855", 3, "carefully"],
  ["ENG-0856", 0, "explicit"],
  ["ENG-0857", 1, "doesn't it"],
  ["ENG-0858", 2, "Let it rest longer"],
  ["ENG-0859", 3, "joins"],
  ["ENG-0860", 0, "similar"],
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
console.log("English ENG-0851–0860 answer keys and teaching explanations passed.");
