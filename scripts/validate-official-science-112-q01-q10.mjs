import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expected = [3, 1, 3, 2, 0, 0, 1, 2, 2, 1];
const images = new Map([
  ["OFF-0613", "112-science-q03-sports-drink.png"],
  ["OFF-0615", "112-science-q05-tide-chart.png"],
  ["OFF-0616", "112-science-q06-heating-apparatus.png"]
]);
const failures = [];
for (let index = 0; index < 10; index++) {
  const number = index + 1;
  const id = `OFF-${String(number + 610).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.subject !== "自然" || item.source?.year !== 112 || item.source?.questionNumber !== number) {
    failures.push(`${id}: missing or incorrect source identity`);
    continue;
  }
  if (item.answer !== expected[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: answer index or four choices mismatch`);
  if (item.solutionSteps?.length < 3 || !item.explanation || !item.teacherTip) failures.push(`${id}: incomplete worked explanation or teaching tip`);
  const image = images.get(id);
  if (Boolean(item.requiresImage) !== Boolean(image)) failures.push(`${id}: required image flag mismatch`);
  if (image && item.questionImages?.[0]?.split("/").at(-1) !== image) failures.push(`${id}: incorrect image binding`);
  if (image) {
    try { await access(join(root, "assets", "official-exams", image)); }
    catch { failures.push(`${id}: missing figure asset ${image}`); }
  }
}
const item10 = rows.find(row => row.id === "OFF-0620");
const hydrogen = rows.find(row => row.id === "OFF-0617");
if (!hydrogen || hydrogen.requiresImage || hydrogen.questionImages?.length || !hydrogen.question.includes("綠氫：以再生能源電力製氫") || !hydrogen.options?.[1]?.includes("風力發電") || !hydrogen.options[1].includes("電解水") || hydrogen.answer !== 1 || !hydrogen.explanation.includes("綠氫")) failures.push("OFF-0617: self-contained hydrogen-production evidence, correct key, or explanation missing");
if (item10?.requiresImage || item10?.questionImages?.length || /圖\s*[（(]五/.test(item10?.question ?? "")) failures.push("OFF-0620: answer-revealing synthetic figure reference remains");
if (!item10?.question.includes("侵入原有岩層") || !item10.question.includes("海水侵蝕") || item10.answer !== 1) failures.push("OFF-0620: self-contained geology evidence or verified key missing");
try { await access(join(root, "assets", "official-exams", "112-science-q10-rock-intrusion.svg")); failures.push("OFF-0620: deleted answer-revealing graphic is still present"); }
catch {}
const sw = await readFile(join(root, "sw.js"), "utf8");
if (!sw.includes("ASSETS.splice(excludedIndex, 1)")) failures.push("OFF-0620: answer-revealing graphic is not explicitly excluded from offline caching");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 112 Q1–10 source keys, materials, and figure bindings passed; Q10 has no answer-revealing synthetic diagram.");
