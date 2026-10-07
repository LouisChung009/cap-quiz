import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "英文-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const cases = [
  { number: 1, answer: 3, clues: ["plane", "機身與機翼", "bird", "butterfly", "kite"], picture: true },
  { number: 20, answer: 1, clues: ["Rex is in the hospital", "hit by a car last night", "He got hurt"] },
  { number: 21, answer: 1, clues: ["take him for a walk every evening", "Because of the exercise", "healthier and stronger"] },
  { number: 22, answer: 0, clues: ["Don't start again", "stealing Jenny's thunder", "MARK!!"] },
  { number: 23, answer: 2, clues: ["stealing someone's thunder", "Ivy is still telling them about her baby", "搶走 Ivy 的焦點"] },
  { number: 24, answer: 3, clues: ["as many times as you want", "20%", "inside the three zones"] },
  { number: 25, answer: 2, clues: ["Zone 1", "Zone 2", "$20", "$50", "$70"] },
  { number: 26, answer: 2, clues: ["popular family vacation place", "pick fruit", "collect eggs", "feed animals"] },
  { number: 27, answer: 0, clues: ["first paragraph", "mops the floor", "gets the mail", "feed the baby sheep"] },
  { number: 28, answer: 3, clues: ["making sacrifices", "sleep until noon", "summer camp", "friends stopped inviting"] }
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (const itemCase of cases) {
  const item = questions.find(question => question.subject === "英文" && question.source?.year === 114 && question.source.questionNumber === itemCase.number);
  assert.ok(item, `missing official 114 English Q${itemCase.number}`);
  assert.equal(item.id, `OFF-${String(916 + itemCase.number).padStart(4, "0")}`, `Q${itemCase.number} ID`);
  assert.equal(item.answer, itemCase.answer, `Q${itemCase.number} official answer index`);
  if (itemCase.number === 25) {
    assert.ok(item.answerKeyReview?.status?.includes("官方英文科題本第25題核對"), "Q25 source-specific answer provenance");
    assert.ok(item.answerKeyReview?.note?.includes("答案 C") && item.answerKeyReview.note.includes("$70"), "Q25 source-specific key reasoning");
  } else {
    assert.match(item.answerKeyReview?.note || "", new RegExp(`英文第${itemCase.number}題官方答案${String.fromCharCode(65 + itemCase.answer)}`), `Q${itemCase.number} answer provenance`);
  }
  assert.equal(item.options?.length, 4, `Q${itemCase.number} four choices`);
  assert.ok(item.explanation?.length > 35, `Q${itemCase.number} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `Q${itemCase.number} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `Q${itemCase.number} English teaching tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}\n${(item.relatedWords || []).join("\n")}`;
  for (const clue of itemCase.clues) assert.ok(text.includes(clue), `Q${itemCase.number} source-content clue: ${clue}`);
  if (itemCase.picture) {
    const picture = "./assets/official-exams/114-english-q01-picture.svg";
    assert.equal(item.requiresImage, true, "Q1 diagram must remain required");
    assert.ok(item.questionImages?.includes(picture), "Q1 focused picture must remain attached");
    assert.equal(item.questionImage, picture, "Q1 primary figure must be the focused crop");
    await access(join(root, picture));
  } else {
    assert.equal(item.requiresImage, false, `Q${itemCase.number} has self-contained text instead of a redundant scan`);
    assert.equal(item.questionImage || "", "", `Q${itemCase.number} has no redundant whole-page scan`);
    assert.equal((item.questionImages || []).length, 0, `Q${itemCase.number} has no unnecessary figure`);
  }
}

for (const page of [2, 3, 4, 5, 6, 7, 8]) await access(join(root, "assets", "official-exams", `114-english-p${page}.webp`));
const ids = new Set(cases.map(item => `OFF-${String(916 + item.number).padStart(4, "0")}`));
const linked = audit.filter(finding => ids.has(finding.id));
await writeFile(auditPath, `${JSON.stringify(audit.filter(finding => !ids.has(finding.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 114 English Q1 and Q20–28 against source pages and answer evidence; removed ${linked.length} superseded flags.`);
