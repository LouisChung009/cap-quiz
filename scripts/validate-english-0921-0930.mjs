import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0921", 0, "protect"],
  ["ENG-0922", 2, "visited"],
  ["ENG-0923", 1, "Wednesday at 10 a.m."],
  ["ENG-0924", 1, "to keep"],
  ["ENG-0925", 0, "from"],
  ["ENG-0926", 3, "clearer"],
  ["ENG-0927", 0, "Add the milk to the shopping list"],
  ["ENG-0928", 0, "is updated"],
  ["ENG-0929", 1, "clear away"],
  ["ENG-0930", 2, "yet"],
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

const row927 = rows.find(item => item.id === "ENG-0927");
const evidence927 = `${row927?.question || ""} ${row927?.explanation || ""} ${(row927?.solutionSteps || []).join(" ")}`.toLowerCase();
for (const phrase of ["pronoun it refers to milk", "before the trip to the store", "misidentify the item, reverse the instruction"]) {
  if (!evidence927.includes(phrase)) failures.push(`ENG-0927: missing tested reading evidence: ${phrase}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0921–0930 answer keys, options, and explanations passed.");
