import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { matchesDifficulty, matchesSource } from "../question-validation.js";

const files = ["chinese", "english", "math", "science", "social"];
const levels = ["基礎", "中等", "進階"];
const reviewedDifficulty = new Map([["ENG-0067", "基礎"], ["ENG-0034", "中等"], ["SCI-0014", "中等"], ["CHI-0058", "中等"], ["CHI-0106", "中等"], ["CHI-0349", "中等"], ["ENG-0452", "基礎"], ["ENG-0554", "基礎"], ["ENG-0897", "中等"], ["SCI-0134", "中等"], ["SCI-0145", "中等"], ["SCI-0190", "基礎"], ["SOC-0080", "基礎"], ["SOC-0874", "中等"]]);
const reviewedQuestionText = new Map([["ENG-0592", question => !question.includes("Still,")], ["MAT-0757", question => question.includes("答案以 π 表示") && !question.includes("約為幾公升")], ["SOC-0874", question => question.includes("聚合型板塊邊界") && question.includes("隱沒至另一側")]]);

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
    if (reviewedDifficulty.has(item.id)) assert.equal(item.difficulty, reviewedDifficulty.get(item.id), `${item.id}: reviewed difficulty calibration regression`);
    if (reviewedQuestionText.has(item.id)) assert.ok(reviewedQuestionText.get(item.id)(item.question), `${item.id}: reviewed wording regression`);
    const matched = levels.filter(level => matchesDifficulty(item, level));
    assert.ok(matched.length > 0, `${item.id}: difficulty ${item.difficulty} cannot be selected`);
    if (item.difficulty === "易") assert.deepEqual(matched, ["基礎"], `${item.id}: 易 should map to 基礎`);
    if (item.difficulty === "中") assert.deepEqual(matched, ["中等"], `${item.id}: 中 should map to 中等`);
    if (item.difficulty === "基礎至中等") assert.deepEqual(matched, ["基礎", "中等"], `${item.id}: mixed level should match both levels`);
  }
  console.log(`${file}: 難度篩選涵蓋 ${questions.length} 題`);
}
