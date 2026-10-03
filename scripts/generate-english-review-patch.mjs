import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "english.json"), "utf8"));
const lines = (await readFile(join(root, "data", "english.json"), "utf8")).split(/\r?\n/);
const ids = [326, 327, 328, 329, 332, 335, 340, 346, 347, 348, 349, 350, 351, 352, 353, 354, 357, 358, 360, 364, 369, 372, 373, 377, 381, 382, 383, 384, 385, 386, 387, 389, 390, 392, 394, 398, 400].map(number => `ENG-${String(number).padStart(4, "0")}`);
const hunks = [];

for (const id of ids) {
  const row = rows.find(item => item.id === id);
  const expectedText = row.options[row.answer];
  const oldStep = row.solutionSteps.at(-1);
  const selection = oldStep.match(/\bchoose\s+([A-D])\b/i);
  if (!selection || !oldStep.toLowerCase().includes(expectedText.toLowerCase()) || !row.explanation.toLowerCase().includes(expectedText.toLowerCase())) {
    throw new Error(`Cannot safely fix ${id}: answer text is not independently supported`);
  }
  const newStep = oldStep.replace(/\b(choose\s+)[A-D]\b/i, `$1${"ABCD"[row.answer]}`);
  const idIndex = lines.findIndex(line => line.includes(`"id": "${id}"`));
  const stepsIndex = lines.findIndex((line, index) => index > idIndex && line.includes('"solutionSteps": ['));
  const oldLine = JSON.stringify(oldStep);
  const stepIndex = lines.findIndex((line, index) => index >= stepsIndex && line.includes(oldLine));
  if (stepIndex < 0) throw new Error(`Cannot locate solution step for ${id}`);
  const context = lines.slice(idIndex, stepIndex).map(line => ` ${line}`);
  hunks.push(`@@\n${context.join("\n")}\n-${lines[stepIndex]}\n+${lines[stepIndex].replace(oldLine, JSON.stringify(newStep))}`);
}

process.stdout.write(JSON.stringify(hunks));
