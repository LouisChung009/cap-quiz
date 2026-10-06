import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const answers = ["B", "D", "A", "B", "A", "C", "A", "A", "D", "A"];
const requiredVisuals = new Map([
  [15, { image: "./assets/official-exams/112-social-q15-cptpp-members.svg", alt: "112年社會科第15題CPTPP成員國地圖" }],
  [19, { image: "./assets/official-exams/112-social-q19-xiakaluo-trail.svg", alt: "112年社會科第19題霞喀羅警備道路路線圖" }]
]);

for (let number = 11; number <= 20; number += 1) {
  const row = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === number);
  if (!row || String.fromCharCode(65 + row.answer) !== answers[number - 11] || row.options?.length !== 4 || row.solutionSteps?.length < 2 || row.answerKeyReview?.status !== "verified") throw new Error(`112 Social Q${number} failed the source-key and completeness guard`);
  const visual = requiredVisuals.get(number);
  row.questionImage = visual?.image ?? "";
  row.questionImages = visual ? [visual.image] : [];
  row.imageAlt = visual?.alt ?? "";
  row.requiresImage = Boolean(visual);
  if (number === 14) {
    if (!row.question.includes("〈與諸子登峴山〉") || !row.question.includes("水落魚梁淺")) throw new Error("112 Social Q14 source poem reference changed");
    if (!row.question.includes("人事有代謝，往來成古今")) row.question = row.question.replace("唐代詩人孟浩然登上今湖北襄陽的峴山，見石碑碑文有感而作〈與諸子登峴山〉。", "唐代詩人孟浩然登上今湖北襄陽的峴山，見石碑碑文有感而作〈與諸子登峴山〉。詩作全文：「人事有代謝，往來成古今。江山留勝跡，我輩復登臨。水落魚梁淺，天寒夢澤深。羊公碑尚在，讀罷淚沾襟。」");
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Removed unnecessary full-page scans from 112 Social Q11–20, restored Q14's poem, and retained focused maps for Q15 and Q19.");
