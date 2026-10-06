import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const keys = [3, 2, 3, 0, 1, 3, 0, 2, 2, 2];
const failures = [];

for (let index = 0; index < 10; index++) {
  const number = index + 41;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.source?.year !== 113 || item.source?.questionNumber !== number) failures.push(`${id}: source identity mismatch`);
  if (item?.answer !== keys[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: official key or four-option set mismatch`);
  if (!item?.explanation || item.solutionSteps?.length < 3 || !item.teacherTip || item.answerKeyReview?.status !== "verified") failures.push(`${id}: worked explanation, teacher tip, or answer-key provenance missing`);
}

const enzyme = rows.find(row => row.id === "OFF-0865");
if (!enzyme?.question.includes("75°C") || !enzyme.question.includes("10:30–10:50") || !enzyme.question.includes("10:50–11:00")) failures.push("OFF-0865: enzyme threshold or schedule incomplete");
const energyMix = rows.find(row => row.id === "OFF-0868");
const energyMixText = `${energyMix?.question ?? ""} ${energyMix?.options?.join(" ") ?? ""}`;
if (!["46.1%", "33.3%", "11.8%", "5.5%", "25%→13%", "25%→52%", "50%→35%"].every(value => energyMixText.includes(value))) failures.push("OFF-0868: generation mix table or correct-option values incomplete");
const pollutants = rows.find(row => row.id === "OFF-0869");
if (!["0.0447", "0.3417", "0.4155", "0.0205", "0.0017", "0.3446"].every(value => pollutants?.question.includes(value))) failures.push("OFF-0869: coal/gas pollutant table incomplete");
const electricity = rows.find(row => row.id === "OFF-0870");
if (!["47,612", "46,879", "47,189", "50,207", "52,729", "2,283", "2,038", "2,030", "2,247", "2,235"].every(value => electricity?.question.includes(value))) failures.push("OFF-0870: 2017–2021 paired table values incomplete");
const co2 = rows.find(row => row.id === "OFF-0873");
const graph = "113-science-q49-co2-cycle-graph.png";
if (!co2?.requiresImage || !co2.questionImages?.some(image => image.endsWith(graph))) failures.push("OFF-0873: CO₂ cycle graph missing from question data");
try { await access(join(root, "assets/official-exams", graph)); }
catch { failures.push("OFF-0873: CO₂ cycle graph asset missing"); }
if (!serviceWorker.includes(graph)) failures.push("OFF-0873: CO₂ cycle graph missing from offline precache");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 113 Q41–50 source identities, keys, data tables, worked solutions, Q49 graph, and offline precache passed.");
