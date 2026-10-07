import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const keys = [2, 2, 3, 2, 1, 2, 0, 2, 2, 1];
const figures = new Map([
  [15, "114-science-q15-plate-map.png"],
  [16, "114-science-q16-strata.png"],
  [18, "114-science-q18-friction-graph.png"],
  [20, "114-science-q20-glucose-chart.png"]
]);
const failures = [];

for (let index = 0; index < 10; index += 1) {
  const number = index + 11;
  const id = `OFF-${String(number + 1038).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  if (!item || item.subject !== "自然" || item.sourceType !== "官方歷屆真題" || item.source?.year !== 114 || item.source?.questionNumber !== number) failures.push(`${id}: source identity mismatch`);
  if (item?.answer !== keys[index] || item.options?.length !== 4) failures.push(`${id}: answer key or options mismatch`);
  if (!item?.answerKeyReview?.status || !item.explanation || item.solutionSteps?.length < 3 || !item.teacherTip) failures.push(`${id}: answer provenance or worked teaching content missing`);
  const filename = figures.get(number);
  if (filename) {
    if (!item?.requiresImage || !item.questionImages?.some(image => image.endsWith(filename))) failures.push(`${id}: required focused figure missing`);
    try { await access(join(root, "assets", "official-exams", filename)); }
    catch { failures.push(`${id}: figure file missing`); }
    if (!serviceWorker.includes(`./assets/official-exams/${filename}`)) failures.push(`${id}: figure missing from offline precache`);
  } else if (item?.requiresImage || item?.questionImages?.length || item?.questionImage) failures.push(`${id}: unnecessary image dependency`);
}

const q11 = questions.find(question => question.id === "OFF-1049");
if (!q11?.solutionSteps?.some(step => step.includes("1,000,000 mg")) || !q11.solutionSteps.some(step => step.includes("30 ppm"))) failures.push("Q11: ppm conversion steps incomplete");
const q14 = questions.find(question => question.id === "OFF-1052");
if (q14?.answer !== 2 || !`${q14.explanation} ${q14.solutionSteps.join(" ")}`.includes("歧義")) failures.push("Q14: preserve the official key and disclose the wording ambiguity");
const q15 = questions.find(question => question.id === "OFF-1053");
if (!q15?.questionImages?.some(image => image.endsWith("114-science-q15-plate-map.png"))) failures.push("Q15: plate map material missing");
const q16 = questions.find(question => question.id === "OFF-1054");
if (!q16?.questionImages?.some(image => image.endsWith("114-science-q16-strata.png"))) failures.push("Q16: strata diagram missing");
const q18 = questions.find(question => question.id === "OFF-1056");
if (!q18?.solutionSteps?.some(step => step.includes("400 gw")) || !q18.solutionSteps.some(step => step.includes("300 gw"))) failures.push("Q18: friction graph reasoning incomplete");
const q20 = questions.find(question => question.id === "OFF-1058");
if (!q20?.solutionSteps?.some(step => step.includes("胰島素"))) failures.push("Q20: glucose-response reasoning incomplete");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 114 Q11–20 identities, answer keys, worked explanations, ambiguity note, and focused offline figures passed.");
