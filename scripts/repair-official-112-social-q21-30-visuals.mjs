import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const answers = ["B", "D", "B", "B", "A", "B", "D", "B", "A", "D"];
const requiredVisuals = new Map([
  [23, { image: "./assets/official-exams/112-social-q23-income-chart.svg", alt: "112年社會科第23題：所得最高與最低20%家庭可支配所得成長率圖" }],
  [25, { image: "./assets/official-exams/112-social-q25-world-gdp.svg", alt: "112年社會科第25題：2011年世界各國GDP矩形面積圖" }],
  [26, { image: "./assets/official-exams/112-social-q26-pan-american-route.svg", alt: "112年社會科第26題：泛美公路及巴拿馬—哥倫比亞未建路段地圖" }],
  [27, { image: "./assets/official-exams/112-social-q27-la-palma-eruption.svg", alt: "112年社會科第27題：拉帕爾馬火山熔岩流、火山灰分布與比例尺" }]
]);

for (let number = 21; number <= 30; number += 1) {
  const row = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === number);
  if (!row || String.fromCharCode(65 + row.answer) !== answers[number - 21] || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || row.answerKeyReview?.status !== "verified") throw new Error(`112 Social Q${number} failed source-key and completeness guard`);
  const visual = requiredVisuals.get(number);
  row.questionImage = visual?.image ?? "";
  row.questionImages = visual ? [visual.image] : [];
  row.imageAlt = visual?.alt ?? "";
  row.requiresImage = Boolean(visual);
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Removed unnecessary scans from 112 Social Q21–30 and retained focused figures only for Q23, Q25–27.");
