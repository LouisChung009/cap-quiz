import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const expectedAnswers = [2, 1, 2, 3, 2, 2, 0, 2, 3, 0];
const figures = new Map([
  [15, ["113-social-q15-land-use.svg", "113-social-p5.webp"]],
  [16, ["113-social-q16-life-expectancy.svg", "113-social-p5.webp"]],
  [17, ["113-social-q17-japan-map.svg", "113-social-p5.webp"]],
  [18, ["113-social-q18-railway-map.svg", "113-social-p5.webp"]],
  [20, ["113-social-q20-cosmology.svg", "113-social-p6.webp"]]
]);
const evidence = [
  ["國家發行", "預先儲值", "法定貨幣"],
  ["釋字第 748 號", "平等權", "位階高於"],
  ["限制行為能力人", "法定代理人同意", "保護"],
  ["冷凍山竹", "新鮮山竹", "更多元"],
  ["1904", "1976", "1985"],
  ["漠南非洲", "50 歲", "64 歲"],
  ["冬季季風", "日本海", "迎風坡"],
  ["塔里木盆地", "乾燥", "固沙"],
  ["古巴飛彈危機", "蘇聯", "美國"],
  ["中世紀", "地心說", "地球"]
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 11;
  const id = `OFF-${String(770 + number).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} original number`);
  assert.equal(item.answer, expectedAnswers[index], `${id} official answer index`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official key review`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + expectedAnswers[index])}`), `${id} official key citation`);
  assert.equal(item.options?.length, 4, `${id} option count`);
  assert.ok(item.explanation?.length > 30, `${id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  assert.doesNotMatch(text, /\bcid\d+\b/i, `${id} PDF font residue`);
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  const figure = figures.get(number);
  if (figure) {
    const [figureName, sourcePage] = figure;
    const figurePath = `./assets/official-exams/${figureName}`;
    const sourcePagePath = `./assets/official-exams/${sourcePage}`;
    assert.equal(item.requiresImage, true, `${id} required visual`);
    assert.ok(item.questionImages?.includes(figurePath), `${id} focused figure`);
    const svg = await readFile(join(root, "assets", "official-exams", figureName), "utf8");
    assert.ok(svg.includes(`href="${sourcePage}"`), `${id} original page reference`);
    assert.ok(serviceWorker.includes(figurePath), `${id} offline figure cache`);
    assert.ok(serviceWorker.includes(sourcePagePath), `${id} offline source-page cache`);
    await access(join(root, "assets", "official-exams", figureName));
    await access(join(root, "assets", "official-exams", sourcePage));
  } else {
    assert.equal(item.requiresImage, false, `${id} self-contained text item`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant exam scan`);
  }
}

const ids = expectedAnswers.map((_, index) => `OFF-${String(781 + index).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit flag uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified 113 Social Studies Q11–20; removed ${stale.length} superseded audit flags.`);
