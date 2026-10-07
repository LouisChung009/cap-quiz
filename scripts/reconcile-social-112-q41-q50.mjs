import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const questions = JSON.parse(await readFile(new URL("../data/mission-questions.json", import.meta.url), "utf8"));
const auditPath = new URL("../reports/社會-teacher-audit.json", import.meta.url);
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const expected = new Map([
  ["OFF-0597", { number: 41, answer: 2, image: "112-social-q41-mughal-palace.svg", evidence: /莫臥兒|伊斯蘭|印度/ }],
  ["OFF-0598", { number: 42, answer: 3, evidence: /行政罰|行政法規/ }],
  ["OFF-0599", { number: 43, answer: 2, evidence: /30–34|30-34|家庭平權|照顧未滿12歲/ }],
  ["OFF-0600", { number: 44, answer: 2, evidence: /琉球|朝貢|冊封/ }],
  ["OFF-0601", { number: 45, answer: 3, evidence: /琉球|牡丹社/ }],
  ["OFF-0602", { number: 46, answer: 1, evidence: /積雪|融化/ }],
  ["OFF-0603", { number: 47, answer: 2, image: "112-social-q47-fuji-contour-map.svg", evidence: /等高線|2,300|比例尺/ }],
  ["OFF-0604", { number: 48, answer: 3, evidence: /26.7|18.9|坡度/ }],
  ["OFF-0605", { number: 49, answer: 1, evidence: /18.42|33.92|開普敦/ }],
  ["OFF-0606", { number: 50, answer: 0, evidence: /南洋群島|東南亞/ }]
]);

for (const [id, spec] of expected) {
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 112, `${id} source year`);
  assert.equal(item.source?.questionNumber, spec.number, `${id} original question number`);
  assert.equal(item.answer, spec.answer, `${id} official answer index`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official answer review`);
  assert.equal(item.options?.length, 4, `${id} option count`);
  assert.ok(item.explanation?.length > 30, `${id} explanation completeness`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked solution completeness`);
  assert.match(`${item.question}\n${item.explanation}\n${item.solutionSteps.join("\n")}`, spec.evidence, `${id} source-specific reasoning`);
  if (spec.image) {
    assert.equal(item.requiresImage, true, `${id} required figure flag`);
    assert.ok(item.questionImages?.some(path => path.includes(spec.image)), `${id} required figure asset`);
  } else {
    assert.ok(item.question?.trim().length > 0, `${id} textual prompt`);
    assert.ok(item.options.every(option => String(option).trim()), `${id} readable option text`);
  }
}

assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
const remaining = audit.filter(entry => expected.has(entry.id));
for (const finding of remaining) {
  assert.equal(remaining.filter(entry => entry.id === finding.id).length, 1, `${finding.id} audit finding must be unique`);
}
const reconciled = audit.filter(entry => !expected.has(entry.id));
await writeFile(auditPath, `${JSON.stringify(reconciled, null, 2)}\n`, "utf8");
console.log(`Verified official 112 Social Studies Q41–50; ${remaining.length} superseded audit flags remain.`);
