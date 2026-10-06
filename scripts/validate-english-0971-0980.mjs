import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0971", 2, "has read"],
  ["ENG-0972", 3, "who"],
  ["ENG-0973", 0, "She cannot re-enter once she has left."],
  ["ENG-0974", 3, "Stop safely if there is enough distance to do so."],
  ["ENG-0975", 0, "carefully"],
  ["ENG-0976", 1, "accommodate"],
  ["ENG-0977", 2, "didn't it"],
  ["ENG-0978", 0, "Close the vents, then switch on the heater."],
  ["ENG-0979", 2, "rings"],
  ["ENG-0980", 3, "plausible"],
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
  ["ENG-0973", ["re-entry is not allowed", "cannot come back in"]],
  ["ENG-0974", ["yellow signal", "enough distance"]],
  ["ENG-0976", ["lower desk", "screen-reading software", "accommodate means"]],
  ["ENG-0978", ["vents open", "close the vents first"]],
]) {
  const row = rows.find(item => item.id === id);
  const evidence = `${row?.question || ""} ${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")}`.toLowerCase();
  for (const phrase of phrases) if (!evidence.includes(phrase.toLowerCase())) failures.push(`${id}: missing reasoning evidence: ${phrase}`);
}

const updatedMetadata = new Map([["ENG-0974", "交通安全判讀"]]);
for (const [id, point] of updatedMetadata) {
  if (rows.find(item => item.id === id)?.knowledgePoint !== point) failures.push(`${id}: knowledge-point mismatch`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0971–0980 answer keys, reasoning, and teaching fields passed.");
