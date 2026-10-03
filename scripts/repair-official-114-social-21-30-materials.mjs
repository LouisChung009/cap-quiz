import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const figures = new Map([
  [22, ["./assets/official-exams/114-social-q22-newspaper-clipping.png"]],
  [23, ["./assets/official-exams/114-social-q23-europe-map.png"]],
  [26, ["./assets/official-exams/114-social-q26-labor-chart.png"]],
  [27, ["./assets/official-exams/114-social-q27-black-sea-canal-map.png"]],
  [28, ["./assets/official-exams/114-social-q28-singapore-map.png"]],
  [29, ["./assets/official-exams/114-social-q29-china-rainfall-options.png"]],
]);
for (let number = 21; number <= 30; number += 1) {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  const images = figures.get(number) ?? [];
  row.questionImage = images[0] ?? null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `114年會考社會第${number}題必要圖表、史料或地圖` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q21–30 image dependencies.");
