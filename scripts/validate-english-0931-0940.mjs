import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0931", 3, "has run"],
  ["ENG-0932", 0, "who"],
  ["ENG-0933", 0, "The last car"],
  ["ENG-0934", 1, "had accepted"],
  ["ENG-0935", 1, "patiently"],
  ["ENG-0936", 2, "practical"],
  ["ENG-0937", 3, "shouldn't they"],
  ["ENG-0938", 0, "Keep it standing and avoid placing weight on it"],
  ["ENG-0939", 3, "checks"],
  ["ENG-0940", 0, "similar"],
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
  if (new Set(row.options).size !== 4) failures.push(`${id}: duplicate options`);
}

const row938 = rows.find(item => item.id === "ENG-0938");
const evidence938 = `${row938?.explanation || ""} ${(row938?.solutionSteps || []).join(" ")}`.toLowerCase();
for (const phrase of ["two separate rules", "violates the stacking rule", "turns it on its side"]) {
  if (!evidence938.includes(phrase)) failures.push(`ENG-0938: missing comparison evidence: ${phrase}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0931–0940 answer keys, options, and explanations passed.");
