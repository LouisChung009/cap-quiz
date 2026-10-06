import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const expected = [3, 1, 2, 3, 3, 0, 0, 0, 1, 2];
const images = new Map([[631, "112-science-q21-planet-plot.png"], [632, "112-science-q22-temperature-graph.png"], [633, "112-science-q23-velocity-time-graph.png"], [634, "112-science-q24-membrane-test.svg"], [635, "112-science-q25-gas-composition-options.png"], [638, "112-science-q28-weather-map.png"], [639, "112-science-q29-time-altitude-options.png"]]);
for (let index = 0; index < 10; index++) {
  const number = index + 631;
  const question = rows.find(item => item.id === `OFF-${String(number).padStart(4, "0")}`);
  if (!question || question.source?.year !== 112 || question.source?.questionNumber !== index + 21 || question.answer !== expected[index] || question.options?.length !== 4 || question.solutionSteps?.length < 3 || !question.teacherTip) throw new Error(`OFF-${number}: source/key/solution validation failed`);
  const image = images.get(number);
  if (Boolean(question.requiresImage) !== Boolean(image) || (image && !question.questionImages?.some(path => path.endsWith(image)))) throw new Error(`OFF-${number}: image flag/binding validation failed`);
}
const motion = rows.find(item => item.id === "OFF-0633");
const redox = rows.find(item => item.id === "OFF-0636");
const combustion = rows.find(item => item.id === "OFF-0637");
const trip = rows.find(item => item.id === "OFF-0639");
if (!motion.solutionSteps[0].includes("乙由 10 到 40 s 共 30 s") || !motion.solutionSteps[1].includes("20/(40−10)≈0.67")) throw new Error("OFF-0633: corrected graph calculation missing");
if (!redox.question.includes("As₂O₃") || !redox.question.includes("Ag₂S") || !redox.explanation.includes("用語不夠精確") || !redox.teacherTip.includes("歧義")) throw new Error("OFF-0636: formula cleanup and chemistry caveat missing");
if (!combustion.question.includes("甲＋3O₂→2CO₂＋3H₂O") || !combustion.question.includes("乙＋3O₂→2CO₂＋2H₂O")) throw new Error("OFF-0637: equations missing");
if (/\(cid:\d+\)/i.test(trip.question) || !trip.question.includes("21:00 返回臺中")) throw new Error("OFF-0639: source transcription incomplete");
const path = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(path, "utf8"));
const ids = new Set(Array.from({ length: 10 }, (_, index) => `OFF-${String(index + 631).padStart(4, "0")}`));
const updated = audit.filter(item => !ids.has(item.id));
await writeFile(path, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
console.log(`Reconciled ${audit.length - updated.length} stale generic findings after 112 Science Q21–30 source review.`);
