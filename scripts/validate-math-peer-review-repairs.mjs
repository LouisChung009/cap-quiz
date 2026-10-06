import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "math.json"), "utf8"));
const failures = [];

const probability = rows.find(item => item.id === "MAT-0267");
if (probability?.answer !== 2 || probability.options?.[probability.answer] !== "1/4" || probability.options?.length !== 4) {
  failures.push("MAT-0267: correct probability or option structure changed unexpectedly");
}
const fractionValues = (probability?.options || []).map(value => {
  const [numerator, denominator] = value.split("/").map(Number);
  return denominator ? numerator / denominator : Number(value);
});
if (new Set(fractionValues).size !== 4) failures.push("MAT-0267: options contain equivalent probabilities");
if (!probability?.solutionSteps?.some(step => step.includes("4、8、12、16、20"))) failures.push("MAT-0267: worked count of favorable outcomes missing");

const vertex = rows.find(item => item.id === "MAT-0718");
if (vertex?.answer !== 0 || !vertex.question.includes("(x−2)²−3") || !vertex.knowledgePoint.includes("已配方")) {
  failures.push("MAT-0718: should assess vertex reading from the already-factored vertex form");
}
if (vertex?.solutionSteps?.some(step => /x²−4x|配方得|進行配方/.test(step))) failures.push("MAT-0718: exceeds the F-9-2 already-factored-form scope");
if (!vertex?.solutionSteps?.some(step => step.includes("h＝2") && step.includes("k＝−3"))) failures.push("MAT-0718: vertex parameters are not explicitly identified");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("MAT-0267 unique probability options and MAT-0718 in-scope vertex form passed.");
