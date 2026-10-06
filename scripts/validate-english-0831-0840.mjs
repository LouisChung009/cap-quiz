import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0831", 2, "has collected"],
  ["ENG-0832", 3, "whose"],
  ["ENG-0833", 0, "Students who have not submitted it"],
  ["ENG-0834", 0, "had"],
  ["ENG-0835", 1, "clearly"],
  ["ENG-0836", 2, "preserve"],
  ["ENG-0837", 3, "can't they"],
  ["ENG-0838", 0, "The driver will try to deliver the parcel again"],
  ["ENG-0839", 0, "are confirmed"],
  ["ENG-0840", 1, "misleading"],
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
console.log("English ENG-0831–0840 answer keys and teaching explanations passed.");
