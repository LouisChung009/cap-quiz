import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0821", 3, "accurate"],
  ["ENG-0822", 1, "was holding"],
  ["ENG-0823", 1, "Ask at the reception desk"],
  ["ENG-0824", 0, "watching"],
  ["ENG-0825", 1, "by"],
  ["ENG-0826", 2, "more"],
  ["ENG-0827", 1, "The side door"],
  ["ENG-0828", 3, "were checked"],
  ["ENG-0829", 0, "hand in"],
  ["ENG-0830", 1, "Although"],
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
const submissionItem = rows.find(row => row.id === "ENG-0829");
if (submissionItem?.options?.includes("hand over") || !submissionItem?.options?.includes("hand off")) failures.push("ENG-0829: a competing hand-in distractor remains");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0821–0830 answer keys and teaching explanations passed.");
