import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data/mission-questions.json"), "utf8"));
const keys = [1, 1, 2, 2, 0, 2, 0, 2, 0, 3];
const figures = new Map([
  ["OFF-0827", "113-science-q03-weekly-temperature-chart.png"],
  ["OFF-0830", "113-science-q06-wire-repair.svg"],
  ["OFF-0832", "113-science-q08-earth-sun-diagrams.svg"],
  ["OFF-0833", "113-science-q09-cell-osmosis.png"],
  ["OFF-0834", "113-science-q10-ocean-floor-age-options.png"]
]);
const failures = [];
for (let index = 0; index < 10; index++) {
  const number = index + 1;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  if (!item || item.source?.year !== 113 || item.source?.questionNumber !== number) failures.push(`${id}: source identity mismatch`);
  if (item?.answer !== keys[index] || item.options?.length !== 4 || !item.options[item.answer]) failures.push(`${id}: key or options mismatch`);
  if (!item?.explanation || item.solutionSteps?.length < 3 || !item.teacherTip || !item.answerKeyReview?.status) failures.push(`${id}: incomplete worked explanation or key provenance`);
  if (figures.has(id)) {
    if (!item?.requiresImage || !item.questionImages?.some(image => image.endsWith(figures.get(id)))) failures.push(`${id}: required figure missing or not enabled`);
    else {
      try { await access(join(root, "assets/official-exams", figures.get(id))); }
      catch { failures.push(`${id}: figure asset missing`); }
    }
  }
}
const route = rows.find(row => row.id === "OFF-0825");
if (!route?.question.includes("皆由 X 前往 Y") || !route.question.includes("甲為直線路線，乙為曲折路線") || route.requiresImage) failures.push("OFF-0825: route question must remain self-contained without the source page");
const elementTable = rows.find(row => row.id === "OFF-0828");
if (!["氟（F）｜9｜17｜19.0", "氯（Cl）｜17｜17｜35.5", "溴（Br）｜35｜17｜79.9"].every(value => elementTable?.question.includes(value))) failures.push("OFF-0828: element table transcription incomplete");
const weather = rows.find(row => row.id === "OFF-0827");
if (!weather?.question.includes("橫軸刻度代表當日正午 12 點") || !weather.question.includes("未來幾天的天氣概況")) failures.push("OFF-0827: chart interpretation context missing");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Official Natural Sciences 113 Q1–10 source identities, official keys, required figures, table transcription, and self-contained stems passed.");
await import("./validate-official-science-113-q11-q20.mjs");
