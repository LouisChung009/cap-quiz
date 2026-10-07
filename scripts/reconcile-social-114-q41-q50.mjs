import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const answers = [3, 2, 1, 0, 3, 3, 3, 2, 0, 1];
const evidence = [
  ["80.9%", "94.6%", "62.1%", "2020年缺乏颱風"],
  ["200件", "180件", "230件", "150件", "至少91件", "最多74件"],
  ["墨西哥首都", "六十萬件", "阿茲提克"],
  ["風、火、水、土", "原產美洲", "玉米"],
  ["今日當地的官方語文", "西班牙文"],
  ["數字4", "I、O", "政府施政受社會規範影響"],
  ["6666", "生日或紀念日", "不同人對同一誘因"],
  ["指定位置", "行政救濟", "行政裁罰"],
  ["伊朗高原", "薩珊王朝", "祆教"],
  ["十九世紀上半葉", "鴉片", "白銀"]
];
const figures = new Map([
  [43, "./assets/official-exams/114-social-q43-artifacts.svg"],
  [44, "./assets/official-exams/114-social-q44-god-statue.svg"],
  [51, "./assets/official-exams/114-social-q51-tombstone.svg"],
  [53, "./assets/official-exams/114-social-q53-iceberg-map.svg"]
]);
const sourcePages = [
  "./assets/official-exams/114-social-p11.webp",
  "./assets/official-exams/114-social-p12.webp",
  "./assets/official-exams/114-social-p13.webp",
  "./assets/official-exams/114-social-p14.webp"
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < answers.length; index += 1) {
  const number = index + 41;
  const id = `OFF-${String(984 + number).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 114, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source question number`);
  assert.equal(item.answer, answers[index], `${id} official answer`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official answer review`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + answers[index])}`));
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.ok(item.explanation?.length > 35, `${id} worked explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);

  const figure = figures.get(number);
  if (figure) {
    assert.equal(item.requiresImage, true, `${id} required figure`);
    assert.ok(item.questionImages?.includes(figure), `${id} focused figure path`);
    assert.ok(serviceWorker.includes(figure), `${id} offline figure cache`);
    await access(join(root, figure.replace("./", "")));
  } else {
    assert.equal(item.requiresImage, false, `${id} text is self-contained`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant exam scan`);
  }
}

for (const number of [43, 44, 45]) {
  const item = questions.find(question => question.source?.year === 114 && question.subject === "社會" && question.source.questionNumber === number);
  assert.ok(item.question.includes("國立人類學博物館") && item.question.includes("墨西哥"), `Q${number} complete shared passage`);
}
for (const number of [46, 47, 48]) {
  const item = questions.find(question => question.source?.year === 114 && question.subject === "社會" && question.source.questionNumber === number);
  assert.ok(item.question.includes("【閱讀材料】") && item.question.includes("BAD、BUM、END"), `Q${number} complete shared passage`);
}
for (const number of [49, 50]) {
  const item = questions.find(question => question.source?.year === 114 && question.subject === "社會" && question.source.questionNumber === number);
  assert.ok(item.question.includes("伊朗高原") && item.question.includes("蘇伊士運河"), `Q${number} complete shared passage`);
}
for (const page of sourcePages) {
  assert.ok(serviceWorker.includes(page), `${page} original paper page cached offline`);
  await access(join(root, page.replace("./", "")));
}

const ids = Array.from({ length: 10 }, (_, index) => `OFF-${String(1025 + index).padStart(4, "0")}`);
const superseded = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(superseded.filter(item => item.id === id).length <= 1, `${id} audit uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 114 Social Studies Q41–50 against official answer keys, source material, focused figures and offline cache; removed ${superseded.length} superseded flags.`);
