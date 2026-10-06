import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expected = [3, 1, 2, 3, 3, 0, 0, 0, 1, 2];
const images = new Map([
  ["OFF-0631", "112-science-q21-planet-plot.png"],
  ["OFF-0632", "112-science-q22-temperature-graph.png"],
  ["OFF-0633", "112-science-q23-velocity-time-graph.png"],
  ["OFF-0634", "112-science-q24-membrane-test.svg"],
  ["OFF-0635", "112-science-q25-gas-composition-options.png"],
  ["OFF-0638", "112-science-q28-weather-map.png"],
  ["OFF-0639", "112-science-q29-time-altitude-options.png"]
]);
const failures = [];
for (let index = 0; index < 10; index++) {
  const sourceNumber = index + 21;
  const id = `OFF-${String(sourceNumber + 610).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.subject !== "自然" || item.source?.year !== 112 || item.source?.questionNumber !== sourceNumber) {
    failures.push(`${id}: missing or incorrect source identity`);
    continue;
  }
  if (item.answer !== expected[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: answer index or choices mismatch`);
  if (item.solutionSteps?.length < 3 || !item.explanation || !item.teacherTip) failures.push(`${id}: incomplete worked explanation`);
  const file = images.get(id);
  if (Boolean(item.requiresImage) !== Boolean(file)) failures.push(`${id}: required image flag mismatch`);
  if (file && item.questionImages?.[0]?.split("/").at(-1) !== file) failures.push(`${id}: image binding mismatch`);
  if (file) {
    try { await access(join(root, "assets", "official-exams", file)); }
    catch { failures.push(`${id}: missing image asset ${file}`); }
  }
}
const motion = rows.find(row => row.id === "OFF-0633");
if (!motion?.solutionSteps?.[0]?.includes("乙由 10 到 40 s 共 30 s") || !motion.solutionSteps?.[1]?.includes("40−10") || !motion.solutionSteps?.[1]?.includes("≈0.67 m/s²") || !motion.explanation.includes("乙為 20/30≈0.67")) failures.push("OFF-0633: corrected 10–40 s force interval and acceleration regression");
const redox = rows.find(row => row.id === "OFF-0636");
if (!redox?.question.includes("As₂O₃") || !redox.question.includes("Ag₂S") || !redox.explanation.includes("S²⁻") || !redox.explanation.includes("用語不夠精確") || !redox.teacherTip.includes("歧義")) failures.push("OFF-0636: formula OCR or sulfide oxidation-state caveat missing");
const combustion = rows.find(row => row.id === "OFF-0637");
if (!combustion?.question.includes("甲＋3O₂→2CO₂＋3H₂O") || !combustion.question.includes("乙＋3O₂→2CO₂＋2H₂O")) failures.push("OFF-0637: original reaction formulas missing");
const itinerary = rows.find(row => row.id === "OFF-0639");
if (/\(cid:\d+\)/i.test(itinerary?.question ?? "") || !itinerary.question.includes("行程資料：10:00") || !itinerary.question.includes("21:00 返回臺中")) failures.push("OFF-0639: OCR contamination or incomplete altitude itinerary");
const density = rows.find(row => row.id === "OFF-0640");
if (!density?.question.includes("甲牌 260 c.c.、240 g") || !density.question.includes("乙牌 275 mL、275 g") || density.requiresImage) failures.push("OFF-0640: product-label data must be self-contained text");
const saliva = rows.find(row => row.id === "OFF-0642");
if (!saliva?.explanation.includes("圖（十八）") || !saliva.explanation.includes("約 0.5 mL") || !saliva.explanation.includes("約 5.5 mL") || !saliva.solutionSteps?.[2]?.includes("約 4.5")) failures.push("OFF-0642: explanation must connect saliva-volume evidence to the pH graph");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 112 Q21–30 answer indices, source materials, worked solutions, and corrected content regressions passed.");
