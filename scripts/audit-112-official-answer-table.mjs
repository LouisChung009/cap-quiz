import { readFile, writeFile } from "node:fs/promises";

const rows = `D B C A C D
D D A C D B
C D B B A D
C B C C A C
D A C B A A
C B B A C A
A A A A C B
A C B C D C
A C C B C C
D D B D C B
C D C D B D
A C C A D A
B C B A A A
C C A B B B
B D A D A B
D C A C C A
A C B D A B
C B A B A A
A D C B D C
B C C C A B
C A A D B D
D B C D B
D D B B C
B B D B D
D B A A D
A A B A
A A D A
B C B A
C D A B
A B D C
C A C C
B A D C
C D B C
B C D D
B B D C
C D C A
B D B B
A B D D
D B A D
D C A A
B B C A
D A D D
A C A
C D
D C
B B
C B
D B
B A
A C
A
D
B
C`.split("\n").map(row => row.trim().split(/\s+/));

const year = 112;
const counts = { 國文: 42, 英文: 43, 數學: 25, 社會: 54, 自然: 50 };
const subjectColumns = ["國文", "英文", "數學", "社會", "自然"];
const mapped = new Map(subjectColumns.map(subject => [subject, []]));
for (let questionNumber = 1; questionNumber <= rows.length; questionNumber += 1) {
  const active = subjectColumns.filter(subject => questionNumber <= counts[subject]);
  if (questionNumber <= 21) active.splice(2, 0, "英文聽力");
  const source = rows[questionNumber - 1];
  if (source.length !== active.length) {
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
const answerSheet = officialExamIndex.find(exam => exam.year === year)?.answer;
if (!answerSheet) throw new Error(`${year}年官方答案表網址缺失`);
const official = questions.filter(question => question.sourceType === "官方歷屆真題" && question.source.year === year);
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
    for (const question of current) verified.push({ question, letter: key[question.source.questionNumber - 1], number: question.source.questionNumber });
  }
}
if (process.argv.includes("--write") && mismatchCount === 0 && process.exitCode !== 1) {
  for (const { question, letter, number } of verified) {
    question.answerKeyReview = {
      status: "verified",
      note: `依${year}年國中教育會考官方選擇題參考答案一覽表核對：${question.subject}第${number}題官方答案${letter}，與目前正解索引及選項相符。答案表：${answerSheet}`
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
