import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const corrections = new Map([
  ["CHI-0926", 1],
  ["SCI-0627", 3],
  ["SOC-0002", 2],
  ["SOC-0029", 3]
]);
const files = ["chinese", "science", "social"];
const answerLabel = (row, letter) => new RegExp(`(?:答案|正解|正確答案|故選|所以選)\\s*(?:是|為)?\\s*[「（(]?${letter}(?=[、，：:.。）」]|$)`);

for (const file of files) {
  const path = join(root, "data", `${file}.json`);
  const rows = JSON.parse(await readFile(path, "utf8"));
  let repaired = 0;
  for (const row of rows) {
    if (!Array.isArray(row.options) || !Number.isInteger(row.answer)) continue;
    if (corrections.has(row.id)) row.answer = corrections.get(row.id);
    const answerText = row.options[row.answer];
    if (!answerText) throw new Error(`Invalid answer index: ${row.id}`);
    const letter = String.fromCharCode(65 + row.answer);
    const explanation = String(row.explanation || "");
    const solution = `${explanation} ${(row.solutionSteps || []).join(" ")}`;
    const conflicts = ["A", "B", "C", "D"].filter(candidate => candidate !== letter && answerLabel(row, candidate).test(solution));
    if (conflicts.length) throw new Error(`${row.id} explicitly identifies conflicting answer(s): ${conflicts.join(", ")}`);
    const alreadyNamed = solution.toLowerCase().includes(String(answerText).toLowerCase()) || answerLabel(row, letter).test(solution);
    if (alreadyNamed) continue;
    row.explanation = `${explanation.trim()} 因此答案為 ${letter}「${answerText}」。`.trim();
    repaired++;
  }
  await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`${file}: ${repaired} 則解析補上標答引用`);
}
