import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { matchesDifficulty, matchesSource } from "../question-validation.js";

const files = ["chinese", "english", "math", "science", "social"];
const levels = ["基礎", "中等", "進階"];

const officialQuestion = { sourceType: "官方歷屆真題" };
const similarQuestion = { sourceType: "依114年官方真題能力指標原創" };
const originalQuestion = { sourceType: "原創會考程度練習" };
for (const item of [officialQuestion, similarQuestion, originalQuestion]) assert.equal(matchesSource(item, ""), true);
assert.equal(matchesSource(officialQuestion, "official"), true);
assert.equal(matchesSource(similarQuestion, "official"), false);
assert.equal(matchesSource(originalQuestion, "official"), false);
assert.equal(matchesSource(similarQuestion, "similar"), true);
assert.equal(matchesSource(officialQuestion, "similar"), false);
assert.equal(matchesSource(originalQuestion, "similar"), false);
assert.equal(matchesSource(originalQuestion, "original"), true);
assert.equal(matchesSource(officialQuestion, "original"), false);
assert.equal(matchesSource(similarQuestion, "original"), false);

for (const file of files) {
  const questions = JSON.parse(await readFile(new URL(`../data/${file}.json`, import.meta.url), "utf8"));
  for (const item of questions) {
    const matched = levels.filter(level => matchesDifficulty(item, level));
    assert.ok(matched.length > 0, `${item.id}: difficulty ${item.difficulty} cannot be selected`);
    if (item.difficulty === "易") assert.deepEqual(matched, ["基礎"], `${item.id}: 易 should map to 基礎`);
    if (item.difficulty === "中") assert.deepEqual(matched, ["中等"], `${item.id}: 中 should map to 中等`);
    if (item.difficulty === "基礎至中等") assert.deepEqual(matched, ["基礎", "中等"], `${item.id}: mixed level should match both levels`);
  }
  console.log(`${file}: 難度篩選涵蓋 ${questions.length} 題`);
}
