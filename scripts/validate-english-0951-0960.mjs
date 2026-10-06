import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const expected = [
  ["ENG-0951", 1, "in"],
  ["ENG-0952", 2, "hear"],
  ["ENG-0953", 3, "It may be offered to walk-in visitors"],
  ["ENG-0954", 3, "compare"],
  ["ENG-0955", 0, "too"],
  ["ENG-0956", 0, "sequential"],
  ["ENG-0957", 2, "doesn't it"],
  ["ENG-0958", 0, "To protect the pond and avoid attracting rats"],
  ["ENG-0959", 1, "4:35 p.m."],
  ["ENG-0960", 2, "alike"],
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
  ["ENG-0951", "介系詞搭配"],
  ["ENG-0952", "字彙辨析"],
  ["ENG-0954", "字彙語境"],
  ["ENG-0955", "程度副詞與 too...to 句型"],
  ["ENG-0959", "時間計算與閱讀理解"],
]);
for (const [id, point] of metadata) {
  if (rows.find(item => item.id === id)?.knowledgePoint !== point) failures.push(`${id}: knowledge-point mismatch`);
}

for (const [id, phrases] of [
  ["ENG-0953", ["2:45 tour", "begun", "walk-in visitors"]],
  ["ENG-0954", ["16.8", "18.6", "compare"]],
  ["ENG-0958", ["attracting rats", "water quality"]],
  ["ENG-0959", ["subtract 25 minutes", "4:35 p.m."]],
]) {
  const row = rows.find(item => item.id === id);
  const evidence = `${row?.question || ""} ${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")}`.toLowerCase();
  for (const phrase of phrases) if (!evidence.includes(phrase.toLowerCase())) failures.push(`${id}: missing reasoning evidence: ${phrase}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("English ENG-0951–0960 answer keys, evidence, and metadata passed.");
