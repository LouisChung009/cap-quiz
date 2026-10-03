import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const patterns = {
  english: [/(?:correct answer|answer)\s*(?:is|:|=|should be)\s*([A-D])\b/gi],
  other: [
    /(?:正確答案|正解|答案)\s*(?:是|為|應為|：|:)?\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
    /(?:故|因此|所以)\s*選\s*[「（(]?([A-D])(?=[、，：:.。、「」）；;\s]|$)/g,
  ],
};

for (const file of files) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  let count = 0;
  for (const row of rows) {
    const source = `${row.explanation || ""} ${(row.solutionSteps || []).join(" ")}`;
    const markers = patterns[file === "english" ? "english" : "other"]
      .flatMap(pattern => [...source.matchAll(pattern)].map(match => ({ letter: match[1].toUpperCase(), phrase: match[0] })));
    const expected = "ABCD"[row.answer];
    const conflicts = markers.filter(marker => marker.letter !== expected);
    if (!conflicts.length) continue;
    console.log(`${row.id}: answer=${expected} (${row.options[row.answer]}) markers=${conflicts.map(item => item.phrase).join(" | ")}`);
    count += 1;
    if (count >= 8) break;
  }
}
