import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const answers = ["C", "D", "C", "C", "D", "B", "C", "D", "B", "A"];
const requiredVisuals = new Map([
  [41, { image: "./assets/official-exams/112-social-q41-mughal-palace.svg", alt: "112年社會科第41題：印度莫臥兒王朝宮殿照片與原卷圖說" }],
  [47, { image: "./assets/official-exams/112-social-q47-fuji-contour-map.svg?v=7.5.176", alt: "112年社會科第47題：富士山登山路線等高線圖、起終點與比例尺" }]
]);

for (let number = 41; number <= 50; number += 1) {
  const row = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === number);
  if (!row || String.fromCharCode(65 + row.answer) !== answers[number - 41] || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || row.answerKeyReview?.status !== "verified") throw new Error(`112 Social Q${number} failed source-key and completeness guard`);
  const visual = requiredVisuals.get(number);
  row.questionImage = visual?.image ?? "";
  row.questionImages = visual ? [visual.image] : [];
  row.imageAlt = visual?.alt ?? "";
  row.requiresImage = Boolean(visual);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Removed unnecessary scans from 112 Social Q42–46 and Q48–50; retained focused visuals for Q41 and Q47.");
