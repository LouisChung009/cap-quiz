import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = {
  "OFF-0855": "113-science-q31-classroom-map.png",
  "OFF-0859": "113-science-q35-intensity-map.png",
  "OFF-0860": "113-science-q36-lens-ray-options.png",
  "OFF-0864": "113-science-q40-copper-plating-options.png"
};
for (let questionNumber = 31; questionNumber <= 40; questionNumber += 1) {
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
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 113 Science questions 31–40 image requirements.");
