import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(path, "utf8"));
for (let questionNumber = 11; questionNumber <= 20; questionNumber += 1) {
  const id = `OFF-${String(824 + questionNumber).padStart(4, "0")}`;
  const row = rows.find(item => item.id === id);
  if (!row || row.sourceType !== "官方歷屆真題" || row.source?.year !== 113 || row.source?.questionNumber !== questionNumber) {
    throw new Error(`Unexpected official question ${id}`);
  }
  const image = questionNumber === 15 ? "./assets/official-exams/113-science-q15-isobar-map.svg" : null;
  row.questionImage = image;
  row.questionImages = image ? [image] : [];
  row.requiresImage = Boolean(image);
  row.requiresContext = false;
  row.imageAlt = image ? "113年會考自然第15題等壓線圖" : "";
}
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 113 Science questions 11–20 image requirements.");
