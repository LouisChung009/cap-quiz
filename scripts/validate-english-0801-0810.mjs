import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0801", 1, "revise"],
  ["ENG-0802", 2, "arrived"],
  ["ENG-0803", 1, "Thursday"],
  ["ENG-0804", 3, "to support"],
  ["ENG-0805", 0, "on"],
  ["ENG-0806", 1, "most creative"],
  ["ENG-0807", 2, "In an indoor area"],
  ["ENG-0808", 1, "is being repaired"],
  ["ENG-0809", 3, "put off"],
  ["ENG-0810", 0, "as long as"],
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
const bridgeItem = rows.find(row => row.id === "ENG-0808");
if (!bridgeItem?.question.includes("replacing damaged stones") || !bridgeItem.solutionSteps?.some(step => step.includes("更換損壞石塊"))) failures.push("ENG-0808: repair passive lacks explicit action evidence");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0801–0810 answer keys, evidence, and teaching explanations passed.");
