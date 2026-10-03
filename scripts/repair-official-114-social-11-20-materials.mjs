import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const figures = new Map([
  [14, ["./assets/official-exams/114-social-q14-family-diagram.png"]],
  [16, ["./assets/official-exams/114-social-q16-western-route-map.png"]],
  [17, ["./assets/official-exams/114-social-q17-contour-map.png"]],
  [19, ["./assets/official-exams/114-social-q19-population-pyramids.png"]],
  [20, ["./assets/official-exams/114-social-q20-sugar-tool.png", "./assets/official-exams/114-social-q20-taiwan-map.png"]],
]);
for (let number = 11; number <= 20; number += 1) {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  const images = figures.get(number) ?? [];
  row.questionImage = images[0] ?? null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `114年會考社會第${number}題必要圖表或示意圖` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q11–20 image dependencies.");
