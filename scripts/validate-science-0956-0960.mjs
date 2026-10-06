import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expectedAnswers = [3, 0, 1, 2, 3];
const requiredEvidence = new Map([
  ["SCI-0956", ["水珠", "石灰水", "二氧化碳"]],
  ["SCI-0957", ["H₂O", "密封", "物理變化"]],
  ["SCI-0958", ["比例", "物理方法", "混合物"]],
  ["SCI-0959", ["6.0÷8.0", "0.75"]],
  ["SCI-0960", ["36 g", "4 g", "飽和"]],
]);
const failures = [];

for (let offset = 0; offset < expectedAnswers.length; offset++) {
  const id = `SCI-${String(956 + offset).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.answer !== expectedAnswers[offset]) failures.push(`${id}: answer key mismatch`);
  if (!row || row.options?.length !== 4 || new Set(row.options).size !== 4) failures.push(`${id}: expected four distinct options`);
  if (!row || row.solutionSteps?.length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length || !row.teacherTip) failures.push(`${id}: incomplete or repeated worked steps/teacher tip`);
  const content = `${row?.question || ""} ${row?.explanation || ""} ${(row?.solutionSteps || []).join(" ")}`;
  for (const evidence of requiredEvidence.get(id) || []) if (!content.includes(evidence)) failures.push(`${id}: missing content anchor ${evidence}`);
}

const chromatography = rows.find(item => item.id === "SCI-0959");
if (!chromatography?.question.includes("Rf＝色帶移動距離÷溶劑前緣距離") || !chromatography.explanation.includes("不帶長度單位")) failures.push("SCI-0959: formula or dimensionless-ratio explanation missing");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("SCI-0956–0960 keys, evidence, worked steps, and calculation anchors passed.");
