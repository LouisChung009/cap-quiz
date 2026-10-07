import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gradeAttempt } from "../api/_lib/grade-attempt.js";
import { getQuestionMap } from "../api/_lib/question-bank.js";
import { createAttemptsHandler } from "../api/attempts.js";

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

const choiceQuestion = [...questions.values()].find(question => question.type !== "非選擇題");
const writes = [];
const calls = { profile: 0, schema: 0 };
const fixedNow = Date.parse("2026-10-07T00:00:00.000Z");
const sql = async (strings, ...values) => {
  writes.push({ query: strings.join("$parameter"), values });
  return [];
};
const handler = createAttemptsHandler({
  requireAuth: async () => ({ sub: "user-test-1234" }),
  database: () => sql,
  ensureSchema: async database => { calls.schema++; return database; },
  upsertUserProfile: async () => { calls.profile++; },
  getQuestionMap: async () => questions,
  now: () => fixedNow,
  handleApiError: (response, error) => response.status(error.status || 500).json({ message: error.message })
});
function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

const incorrectResponse = responseRecorder();
await handler({ method: "POST", body: {
  questionId: choiceQuestion.id,
  subject: choiceQuestion.subject,
  selectedAnswer: (choiceQuestion.answer + 1) % 4,
  correct: true,
  answeredAt: fixedNow - 60_000,
  unit: "偽造單元",
  knowledgePoint: "偽造知識點"
} }, incorrectResponse);
assert.equal(incorrectResponse.statusCode, 201);
assert.deepEqual(incorrectResponse.body, { saved: true, correct: false });
assert.equal(writes.length, 1);
assert.equal(writes[0].values[2], choiceQuestion.subject);
assert.equal(writes[0].values[3], String(choiceQuestion.unit || "").slice(0, 80));
assert.equal(writes[0].values[4], String(choiceQuestion.knowledgePoint || "").slice(0, 80));
assert.equal(writes[0].values[5], false);
assert.match(writes[0].query, /answered_at\) VALUES \([^)]*NOW\(\)/, "trusted answer time must come from the database server");
assert.equal(writes[0].values[6], new Date(fixedNow - 60_000).toISOString(), "valid client time is stored separately for diagnostics");

const futureResponse = responseRecorder();
await handler({ method: "POST", body: {
  questionId: choiceQuestion.id,
  subject: choiceQuestion.subject,
  selectedAnswer: choiceQuestion.answer,
  answeredAt: fixedNow + 6 * 60 * 1000
} }, futureResponse);
assert.equal(futureResponse.statusCode, 201);
assert.equal(writes.length, 2);
assert.equal(writes[1].values[6], null, "client timestamps more than five minutes in the future must be discarded");

const invalidResponse = responseRecorder();
await handler({ method: "POST", body: { questionId: "CHI-9999", subject: "國文", selectedAnswer: 0 } }, invalidResponse);
assert.equal(invalidResponse.statusCode, 400);
assert.equal(writes.length, 2, "unknown questions must not be written to the database");
assert.equal(calls.schema, 2);
assert.equal(calls.profile, 2);

const api = await readFile(join(root, "api", "attempts.js"), "utf8");
assert.ok(api.includes("gradeAttempt(question"), "API must use server-side grading");
assert.ok(!/const\s*\{[^}]*\bcorrect\b[^}]*\}\s*=\s*request\.body/.test(api), "API must not trust a client-supplied correctness flag");
const config = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
assert.equal(config.functions["api/attempts.js"].includeFiles, "data/*.json", "Vercel must bundle canonical question data with the attempts function");
console.log(`Server-side grading verified across ${questions.size} questions; client correctness flags are not trusted.`);
