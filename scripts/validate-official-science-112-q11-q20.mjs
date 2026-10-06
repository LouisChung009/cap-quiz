import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expected = [3, 0, 0, 1, 1, 0, 1, 0, 2, 1];
const images = new Map([
  ["OFF-0621", "112-science-q11-soap-process.png"],
  ["OFF-0623", "112-science-q13-white-noise-graphs.png"],
  ["OFF-0627", "112-science-q17-organic-inorganic-table.png"],
  ["OFF-0628", "112-science-q18-race-track.png"],
  ["OFF-0629", "112-science-q19-energy-track.png"],
  ["OFF-0630", "112-science-q20-plant-data-table.png"]
]);
const failures = [];
for (let index = 0; index < 10; index++) {
  const number = index + 11;
  const id = `OFF-${String(number + 610).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.subject !== "自然" || item.source?.year !== 112 || item.source?.questionNumber !== number) {
    failures.push(`${id}: missing or incorrect source identity`);
    continue;
  }
  if (item.answer !== expected[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: official answer index or four choices mismatch`);
  if (item.solutionSteps?.length < 3 || !item.explanation || !item.teacherTip) failures.push(`${id}: incomplete worked explanation or teacher tip`);
  const image = images.get(id);
  if (Boolean(item.requiresImage) !== Boolean(image)) failures.push(`${id}: required figure flag mismatch`);
  if (image && item.questionImages?.[0]?.split("/").at(-1) !== image) failures.push(`${id}: incorrect figure binding`);
  if (image) {
    try { await access(join(root, "assets", "official-exams", image)); }
    catch { failures.push(`${id}: missing figure asset ${image}`); }
  }
}
const route = rows.find(row => row.id === "OFF-0625");
if (!route?.question.includes("夏季") || !route.question.includes("臺灣向北航行") || route.questionImages?.length || route.questionImage) failures.push("OFF-0625: answer-revealing synthetic wind/current diagram or missing text context remains");
const sw = await readFile(join(root, "sw.js"), "utf8");
if (!sw.includes("ASSETS.splice(excludedIndex, 1)")) failures.push("Answer-revealing synthetic figures are not excluded from offline caching");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 112 Q11–20 keys, source identity, required figures, worked explanations, and answer-leak guards passed.");
