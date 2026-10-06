import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0991", 2, "has been testing"],
  ["ENG-0992", 3, "whose"],
  ["ENG-0993", 0, "The 11:05 service, at about 11:20"],
  ["ENG-0994", 0, "had asked"],
  ["ENG-0995", 1, "locate"],
  ["ENG-0996", 0, "distinguish"],
  ["ENG-0997", 1, "haven't they"],
  ["ENG-0998", 0, "Return it to the cart and connect it to the red port."],
  ["ENG-0999", 2, "will email"],
  ["ENG-1000", 3, "precise"],
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

for (const [id, phrases] of [
  ["ENG-0991", ["since dawn", "still underway", "present perfect continuous"]],
  ["ENG-0992", ["training schedule", "whose", "marks possession"]],
  ["ENG-0993", ["15-minute delay", "about 11:20", "before 11:40"]],
  ["ENG-0995", ["grouping titles consistently", "predictable position", "locate, which means"]],
  ["ENG-0998", ["14%", "20% threshold", "red port"]],
  ["ENG-0999", ["possible future condition", "will + base verb"]],
  ["ENG-1000", ["2.4 bar", "30 seconds", "exact and accurate"]],
]) {
  const row = rows.find(item => item.id === id);
  const evidence = `${row?.question || ""} ${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")}`.toLowerCase();
  for (const phrase of phrases) if (!evidence.includes(phrase.toLowerCase())) failures.push(`${id}: missing reasoning evidence: ${phrase}`);
}

const completedAspect = rows.find(item => item.id === "ENG-0991");
if (completedAspect?.knowledgePoint !== "現在完成進行式") failures.push("ENG-0991: knowledge-point mismatch");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0991–1000 answer keys, evidence, and teaching fields passed.");
