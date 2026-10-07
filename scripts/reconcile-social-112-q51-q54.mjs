import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const questions = JSON.parse(await readFile(new URL("../data/mission-questions.json", import.meta.url), "utf8"));
const auditPath = new URL("../reports/社會-teacher-audit.json", import.meta.url);
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const expected = [
  { id: "OFF-0607", number: 51, answer: 0, clues: ["蘇伊士運河", "好望角", "1869"] },
  { id: "OFF-0608", number: 52, answer: 3, clues: ["不打小孩日", "臺灣", "全球化"] },
  { id: "OFF-0609", number: 53, answer: 1, clues: ["不要打小孩", "家長", "價值觀"] },
  { id: "OFF-0610", number: 54, answer: 2, clues: ["兒童及少年福利與權益保障法", "教育基本法", "總統公布"] }
];

for (const spec of expected) {
  const item = questions.find(question => question.id === spec.id);
  assert.ok(item, `missing ${spec.id}`);
  assert.equal(item.subject, "社會", `${spec.id} subject`);
  assert.equal(item.source?.year, 112, `${spec.id} source year`);
  assert.equal(item.source?.questionNumber, spec.number, `${spec.id} question number`);
  assert.equal(item.answer, spec.answer, `${spec.id} official answer index`);
  assert.equal(item.answerKeyReview?.status, "verified", `${spec.id} official answer review`);
  assert.equal(item.options?.length, 4, `${spec.id} option count`);
  assert.ok(item.question?.includes("【閱讀材料】"), `${spec.id} complete shared passage`);
  assert.ok(item.explanation?.length > 30, `${spec.id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${spec.id} worked steps`);
  const content = `${item.question}\n${item.explanation}\n${item.solutionSteps.join("\n")}`;
  for (const clue of spec.clues) assert.ok(content.includes(clue), `${spec.id} source evidence: ${clue}`);
  assert.equal(item.requiresImage, false, `${spec.id} should use fully transcribed text, not redundant page scans`);
  assert.equal((item.questionImages || []).length, 0, `${spec.id} should not attach redundant page scans`);
}

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
const stale = audit.filter(item => expected.some(spec => spec.id === item.id));
for (const finding of stale) assert.equal(stale.filter(item => item.id === finding.id).length, 1, `${finding.id} audit finding must be unique`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !expected.some(spec => spec.id === item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 112 Social Studies Q51–54; ${stale.length} superseded audit flags removed.`);
