import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(path, "utf8"));
const answers = ["C", "D", "B", "D", "D", "C", "B", "D", "A", "A"];
const noFigureQuestions = new Set([31, 32, 33, 34, 35, 36, 37, 38, 39, 40]);

for (let number = 31; number <= 40; number += 1) {
  const row = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === number);
  if (!row || String.fromCharCode(65 + row.answer) !== answers[number - 31] || row.options?.length !== 4 || row.solutionSteps?.length < 2 || !row.teacherTip || row.answerKeyReview?.status !== "verified") throw new Error(`112 Social Q${number} failed source-key and completeness guard`);
  if (noFigureQuestions.has(number)) {
    row.questionImage = "";
    row.questionImages = [];
    row.imageAlt = "";
    row.requiresImage = false;
  }
}

const q32 = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === 32);
q32.question = q32.question.replace("西元前十ㄧ世紀", "西元前十一世紀");
const q36 = questions.find(question => question.subject === "社會" && question.source?.year === 112 && question.source.questionNumber === 36);
q36.explanation = "答案 C。選舉資格除年滿 20 歲外，總統、副總統選舉須在該選舉區繼續居住滿 6 個月，其他公職選舉通常為 4 個月。題目中的人若在投票日前 6 個月遷入該區，可能符合總統、副總統選舉的設籍期間條件；若遷入地並非實際居住地，仍可能涉及違法遷籍，由檢察官依法偵辦。";
q36.solutionSteps = ["先分辨選舉種類的居住期間：總統、副總統選舉為 6 個月，其他公職選舉通常為 4 個月；投票權另須年滿 20 歲。", "投票日前 6 個月遷入，可能達到總統、副總統選舉的設籍期間門檻；但若非實際居住而虛偽遷籍，仍可能被檢察官偵辦。", "因此「被查出是在投票日的六個月前遷移戶籍」最符合題意，答案 C。假設年齡已達法定門檻，並非表示虛偽遷籍本身合法。"];
q36.teacherTip = "設籍期間依選舉種類不同：總統、副總統選舉 6 個月，其他公職通常 4 個月；期間達標不會讓虛偽遷籍合法化。";

await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
console.log("Removed unnecessary scans from 112 Social Q31–40; corrected Q32 transcription and clarified Q36 election-residency rule.");
