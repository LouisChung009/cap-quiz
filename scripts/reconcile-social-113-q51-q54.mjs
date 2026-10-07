import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const numbers = [51, 52, 53, 54];
const answers = [1, 3, 1, 2];
const storyEvidence = [
  ["每個點代表 1,000 人", "人口遠多於宜蘭縣", "屏東席次多於臺東", "彰化不是席次最少", "臺南也不是席次最多"],
  ["1950 年代", "反共政策", "官方審查", "二二八事件", "1980 年代", "武俠", "抗日愛國"],
  ["自然、寫實", "鄉土文學", "農民", "勞工", "南進政策宣傳", "美國流行文化"],
  ["刪改電影內容", "言論、出版自由", "公職或參政資格", "入境審查", "血腥暴力影像出版"]
];
const passageAnchors = [
  ["《美國憲法》", "435席", "臺北市選出8人", "雲林縣選出2人"],
  ["反共抗俄", "健康寫實", "臺灣新電影", "削蘋果事件", "《兒子的大玩偶》"],
  ["反共抗俄", "健康寫實", "臺灣新電影", "削蘋果事件", "《兒子的大玩偶》"],
  ["反共抗俄", "健康寫實", "臺灣新電影", "削蘋果事件", "《兒子的大玩偶》"]
];
const map = "./assets/official-exams/113-social-q51-taiwan-population-map.svg";
const sourcePages = ["./assets/official-exams/113-social-p14.webp", "./assets/official-exams/113-social-p15.webp"];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < numbers.length; index += 1) {
  const number = numbers[index];
  const id = `OFF-${String(770 + number).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} original question number`);
  assert.equal(item.answer, answers[index], `${id} official key`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} answer-key status`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} official key citation`);
  assert.equal(item.options?.length, 4, `${id} four choices`);
  assert.ok(item.explanation?.length > 40, `${id} evidence-based explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  assert.doesNotMatch(text, /\bcid\d+\b/i, `${id} no PDF font residue`);
  for (const clue of storyEvidence[index]) assert.ok(text.includes(clue), `${id} reasoning evidence: ${clue}`);
  for (const clue of passageAnchors[index]) assert.ok(item.question.includes(clue), `${id} displayed passage: ${clue}`);
  if (number === 51) {
    assert.equal(item.requiresImage, true, `${id} map is required`);
    assert.ok(item.questionImages?.includes(map), `${id} focused map asset`);
    const svg = await readFile(join(root, "assets", "official-exams", "113-social-q51-taiwan-population-map.svg"), "utf8");
    assert.ok(svg.includes('href="113-social-p14.webp"'), `${id} original source page`);
    assert.ok(serviceWorker.includes(map), `${id} map cached offline`);
  } else {
    assert.equal(item.requiresImage, false, `${id} self-contained reading question`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant exam scan`);
  }
}

for (const page of sourcePages) {
  assert.ok(serviceWorker.includes(page), `${page} cached offline`);
  await access(join(root, "assets", "official-exams", page.replace("./assets/official-exams/", "")));
}

const ids = numbers.map(number => `OFF-${String(770 + number).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit flag uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 113 Social Studies Q51–54; removed ${stale.length} superseded audit flags.`);
