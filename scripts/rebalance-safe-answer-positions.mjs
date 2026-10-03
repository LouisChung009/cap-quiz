import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const allFiles = ["chinese", "english", "math", "science", "social"];
const subjectArgument = process.argv.indexOf("--subject");
const files = subjectArgument >= 0 ? [process.argv[subjectArgument + 1]] : allFiles;
if (files.some(file => !allFiles.includes(file))) throw new Error("Unknown subject; use chinese, english, math, science, or social.");
const targetRun = process.argv.includes("--no-run-limit") ? Number.POSITIVE_INFINITY : 5;
const write = process.argv.includes("--write");
const patchMode = process.argv.includes("--patch-range");
const patchRangeIndex = process.argv.indexOf("--patch-range");
const patchStart = patchMode ? Number(process.argv[patchRangeIndex + 1]) : 0;
const patchEnd = patchMode ? Number(process.argv[patchRangeIndex + 2]) : 0;

function normalizeOption(value) {
  return String(value).toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}

function markers(text, english) {
  const patterns = english
    ? [/(?:correct answer|answer)\s*(?:is|:|=|should be)\s*([A-D])\b/gi]
    : [
        /(?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
        /選\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
      ];
  return patterns.flatMap(pattern => [...text.matchAll(pattern)].map(match => match[1].toUpperCase()));
}

function safeToMove(row, english) {
  if (!Array.isArray(row.options) || row.options.length !== 4 || new Set(row.options.map(normalizeOption)).size !== 4) return false;
  if (!Number.isInteger(row.answer) || row.answer < 0 || row.answer > 3) return false;
  const answerText = String(row.options?.[row.answer] || "");
  if (!answerText) return false;
  const support = `${row.explanation || ""} ${(row.solutionSteps || []).join(" ")}`;
  const allText = `${row.question || ""} ${support} ${row.teacherTip || ""} ${row.commonMistake || ""}`;
  const explicitMarkers = markers(allText, english);
  const expected = "ABCD"[row.answer];
  const namesAnswer = english
    ? new RegExp(`(^|[^A-Za-z])${answerText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^A-Za-z])`, "i").test(support)
    : support.includes(answerText) || explicitMarkers.includes(expected);
  if (!namesAnswer || explicitMarkers.some(letter => letter !== expected)) return false;
  let remainder = english ? allText.replace(new RegExp(answerText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), " ") : allText.split(answerText).join(" ");
  const patterns = english
    ? [/(?:correct answer|answer)\s*(?:is|:|=|should be)\s*[A-D]\b/gi]
    : [
        /(?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?[A-D](?=[、，：:.。、「」）；;\s]|$)/g,
        /選\s*[「（(]?[A-D](?=[、，：:.。、「」）；;\s]|$)/g,
      ];
  for (const pattern of patterns) remainder = remainder.replace(pattern, " ");
  remainder = remainder.replace(/([A-D])([「“"])([^」”"]+)([」”"])/g, (match, letter, open, quote, close) => {
    const matches = row.options.filter(option => normalizeOption(option) === normalizeOption(quote));
    return matches.length === 1 ? " " : match;
  });
  return !/(?<![A-Za-z])[A-D](?![A-Za-z])/.test(remainder);
}

function remapText(text, row, english) {
  let result = text.replace(/([A-D])([「“"])([^」”"]+)([」”"])/g, (match, oldLetter, open, quote, close) => {
    const matches = row.options.map((option, index) => normalizeOption(option) === normalizeOption(quote) ? index : -1).filter(index => index >= 0);
    return matches.length === 1 ? `${"ABCD"[matches[0]]}${open}${quote}${close}` : match;
  });
  const expected = "ABCD"[row.answer];
  const patterns = english
    ? [/((?:correct answer|answer)\s*(?:is|:|=|should be)\s*)([A-D])\b/gi]
    : [
        /((?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?)([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
        /((?:故|因此|所以)?\s*選\s*[「（(]?)([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
      ];
  for (const pattern of patterns) result = result.replace(pattern, (match, prefix) => `${prefix}${expected}`);
  return result;
}

function computePlan(rows, english, freezeBefore = 0) {
  if (rows.length !== 1000) throw new Error(`Expected 1000 questions, received ${rows.length}`);
  const movable = rows.map((row, index) => index >= freezeBefore && safeToMove(row, english));
  const lockedSuffix = Array.from({ length: rows.length + 1 }, () => [0, 0, 0, 0]);
  let safeSuffix = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    lockedSuffix[index] = [...lockedSuffix[index + 1]];
    if (movable[index]) safeSuffix += 1;
    else if (Number.isInteger(rows[index].answer)) lockedSuffix[index][rows[index].answer] += 1;
  }
  const assigned = [0, 0, 0, 0];
  const plan = [];
  let previous = -1;
  let run = 0;
  for (let index = 0; index < rows.length; index += 1) {
    const choices = movable[index] ? [0, 1, 2, 3] : [rows[index].answer];
    let selected = -1;
    for (const choice of choices.sort((left, right) => {
      const needLeft = 250 - assigned[left] - lockedSuffix[index + 1][left];
      const needRight = 250 - assigned[right] - lockedSuffix[index + 1][right];
      return needRight - needLeft;
    })) {
      if (assigned[choice] >= 250 || (choice === previous && run >= targetRun)) continue;
      if (movable[index]) {
        let fixedRun = 0;
        for (let next = index + 1; next < rows.length && !movable[next] && rows[next].answer === choice; next += 1) fixedRun += 1;
        const currentRun = choice === previous ? run + 1 : 1;
        if (fixedRun && currentRun + fixedRun > targetRun) continue;
      }
      const after = [...assigned];
      after[choice] += 1;
      const futureNeed = after.map((count, letter) => 250 - count - lockedSuffix[index + 1][letter]);
      if (futureNeed.some(need => need < 0) || futureNeed.reduce((sum, need) => sum + need, 0) !== safeSuffix - Number(movable[index])) continue;
      selected = choice;
      break;
    }
    if (selected < 0) throw new Error(`No balanced assignment satisfies the run limit at ${rows[index].id}; run=${run}, previous=${"ABCD"[previous] || "-"}, assigned=${assigned.join("/")}, fixed=${lockedSuffix[index][rows[index].answer] || 0}`);
    plan.push(selected);
    assigned[selected] += 1;
    run = selected === previous ? run + 1 : 1;
    previous = selected;
    if (movable[index]) safeSuffix -= 1;
  }
  if (assigned.some(count => count !== 250)) throw new Error(`Planner produced counts ${assigned.join("/")}`);
  let maxRun = 0;
  let currentRun = 0;
  let last = -1;
  for (const answer of plan) {
    currentRun = answer === last ? currentRun + 1 : 1;
    last = answer;
    maxRun = Math.max(maxRun, currentRun);
  }
  return { plan, movable, counts: assigned, maxRun };
}

const results = [];
for (const file of files) {
  const path = join(root, "data", `${file}.json`);
  const rows = JSON.parse(await readFile(path, "utf8"));
  const originalRows = rows.map(row => structuredClone(row));
  const english = file === "english";
  const { plan, movable, counts, maxRun } = computePlan(rows, english, patchMode ? patchStart : 0);
  let moved = 0;
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const target = plan[index];
    if (row.answer === target) continue;
    if (!movable[index]) throw new Error(`Planner attempted unsafe move: ${row.id}`);
    const previousAnswer = row.answer;
    [row.options[previousAnswer], row.options[target]] = [row.options[target], row.options[previousAnswer]];
    row.answer = target;
    for (const field of ["explanation", "teacherTip", "commonMistake"]) {
      if (typeof row[field] === "string") row[field] = remapText(row[field], row, english);
    }
    if (Array.isArray(row.solutionSteps)) row.solutionSteps = row.solutionSteps.map(step => remapText(step, row, english));
    moved += 1;
  }
  results.push({ file, path, rows, originalRows, counts, maxRun, moved });
}
if (patchMode) {
  if (!Number.isInteger(patchStart) || !Number.isInteger(patchEnd) || patchStart < 0 || patchEnd <= patchStart) throw new Error("Invalid --patch-range start end");
  for (const result of results) {
    const changes = [];
    for (let index = patchStart; index < Math.min(patchEnd, result.rows.length); index += 1) {
      if (JSON.stringify(result.rows[index]) === JSON.stringify(result.originalRows[index])) continue;
      const format = row => JSON.stringify(row, null, 2).split("\n").map(line => `  ${line}`).join("\n").replace(/\n  \}$/, "\n  },");
      changes.push(`@@\n${format(result.originalRows[index]).split("\n").map(line => `-${line}`).join("\n")}\n${format(result.rows[index]).split("\n").map(line => `+${line}`).join("\n")}`);
    }
    if (!changes.length) continue;
    console.log(`*** Begin Patch\n*** Update File: ${result.path}\n${changes.join("\n")}\n*** End Patch`);
  }
  process.exit(0);
}
for (const result of results) {
  console.log(`${result.file}: proposed answer balance ${result.counts.join("/")}, maximum run ${result.maxRun}, ${result.moved} safe option swaps`);
  if (write) await writeFile(result.path, `${JSON.stringify(result.rows, null, 2)}\n`);
}
console.log(write ? "Changes written." : "Dry run only; pass --write to apply.");
