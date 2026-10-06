import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0941", 2, "warn"],
  ["ENG-0942", 1, "finished"],
  ["ENG-0943", 0, "A student ID"],
  ["ENG-0944", 2, "to drink"],
  ["ENG-0945", 3, "for"],
  ["ENG-0946", 0, "less"],
  ["ENG-0947", 0, "Get paper from the cabinet"],
  ["ENG-0948", 0, "were addressed"],
  ["ENG-0949", 1, "highlight"],
  ["ENG-0950", 2, "so"],
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

const row949 = rows.find(item => item.id === "ENG-0949");
if (row949?.knowledgePoint !== "字彙語境") failures.push("ENG-0949: knowledge point must match the general verb highlight");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0941–0950 answer keys, options, explanations, and metadata passed.");
