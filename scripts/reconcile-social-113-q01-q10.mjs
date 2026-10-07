import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const expectedAnswers = [1, 0, 1, 0, 1, 2, 3, 2, 0, 2];
const imageFiles = new Map([
  [3, "113-social-q03-map.svg"],
  [4, "113-social-q04-language-chart.svg"]
]);
const pageImage = "./assets/official-exams/113-social-p3.webp";
const ids = expectedAnswers.map((_, index) => `OFF-${String(771 + index).padStart(4, "0")}`);
const evidence = [
  ["格外品", "品質無虞", "盛產"],
  ["維謝格拉德", "20%", "德國"],
  ["營盤腳", "西北", "上營盤"],
  ["23種", "第五", "主要分布"],
  ["七十二庄", "漳州人", "客家人"],
  ["慈禧太后", "民間組織", "北京"],
  ["巴比倫", "兩河流域", "楔形文字"],
  ["甲午戰爭", "九一八事變", "太平洋戰爭"],
  ["十七世紀", "土地", "稻米"],
  ["兒童及少年", "吸菸", "飲酒"]
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 1;
  const id = ids[index];
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} original number`);
  assert.equal(item.answer, expectedAnswers[index], `${id} official answer index`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} source key review`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + expectedAnswers[index])}`), `${id} official key citation`);
  assert.equal(item.options?.length, 4, `${id} option count`);
  assert.ok(item.explanation?.length > 30, `${id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  const text = `${item.question}\n${item.explanation}\n${item.solutionSteps.join("\n")}`;
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  const expectedImage = imageFiles.get(number);
  if (expectedImage) {
    assert.equal(item.requiresImage, true, `${id} required visual`);
    assert.ok(item.questionImages?.some(path => path.includes(expectedImage)), `${id} source-matched figure`);
    await access(join(root, "assets", "official-exams", expectedImage));
    assert.ok(serviceWorker.includes(expectedImage), `${id} offline figure cache`);
  } else if (number === 7) {
    assert.equal(item.requiresImage, true, `${id} visual script options`);
    assert.equal(item.questionImage, pageImage, `${id} source page`);
    assert.ok(item.questionImages?.includes(pageImage), `${id} question image list`);
    assert.deepEqual(item.imageCrop, { sourceWidth: 869, sourceHeight: 1199, x: 96, y: 456, width: 542, height: 112 }, `${id} visual-choice crop`);
    const appSource = await readFile(join(root, "app.js"), "utf8");
    const styleSource = await readFile(join(root, "styles.css"), "utf8");
    assert.ok(appSource.includes("index===0?item.imageCrop:null") && appSource.includes("function renderQuestionImage"), `${id} crop data flow`);
    assert.ok(styleSource.includes(".question-image-crop") && styleSource.includes("--crop-top"), `${id} crop display styling`);
    assert.ok(serviceWorker.includes(pageImage), `${id} offline source page`);
    await access(join(root, "assets", "official-exams", "113-social-p3.webp"));
  } else {
    assert.equal(item.requiresImage, false, `${id} text-complete item`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant exam scan`);
  }
}

const stale = audit.filter(item => ids.includes(item.id));
for (const finding of stale) assert.equal(stale.filter(item => item.id === finding.id).length, 1, `${finding.id} audit uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified 113 Social Studies Q1–10; removed ${stale.length} superseded audit flags.`);
