import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0861", 0, "allow"],
  ["ENG-0862", 1, "was performing"],
  ["ENG-0863", 2, "Dry them"],
  ["ENG-0864", 3, "uploading"],
  ["ENG-0865", 0, "to"],
  ["ENG-0866", 1, "less"],
  ["ENG-0867", 2, "Drive more slowly and leave extra distance"],
  ["ENG-0868", 3, "will be posted"],
  ["ENG-0869", 0, "give away"],
  ["ENG-0870", 1, "therefore"],
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
console.log("English ENG-0861–0870 answer keys and teaching explanations passed.");
