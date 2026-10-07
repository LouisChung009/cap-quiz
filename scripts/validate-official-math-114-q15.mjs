import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const questions = JSON.parse(await readFile(new URL("../data/mission-questions.json", import.meta.url), "utf8"));
const question = questions.find(item => item.id === "OFF-0974");

assert.ok(question, "114 math Q15 must exist");
assert.match(question.question, /AB＝BC＝CD＝DE/);
assert.match(question.question, /\|a\|＋\|b\|＝\|e\|/);
assert.equal(question.source?.year, 114);
assert.equal(question.source?.questionNumber, 15);
assert.equal(question.options?.[1], "在 BC 上且較接近 C 點");
assert.equal(question.answer, 1);
assert.match(question.explanation, /t=−5\/3/);
assert.match(question.explanation, /較接近 C/);
assert.match(question.answerKeyReview?.note || "", /官方答案B/);

console.log("114 Math Q15: original absolute-value condition, answer, and worked reasoning verified.");
