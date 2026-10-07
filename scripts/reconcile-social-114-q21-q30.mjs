import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const numbers = Array.from({ length: 10 }, (_, index) => index + 21);
const answers = [0, 2, 0, 3, 3, 0, 3, 1, 1, 2];
const evidence = [
  ["非世襲", "秦王朝", "郡縣制度"],
  ["日本軍隊戰敗", "臺灣光復", "八年抗戰"],
  ["1989年", "匈牙利", "奧地利", "東德", "甲"],
  ["七年級93%", "八年級95%", "九年級90%", "參與意願"],
  ["出勤紀錄", "加班", "雇主", "反證", "權力不對等"],
  ["尚無子女", "未滿6歲子女", "只有6歲以上子女", "低於", "關聯"],
  ["博斯普魯斯海峽", "黑海", "馬摩拉海", "等候"],
  ["1.33°N", "103.83°E", "新加坡", "太陽能"],
  ["2021年", "691.6毫米", "西北", "東南", "B"],
  ["碳匯", "吸收", "儲存", "友善", "土壤"]
];
const figures = new Map([
  [22, "./assets/official-exams/114-social-q22-newspaper-clipping.png"],
  [23, "./assets/official-exams/114-social-q23-europe-map.png"],
  [26, "./assets/official-exams/114-social-q26-labor-chart.png"],
  [27, "./assets/official-exams/114-social-q27-black-sea-canal-map.png"],
  [28, "./assets/official-exams/114-social-q28-singapore-map.png"],
  [29, "./assets/official-exams/114-social-q29-china-rainfall-options.png"]
]);
const sourcePages = ["./assets/official-exams/114-social-p6.webp", "./assets/official-exams/114-social-p7.webp", "./assets/official-exams/114-social-p8.webp"];

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
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official key review`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} answer citation`);
  assert.equal(item.options?.length, 4, `${id} four choices`);
  assert.ok(item.explanation?.length > 35, `${id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  assert.doesNotMatch(text, /\bcid\d+\b/i, `${id} no PDF font residue`);
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  const figure = figures.get(number);
  if (figure) {
    assert.equal(item.requiresImage, true, `${id} visual required`);
    assert.ok(item.questionImages?.includes(figure), `${id} focused figure`);
    assert.ok(serviceWorker.includes(figure), `${id} figure cached offline`);
    await access(join(root, figure.replace("./", "")));
  } else {
    assert.equal(item.requiresImage, false, `${id} text-rendered content sufficient`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant exam scan`);
  }
}

for (const page of sourcePages) {
  assert.ok(serviceWorker.includes(page), `${page} source page cached offline`);
  await access(join(root, page.replace("./", "")));
}

const ids = numbers.map(number => `OFF-${String(984 + number).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 114 Social Studies Q21–30; removed ${stale.length} superseded audit flags.`);
