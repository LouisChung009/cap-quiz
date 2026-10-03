import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { matchesDifficulty } from "../question-validation.js";

const files = ["chinese", "english", "math", "science", "social"];
const levels = ["基礎", "中等", "進階"];

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
