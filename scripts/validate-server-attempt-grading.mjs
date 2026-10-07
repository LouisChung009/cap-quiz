import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gradeAttempt } from "../api/_lib/grade-attempt.js";
import { getQuestionMap } from "../api/_lib/question-bank.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = await getQuestionMap();
assert.equal(questions.size, 6108, "server-side answer index must cover all 6,108 questions");

for (const question of questions.values()) {
  if (question.type === "非選擇題") {
    const responses = question.responseParts.map(part => `${part.acceptableAnswers?.[0] ?? part.answer ?? ""} ${(part.requiredTerms || []).join(" ")}`.trim());
    assert.equal(gradeAttempt(question, { subject: question.subject, responseValues: responses }), true, `${question.id}: accepted constructed response must grade correct`);
    const incorrect = [...responses];
    incorrect[0] = `${incorrect[0]} 明顯錯誤答案`;
    assert.equal(gradeAttempt(question, { subject: question.subject, responseValues: incorrect }), false, `${question.id}: incorrect constructed response must grade incorrect`);
    assert.equal(gradeAttempt(question, { subject: question.subject, responseValues: responses.slice(1) }), null, `${question.id}: incomplete constructed response must be rejected`);
  } else {
    assert.equal(gradeAttempt(question, { subject: question.subject, selectedAnswer: question.answer }), true, `${question.id}: keyed answer must grade correct`);
    for (let answer = 0; answer < question.options.length; answer++) {
      if (answer !== question.answer) assert.equal(gradeAttempt(question, { subject: question.subject, selectedAnswer: answer }), false, `${question.id}: distractor ${answer} must grade incorrect`);
    }
    assert.equal(gradeAttempt(question, { subject: question.subject, selectedAnswer: 4 }), null, `${question.id}: out-of-range answer must be rejected`);
  }
  assert.equal(gradeAttempt(question, { subject: "錯誤科目", selectedAnswer: question.answer }), null, `${question.id}: mismatched subject must be rejected`);
}

const api = await readFile(join(root, "api", "attempts.js"), "utf8");
assert.ok(api.includes("gradeAttempt(question"), "API must use server-side grading");
assert.ok(!/const\s*\{[^}]*\bcorrect\b[^}]*\}\s*=\s*request\.body/.test(api), "API must not trust a client-supplied correctness flag");
const config = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
assert.equal(config.functions["api/attempts.js"].includeFiles, "data/*.json", "Vercel must bundle canonical question data with the attempts function");
console.log(`Server-side grading verified across ${questions.size} questions; client correctness flags are not trusted.`);
