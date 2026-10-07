import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const numbers = Array.from({ length: 10 }, (_, index) => index + 31);
const answers = [0, 1, 3, 2, 1, 0, 2, 0, 0, 3];
const evidence = [
  ["高砂義勇隊", "南洋作戰", "皇民化"],
  ["理加頭目", "荷蘭", "江戶幕府", "大員"],
  ["1946年", "60,696", "1950年", "1960年", "中國大陸"],
  ["曾任法官", "立法委員", "同意權", "司法院院長"],
  ["強徵數百萬人", "公聽會", "議會", "制衡"],
  ["檢察官", "被告", "辯護律師", "法官", "起訴"],
  ["社會企業", "公平貿易", "小農", "商業交易"],
  ["監護宣告", "無行為能力人", "財產", "限制行為能力人"],
  ["日幣", "菲律賓披索", "約10%", "相對日幣升值"],
  ["加里寧格勒", "波羅的海", "立陶宛", "北約", "軍事"]
];
const figure = "./assets/official-exams/114-social-q40-kaliningrad-map.png";
const sourcePages = ["./assets/official-exams/114-social-p9.webp", "./assets/official-exams/114-social-p10.webp", "./assets/official-exams/114-social-p11.webp"];

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
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official key status`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} official answer citation`);
  assert.equal(item.options?.length, 4, `${id} four choices`);
  assert.ok(item.explanation?.length > 35, `${id} worked explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  assert.doesNotMatch(text, /\bcid\d+\b/i, `${id} no PDF font residue`);
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  if (number === 40) {
    assert.equal(item.requiresImage, true, `${id} map required`);
    assert.ok(item.questionImages?.includes(figure), `${id} focused map`);
    assert.ok(serviceWorker.includes(figure), `${id} offline map`);
    await access(join(root, figure.replace("./", "")));
  } else {
    assert.equal(item.requiresImage, false, `${id} text-transcribed source is sufficient`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant exam scan`);
  }
}

for (const page of sourcePages) {
  assert.ok(serviceWorker.includes(page), `${page} original exam page cached offline`);
  await access(join(root, page.replace("./", "")));
}

const ids = numbers.map(number => `OFF-${String(984 + number).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 114 Social Studies Q31–40; removed ${stale.length} superseded audit flags.`);
