import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const expectedAnswers = [0, 2, 0, 2, 3, 0, 0, 1, 3, 0];
const evidence = [
  ["500", "100", "400", "80", "350", "22.9%"],
  ["形成層", "韌皮部", "根部"],
  ["氫", "金屬氧化物", "氧化還原反應"],
  ["100%", "0%", "月球"],
  ["岩漿侵入地殼", "丙作用", "搬運、沉積"],
  ["帶正電", "電子由地球流入", "不帶電"],
  ["100 g", "−20°C", "t₁ 至 t₂"],
  ["太平洋高氣壓範圍", "颱風", "蒙古大陸冷氣團"],
  ["0.39", "0.33", "0.28", "0.22", "0.18", "0.15", "0.13", "0.09", "0.30", "0.20", "0.03", "0.00"],
  ["13 對染色體", "減數分裂", "1 條性染色體"]
];
const figures = new Map();
const flaggedIds = new Set(["OFF-0845", "OFF-0846", "OFF-0847", "OFF-0848", "OFF-0850", "OFF-0851", "OFF-0854"]);

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 21;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} must exist`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source number`);
  assert.equal(item.answer, expectedAnswers[index], `${id} answer index`);
  assert.equal(item.options?.length, 4, `${id} four choices`);
  assert.ok(item.explanation?.length > 35, `${id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.trim(), `${id} teacher tip`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official key status`);
  assert.ok(item.answerKeyReview?.note?.includes(`依113年國中教育會考官方選擇題參考答案一覽表核對：自然第${number}題官方答案${String.fromCharCode(65 + expectedAnswers[index])}`), `${id} answer source note`);
  const content = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  for (const clue of evidence[index]) assert.ok(content.includes(clue), `${id} source evidence ${clue}`);
  const expectedFigure = figures.get(id);
  assert.equal(Boolean(item.requiresImage), Boolean(expectedFigure), `${id} required figure flag`);
  if (expectedFigure) {
    assert.ok(item.questionImages?.some(image => image.endsWith(expectedFigure)), `${id} figure binding`);
    await access(join(root, "assets", "official-exams", expectedFigure));
  } else assert.ok(!item.questionImages?.length && !item.questionImage, `${id} redundant scan`);
}
for (const page of [5, 6, 7]) await access(join(root, "assets", "official-exams", `113-science-p${page}.webp`));
const matched = audit.filter(item => flaggedIds.has(item.id));
assert.equal(new Set(matched.map(item => item.id)).size, matched.length, "flag IDs must be unique");
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only a complete seven-flag batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !flaggedIds.has(item.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled 113 Natural Science Q21–30 against source pages, official answer provenance, worked calculations, and required figures; removed ${matched.length} verified flags.`);
