import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const expectedAnswers = [2, 1, 0, 0, 3, 0, 1, 0, 3, 1];
const evidence = [
  ["頻率", "可聽範圍", "波速"],
  ["密度", "天平", "排水"],
  ["巢位", "食物", "掠食"],
  ["N₂O", "硫原子", "氮原子", "氧原子"],
  ["乙側", "暖空氣", "甲", "冷空氣"],
  ["地下水", "水壓", "壓密", "地層下陷"],
  ["聖誕節", "只改變", "端午節"],
  ["葉綠素", "光合作用", "O₂"],
  ["F左＝1 N", "F右＝1 N", "F′右＝F右"],
  ["2 m", "1 m", "庫侖", "變大", "變小"]
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 1;
  const item = questions.find(question => question.subject === "自然" && question.source?.year === 114 && question.source.questionNumber === number);
  assert.ok(item, `missing official 114 Science Q${number}`);
  assert.equal(item.id, `OFF-${String(1038 + number).padStart(4, "0")}`, `Q${number} ID`);
  assert.equal(item.answer, expectedAnswers[index], `Q${number} official answer index`);
  assert.equal(item.options?.length, 4, `Q${number} four options`);
  assert.ok(item.explanation?.length > 35, `Q${number} worked explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `Q${number} solution steps`);
  assert.ok(item.teacherTip?.length > 10, `Q${number} science teaching tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `Q${number} source/evidence clue: ${clue}`);
  assert.equal(item.requiresImage, false, `Q${number} should not require an omitted figure`);
  assert.equal(item.questionImage || "", "", `Q${number} should not embed a redundant full-page scan`);
  assert.equal((item.questionImages || []).length, 0, `Q${number} should not have redundant scans`);
  assert.ok(item.answerKeyReview?.status === "verified" || item.answerKeyReview?.status?.startsWith("已依114年官方自然科第"), `Q${number} official key status`);
}

for (const page of [2, 3, 4]) await access(join(root, "assets", "official-exams", `114-science-p${page}.webp`));
const supersededIds = new Set(expectedAnswers.map((_, index) => `OFF-${String(1039 + index).padStart(4, "0")}`));
const matched = audit.filter(item => supersededIds.has(item.id));
assert.equal(new Set(matched.map(item => item.id)).size, matched.length, "matching audit IDs must be unique");
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !supersededIds.has(item.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 114 Science Q1–10 against source pages and answer review; removed ${matched.length} superseded flags.`);
