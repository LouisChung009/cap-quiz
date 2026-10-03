import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const failures = [];
function answerMarkers(row, source) {
  const patterns = row.subject === "英文"
    ? [
        /(?:correct answer|answer)\s*(?:is|:|=|should be)\s*([A-D])\b/gi,
        /(?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?([A-D])(?=[^A-Za-z0-9]|$)/g,
        /選\s*[「（(]?([A-D])(?=[^A-Za-z0-9]|$)/g,
        /\bchoose\s+([A-D])(?=[,.:;\s]|$)/g,
      ]
    : [
        /(?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?([A-D])(?=[^A-Za-z0-9]|$)/g,
        /(?:故|因此|所以)\s*選\s*[「（(]?([A-D])(?=[^A-Za-z0-9]|$)/g,
        /選\s*[「（(]?([A-D])(?=[^A-Za-z0-9]|$)/g,
      ];
  const markers = [];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) markers.push(match[1].toUpperCase());
  }
  return markers;
}
function normalizeOption(value) {
  return String(value).toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}
function quotedOptionMismatches(row, source) {
  const mismatches = [];
  for (const match of source.matchAll(/([A-D])(?:[「“"])([^」”"]+)[」”"]/g)) {
    const expectedOptions = row.options
      .map((option, index) => normalizeOption(option) === normalizeOption(match[2]) ? index : -1)
      .filter(index => index >= 0);
    if (expectedOptions.length === 1 && expectedOptions[0] !== match[1].charCodeAt(0) - 65) {
      mismatches.push(`${match[1]}「${match[2]}」`);
    }
  }
  return mismatches;
}

for (const file of files) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  for (const row of rows) {
    if (!Number.isInteger(row.answer) || !row.options?.[row.answer]) continue;
    const expected = String.fromCharCode(65 + row.answer);
    const source = `${row.explanation || ""} ${(row.solutionSteps || []).join(" ")}`;
    const conflicting = [...new Set(answerMarkers(row, source).filter(letter => letter !== expected))];
    if (conflicting.length) failures.push(`${row.id}: index=${expected}, explanation explicitly says ${conflicting.join(",")}`);
    const quoteConflicts = quotedOptionMismatches(row, source);
    if (quoteConflicts.length) failures.push(`${row.id}: option quote letter does not match quoted option text (${quoteConflicts.join(", ")})`);
  }
}

const official = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
for (const row of official) {
  if (!Number.isInteger(row.answer) || !row.options?.[row.answer]) continue;
  const expected = String.fromCharCode(65 + row.answer);
  const source = `${row.explanation || ""} ${(row.solutionSteps || row.steps || []).join(" ")}`;
  const conflicting = [...new Set(answerMarkers(row, source).filter(letter => letter !== expected))];
  if (conflicting.length) failures.push(`${row.id}: index=${expected}, explanation explicitly says ${conflicting.join(",")}`);
  if (row.answerKeyReview?.status === "verified") {
    const keyRecord = String(row.answerKeyReview.note || "").match(/第(\d+)題官方答案([A-D])/);
    if (keyRecord && (Number(keyRecord[1]) !== row.source?.questionNumber || keyRecord[2] !== expected)) {
      failures.push(`${row.id}: answer-key review note says Q${keyRecord[1]} ${keyRecord[2]}, but record is Q${row.source?.questionNumber} ${expected}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`答案索引與解析明示答案相衝突：${failures.length} 項`);
  process.exit(1);
}
console.log("五科題庫與歷屆真題的明示答案，均與答案索引一致。");
