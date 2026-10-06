import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0901", 2, "still"],
  ["ENG-0902", 3, "visited"],
  ["ENG-0903", 2, "At 5:00 p.m."],
  ["ENG-0904", 0, "to sign"],
  ["ENG-0905", 1, "with"],
  ["ENG-0906", 2, "the largest"],
  ["ENG-0907", 0, "At the security office"],
  ["ENG-0908", 3, "were cleaned"],
  ["ENG-0909", 0, "fill out"],
  ["ENG-0910", 1, "so"],
  ["ENG-0911", 2, "has tested"],
  ["ENG-0912", 3, "who"],
  ["ENG-0913", 2, "45 minutes"],
  ["ENG-0914", 0, "had read"],
  ["ENG-0915", 1, "confidently"],
  ["ENG-0916", 2, "relax"],
  ["ENG-0917", 3, "don't they"],
  ["ENG-0918", 0, "Use the stairs marked by exit signs"],
  ["ENG-0919", 0, "check"],
  ["ENG-0920", 1, "different"],
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
const contextualEvidence = new Map([
  ["ENG-0911", ["water samples from three local rivers", "This is the first time", "has tested"]],
  ["ENG-0903", ["practice ends at 4:30", "cleaned from 4:30 to 5:00", "arrives at 4:45", "begins at 5:00"]],
  ["ENG-0906", ["every other known animal", "none is larger", "the largest"]],
  ["ENG-0907", ["found beside the gym", "handed it to the security officer", "keep it until closing"]]
]);
for (const [id, anchors] of contextualEvidence) {
  const row = rows.find(item => item.id === id);
  const evidence = `${row?.question || ""} ${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")} ${row?.teacherTip || ""}`.toLowerCase();
  if (anchors.some(anchor => !evidence.includes(anchor.toLowerCase()))) failures.push(`${id}: missing context clues or multi-step reading evidence`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0901–0920 answer keys and teaching explanations passed.");
