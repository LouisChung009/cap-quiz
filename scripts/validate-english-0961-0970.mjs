import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0961", 0, "inspected"],
  ["ENG-0962", 3, "had seen"],
  ["ENG-0963", 1, "45 minutes"],
  ["ENG-0964", 1, "moving"],
  ["ENG-0965", 0, "for"],
  ["ENG-0966", 2, "faster"],
  ["ENG-0967", 1, "In the lounge"],
  ["ENG-0968", 3, "were repaired"],
  ["ENG-0969", 0, "set up"],
  ["ENG-0970", 1, "Therefore"],
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

const metadata = new Map([
  ["ENG-0962", "過去完成式"],
  ["ENG-0964", "動名詞作受詞"],
]);
for (const [id, point] of metadata) {
  if (rows.find(item => item.id === id)?.knowledgePoint !== point) failures.push(`${id}: knowledge-point mismatch`);
}

for (const [id, phrases] of [
  ["ENG-0961", ["chips or cracks", "inspect means examine"]],
  ["ENG-0962", ["earlier exhibition", "had + past participle", "had seen"]],
  ["ENG-0964", ["consider + gerund", "moving"]],
  ["ENG-0966", ["80 km/h", "60 km/h", "comparative form"]],
  ["ENG-0968", ["yesterday", "past simple passive", "were repaired"]],
]) {
  const row = rows.find(item => item.id === id);
  const evidence = `${row?.question || ""} ${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")}`.toLowerCase();
  for (const phrase of phrases) if (!evidence.includes(phrase.toLowerCase())) failures.push(`${id}: missing reasoning evidence: ${phrase}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0961–0970 answer keys, evidence, and metadata passed.");
