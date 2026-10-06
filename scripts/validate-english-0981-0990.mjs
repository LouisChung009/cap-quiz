import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0981", 0, "clarify"],
  ["ENG-0982", 1, "sang"],
  ["ENG-0983", 0, "Use the stairs beside the café"],
  ["ENG-0984", 2, "to run"],
  ["ENG-0985", 0, "for"],
  ["ENG-0986", 3, "reliable"],
  ["ENG-0987", 0, "Bring a draft, exchange it for feedback, then submit the final version."],
  ["ENG-0988", 2, "is maintained"],
  ["ENG-0989", 0, "write down"],
  ["ENG-0990", 1, "because"],
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
  ["ENG-0986", ["six cloudy days", "power outage", "reliable means dependable"]],
  ["ENG-0987", ["bring a draft", "exchange papers", "final version afterward"]],
  ["ENG-0990", ["bus delay", "caused the trip", "because introduces a cause"]],
]) {
  const row = rows.find(item => item.id === id);
  const evidence = `${row?.question || ""} ${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")}`.toLowerCase();
  for (const phrase of phrases) if (!evidence.includes(phrase.toLowerCase())) failures.push(`${id}: missing reasoning evidence: ${phrase}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0981–0990 answer keys, evidence, and teaching fields passed.");
