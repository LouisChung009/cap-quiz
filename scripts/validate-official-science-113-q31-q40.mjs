import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const keys = [3, 3, 3, 1, 2, 1, 1, 3, 2, 1];
const figures = new Map([
  ["OFF-0855", "113-science-q31-classroom-map.png"],
  ["OFF-0859", "113-science-q35-intensity-map.png"],
  ["OFF-0860", "113-science-q36-lens-ray-options.png"],
  ["OFF-0864", "113-science-q40-copper-plating-options.png"]
]);
const failures = [];

for (let index = 0; index < 10; index++) {
  const number = index + 31;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.source?.year !== 113 || item.source?.questionNumber !== number) failures.push(`${id}: source identity mismatch`);
  if (item?.answer !== keys[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: official key or four options mismatch`);
  if (!item?.explanation || item.solutionSteps?.length < 3 || !item.teacherTip || item.answerKeyReview?.status !== "verified") failures.push(`${id}: explanation, worked steps, teacher tip, or key provenance missing`);
  if (figures.has(id)) {
    const filename = figures.get(id);
    if (!item?.requiresImage || !item.questionImages?.some(image => image.endsWith(filename))) failures.push(`${id}: required original figure is not attached`);
    try { await access(join(root, "assets/official-exams", filename)); }
    catch { failures.push(`${id}: figure asset missing`); }
  }
}

const pool = rows.find(row => row.id === "OFF-0856");
if (!["840 萬公升", "2.1×10⁻⁷ g/L", "75 公升"].every(value => pool?.question.includes(value)) || !pool?.explanation.includes("1.764 g")) failures.push("OFF-0856: pool volume, acesulfame concentration, or mass calculation missing");
const cubes = rows.find(row => row.id === "OFF-0858");
if (!["40 cm³", "30 cm³", "20 cm³", "10 cm³", "0.5 g/cm³", "1.0 g/cm³", "2.0 g/cm³", "3.0 g/cm³"].every(value => cubes?.question.includes(value))) failures.push("OFF-0858: cube volume/density table incomplete");
const metals = rows.find(row => row.id === "OFF-0861");
if (!["24.3 g", "65.4 g", "2.0 g"].every(value => metals?.question.includes(value))) failures.push("OFF-0861: source metal and hydrogen masses missing");
const plating = rows.find(row => row.id === "OFF-0864");
if (!["負極", "正極", "硫酸銅水溶液"].every(value => plating?.question.includes(value))) failures.push("OFF-0864: cathode, anode, and electrolyte constraints missing");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 113 Q31–40 source identities, keys, solutions, numerical tables, and required offline figures passed.");
await import("./validate-official-science-113-q41-q50.mjs");
