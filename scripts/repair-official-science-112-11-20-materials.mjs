import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = {
  "OFF-0621": "./assets/official-exams/112-science-q11-soap-process.png",
  "OFF-0623": "./assets/official-exams/112-science-q13-white-noise-graphs.png",
  "OFF-0627": "./assets/official-exams/112-science-q17-organic-inorganic-table.png",
  "OFF-0628": "./assets/official-exams/112-science-q18-race-track.png",
  "OFF-0629": "./assets/official-exams/112-science-q19-energy-track.png",
  "OFF-0630": "./assets/official-exams/112-science-q20-plant-data-table.png"
};

for (let questionNumber = 11; questionNumber <= 20; questionNumber += 1) {
  const id = `OFF-${String(610 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 112 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  const image = figures[id];
  row.questionImage = image || null;
  row.questionImages = image ? [image] : [];
  row.requiresImage = Boolean(image);
  row.requiresContext = false;
  row.imageAlt = image ? `112年會考自然第${questionNumber}題必要圖表` : "";
}

const q14 = rows.find(item => item.id === "OFF-0624");
q14.question = `${q14.question.replace(/表\(二\)$/, "")}\n\n表(二)　各生物體內 DDT 含量（ppm）：甲 2.0、乙 0.2、丙 20、丁 0.04。`;

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 112 Science questions 11–20 materials and figures.");
