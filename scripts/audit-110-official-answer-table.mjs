import { readFile, writeFile } from "node:fs/promises";

const rows = `A D B A C A
D C C B B D
C D B D B C
B A B C A D
C C A D B D
A B B C B C
A D A B A A
D B C C C B
D B A C B B
B A B D A A
B C A D C C
B C C B A D
A B A B D B
B A C C A A
C B C B D A
B D C B B C
A B C D C A
D C A A D C
C A C D B B
D C A B D C
B C A A D D
D A C C A
A D A B C
D C C D A
B B A C A
C A A B D
A B D D
B C B A
D D C D
C D C D
D A B B
D D A B
D B A B
C A D A
C D D B
B A C D
B C C D
A C C C
A A D D
C B B D
B A C A
A B C
B B B
D A C
A D A
D C B
C A A
D D C
A C
D C
B B
A B
B D
B B
C
A
B
C
B
A
C
C
D`.split("\n").map(row => row.trim().split(/\s+/));

const counts = { 國文: 48, 英文: 41, 數學: 26, 社會: 63, 自然: 54 };
const subjectColumns = ["國文", "英文", "數學", "社會", "自然"];
const mapped = new Map(subjectColumns.map(subject => [subject, []]));
for (let questionNumber = 1; questionNumber <= rows.length; questionNumber += 1) {
  const active = subjectColumns.filter(subject => questionNumber <= counts[subject]);
  if (questionNumber <= 21) active.splice(2, 0, "英文聽力");
  const source = rows[questionNumber - 1];
  if (source.length !== active.length && questionNumber > 21) {
    console.error(`Q${questionNumber}: expected ${active.length} answer cells, read ${source.length}`);
    process.exitCode = 1;
  }
  for (let index = 0; index < active.length; index += 1) {
    if (mapped.has(active[index])) mapped.get(active[index]).push(source[index]);
  }
}

const missionPath = new URL("../data/mission-questions.json", import.meta.url);
const questions = JSON.parse(await readFile(missionPath, "utf8"));
const officialExamIndex = JSON.parse(await readFile(new URL("../data/official-exams.json", import.meta.url), "utf8"));
const answerSheet = officialExamIndex.find(exam => exam.year === 110)?.answer;
if (!answerSheet) throw new Error("110年官方答案表網址缺失");
const official = questions.filter(question => question.sourceType === "官方歷屆真題" && question.source.year === 110);
const verified = [];
let mismatchCount = 0;
for (const subject of subjectColumns) {
  const current = official.filter(question => question.subject === subject && question.type !== "非選擇題").sort((a, b) => a.source.questionNumber - b.source.questionNumber);
  const key = mapped.get(subject);
  const mismatches = current.filter(question => String.fromCharCode(65 + question.answer) !== key[question.source.questionNumber - 1]);
  mismatchCount += mismatches.length;
  console.log(`${subject}: ${current.length} items, ${key.length} extracted official keys, ${mismatches.length} mismatches`);
  for (const question of mismatches) {
    const number = question.source.questionNumber;
    console.log(`  ${question.id} (${question.subject} Q${number}): current ${String.fromCharCode(65 + question.answer)}, official ${key[number - 1]}`);
  }
  if (!mismatches.length) {
    for (const question of current) {
      const number = question.source.questionNumber;
      const letter = key[number - 1];
      verified.push({ question, letter, number });
    }
  }
}
if (process.argv.includes("--write") && mismatchCount === 0 && process.exitCode !== 1) {
  for (const { question, letter, number } of verified) {
    question.answerKeyReview = {
      status: "verified",
      note: `依110年國中教育會考官方選擇題參考答案一覽表核對：${question.subject}第${number}題官方答案${letter}，與目前正解索引及選項相符。答案表：${answerSheet}`
    };
  }
  for (const question of official.filter(item => item.subject === "數學" && item.type === "非選擇題")) {
    question.answerKeyReview = {
      status: "not_applicable",
      note: `官方選擇題參考答案一覽表不涵蓋此數學非選擇題；此欄不代表非選題內容已完成教師審核。題本：${question.source.paperUrl}`
    };
  }
  await writeFile(missionPath, `${JSON.stringify(questions, null, 2)}\n`, "utf8");
  console.log(`Wrote ${verified.length} answer-key provenance records; math constructed response marked not_applicable.`);
}
if (mismatchCount > 0) process.exitCode = 1;
