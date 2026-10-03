import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = {
  "OFF-0631": "112-science-q21-planet-plot.png",
  "OFF-0632": "112-science-q22-temperature-graph.png",
  "OFF-0633": "112-science-q23-velocity-time-graph.png",
  "OFF-0635": "112-science-q25-gas-composition-options.png",
  "OFF-0638": "112-science-q28-weather-map.png",
  "OFF-0639": "112-science-q29-time-altitude-options.png"
};

for (let questionNumber = 21; questionNumber <= 30; questionNumber += 1) {
  const id = `OFF-${String(610 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 112 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  const figure = figures[id];
  const image = figure ? `./assets/official-exams/${figure}` : null;
  row.questionImage = image;
  row.questionImages = image ? [image] : [];
  row.requiresImage = Boolean(image);
  row.requiresContext = false;
  row.imageAlt = image ? `112年會考自然第${questionNumber}題必要圖表` : "";
}

const q23 = rows.find(item => item.id === "OFF-0633");
q23.options = [
  "甲受力時間較長，且 F甲 > F乙",
  "甲受力時間較長，但 F甲 < F乙",
  "乙受力時間較長，但 F甲 > F乙",
  "乙受力時間較長，且 F甲 < F乙"
];

const q29 = rows.find(item => item.id === "OFF-0639");
q29.question = `${q29.question}\n\n行程資料：10:00 臺中（海拔 110 m）出發；13:00 清境農場（1,750 m）；17:00 武嶺（3,275 m）；21:00 返回臺中（110 m）。`;

const q30 = rows.find(item => item.id === "OFF-0640");
q30.question = `${q30.question}\n\n標示資料：甲牌 260 c.c.、240 g；乙牌 275 mL、275 g；1 c.c. = 1 cm³。`;

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 112 Science questions 21–30 materials and choices.");
