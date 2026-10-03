import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
const figure = "./assets/official-exams/113-science-q49-co2-cycle-graph.png";
for (let questionNumber = 41; questionNumber <= 50; questionNumber += 1) {
  const id = `OFF-${String(824 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 113 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  const requiresImage = questionNumber === 49;
  row.questionImage = requiresImage ? figure : null;
  row.questionImages = requiresImage ? [figure] : [];
  row.requiresImage = requiresImage;
  row.requiresContext = false;
  row.imageAlt = requiresImage ? "113年會考自然第49題二氧化碳濃度週期變化圖" : "";
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 113 Science questions 41–50 image requirements.");
