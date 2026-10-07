import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const answerKeys = [1, 1, 2, 2, 0, 2, 0, 2, 0, 3];
const requiredFigures = new Map([
  [3, "113-science-q03-weekly-temperature-chart.png"],
  [6, "113-science-q06-wire-repair.svg"],
  [8, "113-science-q08-earth-sun-diagrams.svg"],
  [9, "113-science-q09-cell-osmosis.png"],
  [10, "113-science-q10-ocean-floor-age-options.png"]
]);
const flaggedIds = new Set(["OFF-0825", "OFF-0826", "OFF-0827", "OFF-0829", "OFF-0830", "OFF-0831", "OFF-0832", "OFF-0833", "OFF-0834"]);
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");

assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < answerKeys.length; index += 1) {
  const number = index + 1;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} exists`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} official question number`);
  assert.equal(item.answer, answerKeys[index], `${id} official key`);
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.ok(item.explanation?.length > 45, `${id} worked explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.trim(), `${id} teacher tip`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} answer-key provenance`);
  const figure = requiredFigures.get(number);
  assert.equal(Boolean(item.requiresImage), Boolean(figure), `${id} figure necessity`);
  if (figure) {
    const assetPath = `./assets/official-exams/${figure}`;
    assert.ok(item.questionImages?.some(image => image.endsWith(figure)), `${id} focused figure binding`);
    await access(join(root, "assets", "official-exams", figure));
    assert.ok(serviceWorker.includes(assetPath), `${id} figure offline cache`);
  } else assert.ok(!item.questionImages?.length && !item.questionImage, `${id} no unnecessary scan`);
  await access(join(root, "assets", "official-exams", `113-science-p${number <= 4 ? 2 : 3}.webp`));
}

const q4 = questions.find(item => item.id === "OFF-0828");
assert.ok(["氟（F）｜9｜17｜19.0", "氯（Cl）｜17｜17｜35.5", "溴（Br）｜35｜17｜79.9"].every(value => q4.question.includes(value)), "Q4 source table transcribed completely");
assert.ok(q4.solutionSteps.some(step => step.includes("自然界元素豐度")), "Q4 explanation uses the provided evidence");
const matched = audit.filter(entry => flaggedIds.has(entry.id));
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only the complete nine-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !flaggedIds.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled official 113 Natural Science Q1–10 against source pages, keys, worked solutions, and required offline figures; removed ${matched.length} flags.`);
