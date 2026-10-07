import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const expectedAnswers = [1, 2, 1, 0, 1, 2, 0, 1, 0, 2];
const figures = new Map([
  [22, ["113-social-q22-buddhism-origin.svg", "113-social-p6.webp"]],
  [26, ["113-social-q26-shimen-catchment.svg", "113-social-p8.webp"]],
  [28, ["113-social-q28-land-subsidence.svg", "113-social-p8.webp"]],
  [29, ["113-social-q29-australia-sites.svg", "113-social-p8.webp"]]
]);
const evidence = [
  ["十四世紀", "波斯", "馬尼拉", "瓷器"],
  ["柬埔寨", "古印度", "印度次大陸", "丙"],
  ["71.4%", "99.2%", "性別分工"],
  ["減速", "電子收費", "交通運輸效率"],
  ["旁系血親", "花蓮", "市民代表"],
  ["石門水庫", "復興區", "集水區"],
  ["製鞋", "勞力", "工資較低"],
  ["地層下陷", "高鐵沿線", "省水作物"],
  ["夏雨冬乾", "甲", "季節分配"],
  ["女性參政", "共和", "男女平權"]
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 21;
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
  const text = `${item.question}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip || ""}`;
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

const ids = expectedAnswers.map((_, index) => `OFF-${String(791 + index).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit flag uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified 113 Social Studies Q21–30; removed ${stale.length} superseded audit flags.`);
