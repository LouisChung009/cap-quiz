import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const keys = [1, 3, 3, 1, 3, 1, 1, 2, 1, 2];
if (keys[4] !== 3) throw new Error("OFF-0839: official answer for 113 Natural Science Q15 must be D");
const figures = new Map([["OFF-0839", "113-science-q15-isobar-map.svg"]]);
const failures = [];

for (let index = 0; index < 10; index++) {
  const number = index + 11;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.source?.year !== 113 || item.source?.questionNumber !== number) failures.push(`${id}: source identity mismatch`);
  if (item?.answer !== keys[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: key or four-option set mismatch`);
  if (!item?.explanation || item.solutionSteps?.length < 3 || !item.teacherTip || item.answerKeyReview?.status !== "verified") failures.push(`${id}: worked explanation, teacher tip, or official-key provenance missing`);
  if (figures.has(id)) {
    const filename = figures.get(id);
    if (!item?.requiresImage || !item.questionImages?.some(image => image.endsWith(filename))) failures.push(`${id}: source figure is not attached`);
    try { await access(join(root, "assets/official-exams", filename)); }
    catch { failures.push(`${id}: figure asset missing`); }
  }
}

const population = rows.find(row => row.id === "OFF-0838");
if (!population?.question.includes("甲大致穩定，乙增加，丙大致穩定，丁減少")) failures.push("OFF-0838: population-curve phases do not match the source graph");
const genetics = rows.find(row => row.id === "OFF-0836");
if (!genetics?.question.includes("4 隻長翅及 6 隻短翅") || !genetics.question.includes("400 隻長翅、600 隻短翅")) failures.push("OFF-0836: original sample observation or extrapolation missing");
const acid = rows.find(row => row.id === "OFF-0841");
if (!["pH 2.4", "6.82%", "7.87%", "pH 3.7", "4.15%", "4.92%", "pH 3.1", "5.95%", "6.76%", "丙＜甲＜乙"].every(value => acid?.question.includes(value))) failures.push("OFF-0841: table values or experiment-two ranking missing");
const psi = rows.find(row => row.id === "OFF-0840");
if (!psi?.question.includes("1 psi＝1 磅力／平方英寸") || psi.answer !== 1 || !psi.explanation.includes("單位面積所受的力")) failures.push("OFF-0840: pressure-unit interpretation or keyed answer missing");
const organic = rows.find(row => row.id === "OFF-0843");
if (!organic?.question.includes("甲含 C 75%、H 25%") || !organic.question.includes("乙含 C 27%、H 0%、O 73%") || !organic.question.includes("丙含 C 100%") || organic.answer !== 1 || !organic.solutionSteps?.some(step => step.includes("無機碳氧化物"))) failures.push("OFF-0843: source composition data or organic-compound reasoning missing");
const isobars = rows.find(row => row.id === "OFF-0839");
if (!isobars?.question.includes("1020 hPa") || !isobars.question.includes("等壓線") || !isobars.options?.[3]?.includes("風向")) failures.push("OFF-0839: isobar-map question lacks required source context");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 113 Q11–20 source identities, keys, explanations, source-specific data, graph reading, and required figure passed.");
await import("./validate-official-science-113-q21-q30.mjs");
