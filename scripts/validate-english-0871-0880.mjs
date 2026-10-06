import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0871", 2, "have owned"],
  ["ENG-0872", 3, "that"],
  ["ENG-0873", 0, "Between 1 and 4 p.m."],
  ["ENG-0874", 0, "had taken"],
  ["ENG-0875", 1, "quickly"],
  ["ENG-0876", 2, "explanation"],
  ["ENG-0877", 3, "have they"],
  ["ENG-0878", 0, "4:30 p.m."],
  ["ENG-0879", 1, "download"],
  ["ENG-0880", 2, "specific"],
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
console.log("English ENG-0871–0880 answer keys and teaching explanations passed.");
