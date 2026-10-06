import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const visuals = new Map([
  [1, null],
  [2, { image: "./assets/official-exams/112-social-q02-happiness-bus-map.svg", alt: "112年社會科第2題幸福巴士營運路線圖" }],
  [3, null],
  [4, null],
  [5, null],
  [6, null],
  [7, { image: "./assets/official-exams/112-social-q07-life-expectancy.svg", alt: "112年社會科第7題法國平均壽命曲線圖" }],
  [8, null],
  [9, null],
  [10, { image: "./assets/official-exams/112-social-q10-territory.svg", alt: "112年社會科第10題領土範圍示意圖" }]
]);
const answers = ["C", "D", "A", "A", "A", "C", "C", "D", "C", "C"];

for (let number = 1; number <= 10; number += 1) {
  const row = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === number);
  if (!row || String.fromCharCode(65 + row.answer) !== answers[number - 1] || row.options?.length !== 4 || row.answerKeyReview?.status !== "verified") throw new Error(`112 Social Q${number} key or options failed the repair guard`);
  const visual = visuals.get(number);
  row.questionImage = visual?.image ?? "";
  row.questionImages = visual ? [visual.image] : [];
  row.imageAlt = visual?.alt ?? "";
  row.requiresImage = Boolean(visual);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Removed unnecessary full-page scans from text-only 112 Social Q1–10 and retained focused figures for Q2, Q7, and Q10.");
