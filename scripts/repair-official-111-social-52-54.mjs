import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const path = join(dirname(dirname(fileURLToPath(import.meta.url))), "data", "mission-questions.json");
const rows = JSON.parse(await readFile(path, "utf8"));
const items = [
  { id: "OFF-0394", answer: 0, explanation: "文章描述十九世紀英國燃煤工業、工廠煙塵與城市勞工居住環境惡化，這些都是工業化與工業革命帶來的城市變遷，答案 A。", steps: ["從文章找時間及現象：十九世紀英國、燃煤工廠、城市空氣污染。", "工廠大量使用煤炭及城市人口集中，是工業化發展的典型背景。", "因此城市現象與工業革命關係最密切，答案 A。"], tip: "從工業技術、燃料、工廠及城市勞工等線索辨認工業革命。" },
  { id: "OFF-0395", answer: 1, explanation: "圖(二十八)的主要空氣污染源在中心，盛行風由西向東吹；低技術勞工居住區位於污染源下風處，東側標示乙，較容易承受煙塵，答案 B。", steps: ["先讀圖上的北向與方位：乙在污染源東側。", "文章指出盛行風把煙霧吹往城市下風處；圖中風向由西向東。", "污染源東側的乙位於下風處，答案 B。"], tip: "風向名稱指風吹來的方向；西風由西往東吹，煙塵會移向東側。" },
  { id: "OFF-0396", answer: 0, explanation: "文章指出資本家居住在環境較好的區域，低技術勞工被迫住在空氣污染較嚴重的地區，呈現階級及資源分配不平等。關注階級差異與社會平等的思想是社會主義，答案 A。", steps: ["比較不同居民的居住環境：資本家較佳，低技術勞工較差。", "這反映財富、階級與生活條件的不平等。", "關注階級不平等與改善勞工處境的是社會主義，答案 A。"], tip: "依思想關懷辨認：社會主義著重階級差異、勞工權益及資源分配。" },
];
for (const item of items) {
  const row = rows.find(question => question.id === item.id);
  if (!row || row.answer !== item.answer || item.steps.length !== 3 || row.source?.year !== 111) throw new Error(`Identity, answer, or structure mismatch for ${item.id}`);
  Object.assign(row, { explanation: item.explanation, solutionSteps: item.steps, teacherTip: item.tip });
}
for (const id of ["OFF-0394", "OFF-0396"]) {
  const row = rows.find(question => question.id === id);
  if (!row || row.source?.year !== 111) throw new Error(`Text-only identity mismatch for ${id}`);
  delete row.questionImage;
  delete row.imageAlt;
  row.questionImages = [];
  row.requiresImage = false;
}
const row = rows.find(question => question.id === "OFF-0395");
if (!row || row.source?.year !== 111) throw new Error("OFF-0395 visual identity mismatch");
row.questionImage = "./assets/official-exams/111-social-q53-city-diagram.png";
row.questionImages = [row.questionImage];
row.imageAlt = "第53題城市中心污染源、風向與甲乙丙丁方位圖";
row.requiresImage = true;
await writeFile(path, `${JSON.stringify(rows, null, 2)}\n`);
console.log("Repaired source-grounded explanations for final 111 social questions 52–54.");
