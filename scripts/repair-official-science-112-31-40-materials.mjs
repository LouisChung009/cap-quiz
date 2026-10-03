import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figures = {
  "OFF-0641": ["112-science-q31-tail-vessels.png"],
  "OFF-0642": ["112-science-q32-saliva-volume-graph.png", "112-science-q32-mouth-ph-graphs.png"],
  "OFF-0645": ["112-science-q35-strawberry-flower.png"],
  "OFF-0646": ["112-science-q36-sun-shadow-map.png"],
  "OFF-0647": ["112-science-q37-magnetic-force-diagram.png"]
};

for (let questionNumber = 31; questionNumber <= 40; questionNumber += 1) {
  const id = `OFF-${String(610 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 112 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  const images = (figures[id] || []).map(file => `./assets/official-exams/${file}`);
  row.questionImage = images[0] || null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `112年會考自然第${questionNumber}題必要圖表` : "";
}

const q33 = rows.find(item => item.id === "OFF-0643");
q33.options = [
  "fₛ < 200 gw",
  "200 gw < fₛ < 250 gw",
  "250 gw < fₛ < 300 gw",
  "fₛ > 300 gw"
];
q33.question = `${q33.question}\n\n資料表：外力 100、200、300、400 gw 時，摩擦力依序為 100、200、250、250 gw；前兩種情形靜止不動，後兩種情形等加速度運動。`;

const q34 = rows.find(item => item.id === "OFF-0644");
q34.question = `${q34.question}\n\n電器標示：AC 110 V、60 Hz、最大功率 1200 W。`;

await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 112 Science questions 31–40 materials and choices.");
