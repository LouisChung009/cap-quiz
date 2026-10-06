import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const expected = [0, 3, 0, 3, 2, 1, 1, 1, 0, 2];
const figureFiles = new Map([
  ["OFF-0651", "112-science-q41-separation-flow.png"],
  ["OFF-0652", "112-science-q42-parallel-circuits.png"],
  ["OFF-0654", "112-science-q44-carbon-chart.png"],
  ["OFF-0656", "112-science-q46-wind-power-curve.png"],
  ["OFF-0659", "112-science-q49-liquefaction-model.svg"],
  ["OFF-0660", "112-science-q50-liquefaction-profiles.png"]
]);
const failures = [];
for (let index = 0; index < 10; index++) {
  const number = index + 41;
  const id = `OFF-${String(number + 610).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.source?.year !== 112 || item.source?.questionNumber !== number) failures.push(`${id}: source identity mismatch`);
  if (item?.answer !== expected[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: key or choices mismatch`);
  if (!item?.explanation || item.solutionSteps?.length < 3 || !item.teacherTip || !item.answerKeyReview?.status) failures.push(`${id}: incomplete solution or answer-key provenance`);
  if (figureFiles.has(id) && !item?.questionImages?.some(image => image.endsWith(figureFiles.get(id)))) failures.push(`${id}: source figure not bound`);
}
const nutrition = rows.find(row => row.id === "OFF-0653");
if (!nutrition?.question.includes("每 200 mL") || nutrition.question.includes("每 100 mL")) failures.push("OFF-0653: nutrition table serving size must match original 200 mL");
const prep = rows.find(row => row.id === "OFF-0658");
if (!prep?.question.includes("先浸泡於農藥溶液") || !prep.explanation.includes("起始農藥種類與濃度相同")) failures.push("OFF-0658: shared stimulus must state pesticide pretreatment");
for (const value of ["44.74%", "34.21%", "42.11%", "18.42%", "2.52%"])
  if (!prep?.question.includes(value)) failures.push(`OFF-0658: independent item is missing experiment value ${value}`);
const washing = rows.find(row => row.id === "OFF-0657");
if (!washing?.question.includes("清水加蔬果洗潔劑浸泡 18.42%") || !washing.question.includes("清水直接沖洗 2.52%")) failures.push("OFF-0657: washing experiment evidence missing from stem");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 112 Q41–50 identities, keys, source figures, nutrition serving size, washing evidence, and pesticide pretreatment passed.");
