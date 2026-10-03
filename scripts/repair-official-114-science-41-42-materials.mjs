import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const chart = "./assets/official-exams/114-science-q41-fuel-energy-chart.png";
for (const number of [41, 42]) {
  const row = rows.find(item => item.subject === "自然" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114自然第${number}題`);
  row.questionImage = number === 41 ? chart : null;
  row.questionImages = number === 41 ? [chart] : [];
  row.requiresImage = number === 41;
  row.requiresContext = false;
  row.imageAlt = number === 41 ? "114年會考自然第41題燃料單位質量與體積能量比較圖" : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired 114 Science Q41–42 figure dependencies.");
