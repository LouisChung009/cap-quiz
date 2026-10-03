import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = {
  "OFF-0827": "113-science-q03-weekly-temperature-chart.png",
  "OFF-0830": "113-science-q06-exposed-wire-repair.png",
  "OFF-0832": "113-science-q08-earth-sun-options.png",
  "OFF-0833": "113-science-q09-cell-osmosis.png",
  "OFF-0834": "113-science-q10-ocean-floor-age-options.png"
};

for (let questionNumber = 1; questionNumber <= 10; questionNumber += 1) {
  const id = `OFF-${String(824 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 113 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  const image = figures[id] ? `./assets/official-exams/${figures[id]}` : null;
  row.questionImage = image;
  row.questionImages = image ? [image] : [];
  row.requiresImage = Boolean(image);
  row.requiresContext = false;
  row.imageAlt = image ? `113年會考自然第${questionNumber}題必要圖表` : "";
}

const q10 = rows.find(item => item.id === "OFF-0834");
q10.question = q10.question.replace("X 位於中洋脊旁，Y、Z 位於離中洋脊較遠處", "依圖中距中洋脊由近到遠依序為 X、Y、Z");

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 113 Science questions 1–10 material requirements.");
