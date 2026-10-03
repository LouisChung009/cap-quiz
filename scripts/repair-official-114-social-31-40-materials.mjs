import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const figures = new Map([
  [40, ["./assets/official-exams/114-social-q40-kaliningrad-map.png"]],
]);
for (let number = 31; number <= 40; number += 1) {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  const images = figures.get(number) ?? [];
  row.questionImage = images[0] ?? null;
  row.questionImages = images;
  row.requiresImage = images.length > 0;
  row.requiresContext = false;
  row.imageAlt = images.length ? `114年會考社會第${number}題必要史料或地圖` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q31–40 image dependencies.");
