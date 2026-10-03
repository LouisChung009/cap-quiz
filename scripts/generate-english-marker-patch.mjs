import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const path = join(root, "data", "english.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const lines = (await readFile(path, "utf8")).split(/\r?\n/);
const edits = new Map();

function replaceField(row, field, value) {
  const idIndex = lines.findIndex(line => line.includes(`"id": "${row.id}"`));
  const old = JSON.stringify(row[field]);
  const index = lines.findIndex((line, lineIndex) => lineIndex > idIndex && line.includes(`"${field}":`) && line.includes(old));
  if (index < 0) throw new Error(`Cannot locate ${row.id} ${field}`);
  edits.set(row.id, [...(edits.get(row.id) || []), { index, newLine: lines[index].replace(old, JSON.stringify(value)) }]);
}

function replaceStep(row, stepIndex, value) {
  const idIndex = lines.findIndex(line => line.includes(`"id": "${row.id}"`));
  const start = lines.findIndex((line, lineIndex) => lineIndex > idIndex && line.includes('"solutionSteps": ['));
  const old = JSON.stringify(row.solutionSteps[stepIndex]);
  const index = lines.findIndex((line, lineIndex) => lineIndex >= start && line.includes(old));
  if (index < 0) throw new Error(`Cannot locate ${row.id} step ${stepIndex}`);
  edits.set(row.id, [...(edits.get(row.id) || []), { index, newLine: lines[index].replace(old, JSON.stringify(value)) }]);
}

const punctuation = rows.find(row => row.id === "ENG-0095");
replaceField(punctuation, "explanation", "The introductory phrase “After dinner” is followed by a comma; no comma separates the verb from its object. 正確答案是 C「After dinner, we washed the dishes.」。A separates the subject from its verb; B places a comma inside the introductory phrase; D separates the verb from its object.");
replaceStep(punctuation, 1, "答案為 C「After dinner, we washed the dishes.」：The introductory phrase “After dinner” is followed by a comma; no comma separates the verb from its object.");
replaceStep(punctuation, 2, "易錯選項提醒：A separates the subject from its verb; B places a comma inside the introductory phrase; D separates the verb from its object.");

for (const id of ["ENG-0402", "ENG-0404", "ENG-0405", "ENG-0410", "ENG-0411", "ENG-0415", "ENG-0417", "ENG-0420"]) {
  const row = rows.find(item => item.id === id);
  const expected = "ABCD"[row.answer];
  const stepIndex = row.solutionSteps.length - 1;
  const old = row.solutionSteps[stepIndex];
  if (!/答案是\s*[A-D]/.test(old)) throw new Error(`Unexpected answer marker in ${id}`);
  replaceStep(row, stepIndex, old.replace(/(答案是\s*)[A-D]/, `$1${expected}`));
}

const hunks = [];
for (const [id, replacements] of edits) {
  const idIndex = lines.findIndex(line => line.includes(`"id": "${id}"`));
  const end = Math.max(...replacements.map(replacement => replacement.index));
  const byIndex = new Map(replacements.map(replacement => [replacement.index, replacement.newLine]));
  const content = [];
  for (let index = idIndex; index <= end; index += 1) {
    if (byIndex.has(index)) content.push(`-${lines[index]}`, `+${byIndex.get(index)}`);
    else content.push(` ${lines[index]}`);
  }
  hunks.push(`@@\n${content.join("\n")}`);
}
process.stdout.write(JSON.stringify(hunks));
