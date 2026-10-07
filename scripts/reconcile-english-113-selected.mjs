import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "英文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const cases = [
  { number: 1, answer: 0, clues: ["Look at the picture", "under the door", "an envelope", "母音音素"] , figure: "./assets/official-exams/113-english-q01-picture.svg" },
  { number: 30, answer: 0, clues: ["doctor", "health center", "smaller problems", "To explain Chen’s services"] },
  { number: 33, answer: 0, clues: ["Habibi & Hawara", "some of them were cooks", "start a new life", "To help refugees live better in Austria"] },
  { number: 40, answer: 0, clues: ["social distancing", "widely used in the U.S. in the flu pandemic in 1918", "is not a new idea"] },
  { number: 41, answer: 1, clues: ["From the picture", "started social distancing earlier", "New York", "灰色區塊的左端起點"], figure: "./assets/official-exams/113-english-q41-chart.png" },
  { number: 42, answer: 1, clues: ["Portland and Denver", "stopped social distancing too soon", "numbers of deaths climbed again"] },
  { number: 43, answer: 3, clues: ["For example", "schools were closed", "public activities were not allowed"] }
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (const itemCase of cases) {
  const item = questions.find(question => question.subject === "英文" && question.source?.year === 113 && question.source.questionNumber === itemCase.number);
  assert.ok(item, `missing official 113 English Q${itemCase.number}`);
  assert.equal(item.id, `OFF-${String(702 + itemCase.number).padStart(4, "0")}`, `Q${itemCase.number} ID`);
  assert.equal(item.answer, itemCase.answer, `Q${itemCase.number} official answer index`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`英文第${itemCase.number}題官方答案${String.fromCharCode(65 + itemCase.answer)}`), `Q${itemCase.number} official key provenance`);
  assert.equal(item.options?.length, 4, `Q${itemCase.number} four choices`);
  assert.ok(item.explanation?.length > 35, `Q${itemCase.number} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `Q${itemCase.number} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `Q${itemCase.number} English-specific tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}\n${(item.relatedWords || []).join("\n")}`;
  for (const clue of itemCase.clues) assert.ok(text.includes(clue), `Q${itemCase.number} source clue: ${clue}`);
  if (itemCase.figure) {
    assert.equal(item.requiresImage, true, `Q${itemCase.number} figure is required`);
    assert.equal(item.questionImage, itemCase.figure, `Q${itemCase.number} focused figure`);
    assert.ok(item.questionImages?.includes(itemCase.figure), `Q${itemCase.number} figure reference`);
    assert.ok(serviceWorker.includes(itemCase.figure), `Q${itemCase.number} offline figure cache`);
    await access(join(root, itemCase.figure));
  } else {
    assert.equal(item.requiresImage, false, `Q${itemCase.number} self-contained text`);
    assert.equal(item.questionImage || "", "", `Q${itemCase.number} no whole-page scan`);
    assert.equal((item.questionImages || []).length, 0, `Q${itemCase.number} no unnecessary image`);
  }
}

for (const page of [2, 7, 8, 9, 10, 11, 12, 13]) await access(join(root, "assets", "official-exams", `113-english-p${page}.webp`));
assert.ok(serviceWorker.includes("./data/mission-questions.json?v=68"), "question-data cache version");
assert.ok(serviceWorker.includes('const CACHE="cap-quiz-v7.5.188"'), "service-worker cache version");
const ids = new Set(cases.map(item => `OFF-${String(702 + item.number).padStart(4, "0")}`));
const linked = audit.filter(finding => ids.has(finding.id));
await writeFile(auditPath, `${JSON.stringify(audit.filter(finding => !ids.has(finding.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 113 English Q1, Q30, Q33, and Q40–43; verified focused images and removed ${linked.length} superseded flags.`);
