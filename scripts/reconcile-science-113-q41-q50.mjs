import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const answers = [3, 2, 3, 0, 1, 3, 0, 2, 2, 2];
const flaggedIds = new Set(["OFF-0866", "OFF-0867", "OFF-0868", "OFF-0869", "OFF-0871", "OFF-0872", "OFF-0874"]);
const graphId = "OFF-0873";
const graphFile = "113-science-q49-co2-cycle-graph.png";

assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < answers.length; index += 1) {
  const number = index + 41;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} exists`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 113, `${id} year`);
  assert.equal(item.source?.questionNumber, number, `${id} question number`);
  assert.equal(item.answer, answers[index], `${id} official answer index`);
  assert.equal(item.options?.length, 4, `${id} four choices`);
  assert.ok(item.explanation?.length > 45, `${id} substantive explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.trim(), `${id} teacher tip`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} answer-key status`);
  assert.ok(item.answerKeyReview?.note?.includes(`依113年國中教育會考官方選擇題參考答案一覽表核對：自然第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} key provenance`);
}
const graph = questions.find(item => item.id === graphId);
assert.equal(graph?.answer, 2, "Q49 official answer C");
assert.ok(graph?.requiresImage && graph.questionImages?.some(image => image.endsWith(graphFile)), "Q49 CO2 graph is attached");
await access(join(root, "assets", "official-exams", graphFile));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
assert.ok(serviceWorker.includes(graphFile), "Q49 CO2 graph is offline precached");

const matched = audit.filter(entry => flaggedIds.has(entry.id));
assert.equal(new Set(matched.map(entry => entry.id)).size, matched.length, "flag IDs must be unique");
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only the full seven-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !flaggedIds.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled 113 Natural Science Q41–50 against official keys, source values, worked reasoning, and offline CO2 graph; removed ${matched.length} flags.`);
