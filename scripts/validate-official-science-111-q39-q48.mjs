import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expected = [1, 3, 3, 1, 2, 3, 3, 3, 0, 3];
const figures = new Map([
  ["OFF-0436", ["111-science-q40-strata.png"]],
  ["OFF-0438", ["111-science-q42-fermentation-options.png"]],
  ["OFF-0441", ["111-science-q45-vascular-crosssection.png"]],
  ["OFF-0442", ["111-science-q45-vascular-crosssection.png", "111-science-q46-student-table.png"]],
  ["OFF-0443", ["111-science-q47-reference-circuit.png", "111-science-q47-wiring-options.png"]],
  ["OFF-0444", ["111-science-q48-parallel-current.svg"]]
]);
const failures = [];
for (let index = 0; index < 10; index++) {
  const questionNumber = index + 39;
  const id = `OFF-${String(questionNumber + 396).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.subject !== "自然" || item.source?.year !== 111 || item.source?.questionNumber !== questionNumber) {
    failures.push(`${id}: missing or incorrect source identity`);
    continue;
  }
  if (item.answer !== expected[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: official answer index or four choices mismatch`);
  if (item.solutionSteps?.length < 3 || !item.explanation || !item.teacherTip) failures.push(`${id}: incomplete explanation or teacher tip`);
  const required = figures.get(id) ?? [];
  if (Boolean(item.requiresImage) !== Boolean(required.length) || JSON.stringify(item.questionImages?.map(path => path.split("/").at(-1))) !== JSON.stringify(required)) failures.push(`${id}: required figure metadata mismatch`);
  for (const file of required) {
    try { await access(join(root, "assets", "official-exams", file)); }
    catch { failures.push(`${id}: missing figure file ${file}`); }
  }
}
const item43 = rows.find(row => row.id === "OFF-0439");
if (!item43?.question.includes("甲烷") || !item43.explanation.includes("可燃") || !item43.solutionSteps?.some(step => step.includes("助燃性"))) failures.push("OFF-0439: methane combustibility and oxygen-supporting distinction missing");
const sw = await readFile(join(root, "sw.js"), "utf8");
for (const file of figures.get("OFF-0444")) if (!sw.includes(file)) failures.push(`Service worker does not cache ${file}`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 111 Q39–48 source keys, solutions, required figures, and offline caching passed.");
