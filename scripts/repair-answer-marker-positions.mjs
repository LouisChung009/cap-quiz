import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const write = process.argv.includes("--write");
const summary = [];

function normalizeOption(value) {
  return String(value).toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

function remapQuotedOptions(source, row) {
  let changes = 0;
  const text = source.replace(/([A-D])([「“"])([^」”"]+)([」”"])/g, (match, oldLetter, open, quote, close) => {
    const normalized = normalizeOption(quote);
    const matches = row.options.map((option, index) => normalizeOption(option) === normalized ? index : -1).filter(index => index >= 0);
    if (matches.length !== 1) return match;
    const newLetter = "ABCD"[matches[0]];
    if (newLetter === oldLetter) return match;
    changes += 1;
    return `${newLetter}${open}${quote}${close}`;
  });
  return { text, changes };
}

function remapAnswerMarkers(source, row, english) {
  const expected = "ABCD"[row.answer];
  let changes = 0;
  const patterns = english
    ? [
        /(\b(?:correct answer|answer)\s*(?:is|:|=|should be)\s*)([A-D])\b/gi,
        /((?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?)([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
        /((?:答案是|答案為|選)\s*[「（(]?)([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
        /(\bchoose\s+)([A-D])(?=[,.:;\s]|$)/gi,
      ]
    : [
        /((?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?)([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
        /((?:故|因此|所以)\s*選\s*[「（(]?)([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
        /(選\s*[「（(]?)([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
      ];
  let text = source;
  for (const pattern of patterns) {
    text = text.replace(pattern, (match, prefix, oldLetter) => {
      if (oldLetter === expected) return match;
      changes += 1;
      return `${prefix}${expected}`;
    });
  }
  return { text, changes };
}

for (const file of files) {
  const path = join(root, "data", `${file}.json`);
  const rows = JSON.parse(await readFile(path, "utf8"));
  let quotedChanges = 0;
  let answerChanges = 0;
  for (const row of rows) {
    if (!Array.isArray(row.options) || !Number.isInteger(row.answer) || !row.options[row.answer]) continue;
    for (const field of ["explanation", "teacherTip", "commonMistake"]) {
      if (typeof row[field] !== "string") continue;
      const mapped = remapQuotedOptions(row[field], row);
      const keyed = remapAnswerMarkers(mapped.text, row, file === "english");
      row[field] = keyed.text;
      quotedChanges += mapped.changes;
      answerChanges += keyed.changes;
    }
    if (Array.isArray(row.solutionSteps)) {
      row.solutionSteps = row.solutionSteps.map(step => {
        const mapped = remapQuotedOptions(step, row);
        const keyed = remapAnswerMarkers(mapped.text, row, file === "english");
        quotedChanges += mapped.changes;
        answerChanges += keyed.changes;
        return keyed.text;
      });
    }
  }
  summary.push({ file, rows: rows.length, quotedChanges, answerChanges });
  if (write) await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
}

for (const item of summary) console.log(`${item.file}: ${item.rows}題；引用選項字母修正 ${item.quotedChanges}處；答案標記修正 ${item.answerChanges}處`);
console.log(write ? "已寫入修正。" : "預覽模式，尚未寫入。加上 --write 才會修改題庫。");
