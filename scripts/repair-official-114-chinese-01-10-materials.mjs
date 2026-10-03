import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const figures = new Map([
  [3, ["./assets/official-exams/114-chinese-q03-origin-chart.png"]],
  [5, ["./assets/official-exams/114-chinese-q05-seal-script-options.png"]],
  [7, ["./assets/official-exams/114-chinese-q07-couplet-diagrams.png"]],
]);
for (let number = 1; number <= 10; number += 1) {
  const row = rows.find(item => item.subject === "國文" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114國文第${number}題`);
  const images = figures.get(number) ?? [];
  row.questionImage = images[0] ?? null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `114年會考國文第${number}題必要字形或示意圖` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Chinese Q1–10 image dependencies.");
