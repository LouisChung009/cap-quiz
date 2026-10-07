import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const numbers = Array.from({ length: 10 }, (_, index) => index + 11);
const answers = [2, 3, 3, 2, 2, 2, 0, 1, 3, 2];
const evidence = [
  ["英文招牌", "當地文字", "當地料理", "在地調適"],
  ["2022年6月21日", "新疆", "強迫勞動", "人權"],
  ["更多廠商", "競爭者", "市場競爭"],
  ["姊妹", "配偶", "旁系血親", "直系血親"],
  ["正面報導", "負面報導", "36%", "28%", "21%", "19:00"],
  ["西部陸海新通道", "北部灣港", "東南亞", "中國西部"],
  ["上游水壩", "洩洪", "等高線", "河道", "甲"],
  ["甲地", "乙地", "美國", "墨西哥", "跨境"],
  ["2022年", "人口金字塔", "年輕人口", "漠南非洲"],
  ["陶製", "糖漏", "製糖", "西南部", "丙"]
];
const figures = new Map([
  [14, "./assets/official-exams/114-social-q14-family-diagram.png"],
  [16, "./assets/official-exams/114-social-q16-western-route-map.png"],
  [17, "./assets/official-exams/114-social-q17-contour-map.png"],
  [19, "./assets/official-exams/114-social-q19-population-pyramids.png"],
  [20, ["./assets/official-exams/114-social-q20-sugar-tool.png", "./assets/official-exams/114-social-q20-taiwan-map.png"]]
]);
const sourcePages = ["./assets/official-exams/114-social-p4.webp", "./assets/official-exams/114-social-p5.webp", "./assets/official-exams/114-social-p6.webp"];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < numbers.length; index += 1) {
  const number = numbers[index];
  const id = `OFF-${String(984 + number).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 114, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} question number`);
  assert.equal(item.answer, answers[index], `${id} official answer`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official answer review`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} answer citation`);
  assert.equal(item.options?.length, 4, `${id} four choices`);
  assert.ok(item.explanation?.length > 35, `${id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked solution`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  assert.doesNotMatch(text, /\bcid\d+\b/i, `${id} no PDF font residue`);
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  const requiredFigures = figures.get(number);
  if (requiredFigures) {
    assert.equal(item.requiresImage, true, `${id} required figure`);
    for (const figure of Array.isArray(requiredFigures) ? requiredFigures : [requiredFigures]) {
      assert.ok(item.questionImages?.includes(figure), `${id} figure ${figure}`);
      assert.ok(serviceWorker.includes(figure), `${id} offline figure ${figure}`);
      await access(join(root, figure.replace("./", "")));
    }
  } else {
    assert.equal(item.requiresImage, false, `${id} text/table sufficient`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant full-page scan`);
  }
}

for (const page of sourcePages) {
  assert.ok(serviceWorker.includes(page), `${page} original source page cached offline`);
  await access(join(root, page.replace("./", "")));
}

const ids = numbers.map(number => `OFF-${String(984 + number).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 114 Social Studies Q11–20; removed ${stale.length} superseded audit flags.`);
