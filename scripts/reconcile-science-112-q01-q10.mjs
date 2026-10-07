import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const expectedAnswers = [3, 1, 3, 2, 0, 0, 1, 2, 2, 1];
const evidence = [
  ["單一樹種", "生物多樣性", "食物網"],
  ["彎曲", "褶皺", "斷層"],
  ["鈉離子", "鉀離子", "電解質"],
  ["毛黴菌", "真菌", "葉綠體"],
  ["8/11", "8/14", "2 公尺"],
  ["水溫", "溫度計", "杯底"],
  ["綠氫", "再生能源", "風力"],
  ["胰島素", "胰島", "血糖"],
  ["聚光燈", "反射", "觀眾眼睛"],
  ["侵入原有岩層", "海水侵蝕", "先後順序"]
];
const figures = new Map([
  ["OFF-0613", "112-science-q03-sports-drink.png"],
  ["OFF-0615", "112-science-q05-tide-chart.png"],
  ["OFF-0616", "112-science-q06-heating-apparatus.png"]
]);
const flaggedIds = new Set(["OFF-0611", "OFF-0612", "OFF-0613", "OFF-0614", "OFF-0615", "OFF-0616", "OFF-0618", "OFF-0619"]);

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 1;
  const id = `OFF-${String(number + 610).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} must exist`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 112, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source number`);
  assert.equal(item.answer, expectedAnswers[index], `${id} official answer index`);
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.ok(item.explanation?.length > 35, `${id} substantive explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked solution steps`);
  assert.ok(item.teacherTip?.trim(), `${id} teacher tip`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official key verification status`);
  assert.ok(item.answerKeyReview?.note?.includes(`依112年國中教育會考官方選擇題參考答案一覽表核對：自然第${number}題官方答案${String.fromCharCode(65 + expectedAnswers[index])}`), `${id} official key provenance note`);
  const content = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  for (const clue of evidence[index]) assert.ok(content.includes(clue), `${id} evidence clue ${clue}`);
  const expectedFigure = figures.get(id);
  assert.equal(Boolean(item.requiresImage), Boolean(expectedFigure), `${id} figure dependency`);
  assert.equal(item.questionImages?.length ?? 0, expectedFigure ? 1 : 0, `${id} image count`);
  if (expectedFigure) {
    assert.ok(item.questionImages[0].endsWith(expectedFigure), `${id} focused figure binding`);
    await access(join(root, "assets", "official-exams", expectedFigure));
  } else {
    assert.equal(item.questionImage || "", "", `${id} redundant page scan`);
  }
}

for (const page of [2, 3, 4]) await access(join(root, "assets", "official-exams", `112-science-p${page}.webp`));
const matched = audit.filter(item => flaggedIds.has(item.id));
assert.equal(new Set(matched.map(item => item.id)).size, matched.length, "reviewed audit IDs must be unique");
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only a complete eight-item audit batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !flaggedIds.has(item.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled 112 Natural Science Q1–10 against original pages, official answer-key provenance, worked explanations, and figure dependencies; removed ${matched.length} verified flags.`);
