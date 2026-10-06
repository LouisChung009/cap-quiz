import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expectedAnswers = [0, 1, 1, 2, 3, 0, 1, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 1, 3, 0];
const unitExpectations = new Map([
  ["SCI-0188", "物理"],
  ["SCI-0189", "物理"],
  ["SCI-0197", "地球科學"],
]);
const failures = [];
const precedingAnswers = [3, 0, 1, 2, 3];
for (let offset = 0; offset < precedingAnswers.length; offset++) {
  const id = `SCI-${String(176 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.answer !== precedingAnswers[offset] || row.options?.length !== 4 || new Set(row.options).size !== 4) failures.push(`${id}: answer key/options mismatch`);
  else if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing question or worked teaching content`);
}
const buoyancy = rows.find(item => item.id === "SCI-0178");
if (buoyancy?.options?.[buoyancy.answer] !== "1 N" || !buoyancy.solutionSteps?.[2]?.includes("0.1×10＝1 N")) failures.push("SCI-0178: buoyancy calculation must convert volume to displaced water weight correctly");
const conservation = rows.find(item => item.id === "SCI-0180");
if (conservation?.options?.[conservation.answer] !== "仍為 52 g，因密閉系統總質量守恆" || !conservation.question.includes("52 g")) failures.push("SCI-0180: closed-system mass conservation answer must retain the initial mass");
for (let offset = 0; offset < expectedAnswers.length; offset++) {
  const id = `SCI-${String(181 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.answer !== expectedAnswers[offset] || row.options?.length !== 4 || !row.options?.[row.answer]) {
    failures.push(`${id}: answer key/options mismatch`);
    continue;
  }
  if (!row.question || !row.explanation || row.solutionSteps?.length < 3 || !row.teacherTip) failures.push(`${id}: missing question or worked explanation`);
  if (unitExpectations.has(id) && row.unit !== unitExpectations.get(id)) failures.push(`${id}: incorrect science unit (${row.unit})`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0176–0200 answer keys, explanations, and unit metadata passed.");
