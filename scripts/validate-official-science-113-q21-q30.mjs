import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const keys = [0, 2, 0, 2, 3, 0, 0, 1, 3, 0];
const failures = [];

for (let index = 0; index < 10; index++) {
  const number = index + 21;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.source?.year !== 113 || item.source?.questionNumber !== number) failures.push(`${id}: source identity mismatch`);
  if (item?.answer !== keys[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: official key or four options mismatch`);
  if (!item?.explanation || item.solutionSteps?.length < 3 || !item.teacherTip || item.answerKeyReview?.status !== "verified") failures.push(`${id}: worked solution, teacher tip, or key provenance missing`);
}

const germination = rows.find(row => row.id === "OFF-0845");
if (!["500", "100", "400", "80", "350", "22.9%"].every(value => germination?.question.includes(value) || germination?.solutionSteps?.join(" ").includes(value))) failures.push("OFF-0845: source counts or recomputed germination rates missing");
const heating = rows.find(row => row.id === "OFF-0851");
if (!heating?.question.includes("100 g") || !heating.question.includes("−20°C") || !heating.question.includes("t₁ 至 t₂")) failures.push("OFF-0851: heating-curve setup missing");
const weather = rows.find(row => row.id === "OFF-0852");
if (!weather?.question.includes("太平洋高氣壓範圍") || !weather.options?.[1]?.includes("太平洋高氣壓範圍") || weather.question.includes("太平洋暖氣團")) failures.push("OFF-0852: Pacific High source wording is inaccurate or incomplete");
const chlorine = rows.find(row => row.id === "OFF-0853");
if (!["0.39", "0.33", "0.28", "0.22", "0.18", "0.15", "0.13", "0.09", "0.30", "0.20", "0.03", "0.00"].every(value => chlorine?.question.includes(value))) failures.push("OFF-0853: source residual-chlorine data incomplete");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 113 Q21–30 source identities, keys, worked solutions, germination data, heating setup, weather-system wording, and chlorine tables passed.");
await import("./validate-official-science-113-q31-q40.mjs");
