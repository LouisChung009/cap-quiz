import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const markerPatterns = {
  english: [
    /(?:correct answer|answer)\s*(?:is|:|=|should be)\s*([A-D])\b/gi,
    /(?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
    /(?:答案是|答案為|選)\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
    /\bchoose\s+([A-D])(?=[,.:;\s]|$)/gi,
  ],
  other: [
    /(?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
    /(?:故|因此|所以)\s*選\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
    /選\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
  ],
};
const standaloneOptionLetter = /(?<![A-Za-z])[A-D](?![A-Za-z])/;
function escapeRegExp(value) {
  return value.replace(/[.*+?^()|[\]\\]/g, "\\$&");
}
function normalizeOption(value) {
  return String(value).toLocaleLowerCase().replace(/[\s\p{P}\p{S}]/gu, "");
}
function safeForMove(row, file) {
  const correctOption = String(row.options?.[row.answer] || "");
  if (!correctOption) return false;
  const explanation = String(row.explanation || "");
  const steps = (row.solutionSteps || []).join(" ");
  const support = `${explanation} ${steps}`;
  const namesAnswer = file === "english"
    ? new RegExp(`(^|[^A-Za-z])${escapeRegExp(correctOption)}(?=$|[^A-Za-z])`, "i").test(support)
    : support.includes(correctOption);
  if (!namesAnswer) return false;
  const allText = `${row.question || ""} ${support} ${row.teacherTip || ""} ${row.commonMistake || ""}`;
  const patterns = file === "english" ? markerPatterns.english : markerPatterns.other;
  const markers = patterns.flatMap(pattern => [...allText.matchAll(pattern)].map(match => match[1].toUpperCase()));
  const expected = "ABCD"[row.answer];
  if (markers.some(letter => letter !== expected)) return false;
  let remainder = file === "english"
    ? allText.replace(new RegExp(escapeRegExp(correctOption), "gi"), " ")
    : allText.split(correctOption).join(" ");
  const removable = patterns;
  for (const marker of removable) remainder = remainder.replace(marker, " ");
  remainder = remainder.replace(/([A-D])([「“"])([^」”"]+)([」”"])/g, (match, letter, open, quote, close) => {
    const referencedOptions = row.options.filter(option => normalizeOption(option) === normalizeOption(quote));
    return referencedOptions.length === 1 ? " " : match;
  });
  return !standaloneOptionLetter.test(remainder);
}

for (const file of files) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  const safeCounts = [0, 0, 0, 0];
  for (const row of rows) {
    if (safeForMove(row, file)) safeCounts[row.answer] += 1;
  }
  console.log(`${file}: safe candidates A/B/C/D = ${safeCounts.join("/")}`);
  if (file === "social" && process.argv.includes("--show-social-b")) {
    let shown = 0;
    for (const row of rows) {
      if (row.answer !== 1 || safeForMove(row, file)) continue;
      const correctOption = String(row.options?.[row.answer] || "");
      const support = `${row.explanation || ""} ${(row.solutionSteps || []).join(" ")}`;
      if (!support.includes(correctOption)) continue;
      const allText = `${row.question || ""} ${support} ${row.teacherTip || ""} ${row.commonMistake || ""}`;
      let remainder = allText.split(correctOption).join(" ");
      for (const marker of markerPatterns.other) remainder = remainder.replace(marker, " ");
      remainder = remainder.replace(/([A-D])([「“"])([^」”"]+)([」”"])/g, (match, letter, open, quote, close) => {
        const referencedOptions = row.options.filter(option => normalizeOption(option) === normalizeOption(quote));
        return referencedOptions.length === 1 ? " " : match;
      });
      const firstLabel = remainder.match(standaloneOptionLetter)?.[0] || "";
      console.log(`${row.id}: remaining standalone choice label ${firstLabel}; ${row.explanation.slice(0, 120)}`);
      shown += 1;
      if (shown >= 20) break;
    }
  }
}
