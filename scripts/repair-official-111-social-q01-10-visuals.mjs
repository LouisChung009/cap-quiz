import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const answers = ["C", "B", "C", "A", "D", "B", "C", "C", "B", "C"];
const textOnly = new Set([1, 4, 5, 6, 7, 8, 9, 10]);

for (let number = 1; number <= 10; number += 1) {
  const row = questions.find(question => question.subject === "社會" && question.source?.year === 111 && question.source.questionNumber === number);
  if (!row || String.fromCharCode(65 + row.answer) !== answers[number - 1] || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || row.answerKeyReview?.status !== "verified") throw new Error(`111 Social Q${number} failed source-key and completeness guard`);
  if (textOnly.has(number)) {
    row.questionImage = "";
    row.questionImages = [];
    row.imageAlt = "";
    row.requiresImage = false;
  }
}

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Checked 111 Social Q1–10; retained only the two necessary maps.");
