import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const answers = ["A", "D", "B", "C"];

for (let number = 51; number <= 54; number += 1) {
  const row = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === number);
  if (!row || String.fromCharCode(65 + row.answer) !== answers[number - 51] || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || row.answerKeyReview?.status !== "verified") throw new Error(`112 Social Q${number} failed source-key and completeness guard`);
  row.questionImage = "";
  row.questionImages = [];
  row.imageAlt = "";
  row.requiresImage = false;
}

console.log("Removed redundant page scans from text-complete 112 Social Q51–54.");
await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
