import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questionPath = join(root, "data", "mission-questions.json");
const auditPath = join(root, "reports", "英文-teacher-audit.json");
const questions = JSON.parse(await readFile(questionPath, "utf8"));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const examIndex = JSON.parse(await readFile(join(root, "data", "official-exams.json"), "utf8"));
const answerSheet = examIndex.find(exam => exam.year === 114)?.answer;
assert.ok(answerSheet, "official 114 answer sheet URL is required");

const answers = [2, 1, 2, 2, 0, 1, 0];
const evidence = [
  ["dark time", "hospitals used candles", "lost their jobs", "艱難生活的比喻"],
  ["first year of junior high school", "started", "過去式"],
  ["couldn't stop thinking about two things", "How brave a woman is", "Thank God"],
  ["should not be about him", "about his mom", "媽媽承受懷孕的辛勞"],
  ["birthday gift", "第一份生日禮物", "only"],
  ["made his heart sing", "best thing she ever got", "delighted"],
  ["is going to give", "dress is finished", "完成洋裝不代表已送出"]
];
const ids = [];
for (let index = 0; index < answers.length; index += 1) {
  const number = index + 37;
  const id = `OFF-${String(916 + number).padStart(4, "0")}`;
  ids.push(id);
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "英文", `${id} subject`);
  assert.equal(item.source?.year, 114, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source number`);
  assert.equal(item.answer, answers[index], `${id} official key`);
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.ok(item.explanation?.length > 35, `${id} worked explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `${id} English usage/reading tip`);
  assert.ok(item.relatedWords?.length >= 2, `${id} vocabulary or clue support`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}\n${item.relatedWords.join("\n")}`;
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  assert.equal(item.requiresImage, false, `${id} complete text does not need redundant scan`);
  assert.equal(item.questionImage || "", "", `${id} no full-page scan`);
  assert.equal((item.questionImages || []).length, 0, `${id} no redundant image`);
  if (number >= 38) {
    assert.ok(item.requiresContext, `${id} shared reading context marker`);
    assert.ok(item.question.includes("Most kids want gifts from their parents"), `${id} shared passage opening`);
    assert.ok(item.question.includes("Now the dress is finished and hanging behind Cameron's bedroom door."), `${id} shared passage ending`);
  }
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official key provenance`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`英文第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} official key citation`);
}

for (let page = 10; page <= 13; page += 1) {
  await access(join(root, "assets", "official-exams", `114-english-p${page}.webp`));
}
const linked = audit.filter(item => ids.includes(item.id));
assert.equal(new Set(linked.map(item => item.id)).size, linked.length, "audit ids must be unique");
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 114 English Q37–43 against source pages and official answer table; removed ${linked.length} superseded audit flags.`);
