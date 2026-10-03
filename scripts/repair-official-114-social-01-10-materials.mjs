import { readFile, writeFile } from "node:fs/promises";

const file = new URL("../data/mission-questions.json", import.meta.url);
const rows = JSON.parse(await readFile(file, "utf8"));
const figures = new Map([
  [4, "./assets/official-exams/114-social-q04-wazai-map.png"],
  [6, "./assets/official-exams/114-social-q06-taipei-map.png"],
  [10, "./assets/official-exams/114-social-q10-indulgence-woodcut.png"],
]);
for (let number = 1; number <= 10; number += 1) {
  const row = rows.find(item => item.subject === "社會" && item.source?.year === 114 && item.source.questionNumber === number);
  if (!row) throw new Error(`找不到114社會第${number}題`);
  const image = figures.get(number);
  row.questionImage = image ?? null;
  row.questionImages = image ? [image] : [];
  row.requiresImage = Boolean(image);
  row.requiresContext = false;
  row.imageAlt = image ? `114年會考社會第${number}題必要地圖或史料圖像` : "";
}
await writeFile(file, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired official 114 Social Studies Q1–10 image dependencies.");
