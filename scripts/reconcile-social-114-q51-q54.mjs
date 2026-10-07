import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const answers = [3, 2, 1, 3];
const evidence = [
  ["西元1850年", "伊嗣俟紀元1219年", "薩珊王朝", "耶茲德格德三世"],
  ["1927年", "阿根廷", "南大西洋"],
  ["2017", "2019", "2020", "60°W", "40°W", "東北"],
  ["海豹", "企鵝", "海岸", "動物棲地"]
];
const figures = new Map([
  [51, "./assets/official-exams/114-social-q51-tombstone.svg"],
  [53, "./assets/official-exams/114-social-q53-iceberg-map.svg"]
]);
const sourcePages = ["./assets/official-exams/114-social-p14.webp", "./assets/official-exams/114-social-p15.webp"];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < answers.length; index += 1) {
  const number = index + 51;
  const id = `OFF-${String(984 + number).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 114, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source number`);
  assert.equal(item.answer, answers[index], `${id} official answer`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} answer review`);
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
    assert.ok(item.questionImages?.includes(figure), `${id} focused figure reference`);
    assert.ok(serviceWorker.includes(figure), `${id} offline figure precache`);
    await access(join(root, figure.replace("./", "")));
  } else {
    assert.equal(item.requiresImage, false, `${id} self-contained text means no map required`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant full-page scan`);
  }
}

const q51 = questions.find(question => question.id === "OFF-1035");
assert.match(await readFile(join(root, "assets/official-exams/114-social-q51-tombstone.svg"), "utf8"), /viewBox="565 245 205 150"/);
assert.match(await readFile(join(root, "assets/official-exams/114-social-q51-tombstone.svg"), "utf8"), /114-social-p14\.webp/);
assert.match(q51.imageAlt, /墓碑/);
for (const number of [52, 53, 54]) {
  const item = questions.find(question => question.source?.year === 114 && question.subject === "社會" && question.source.questionNumber === number);
  assert.ok(item.question.includes("【閱讀材料】南喬治亞島") && item.question.includes("1927年") && item.question.includes("2017年"), `Q${number} complete shared South Georgia context`);
}
for (const page of sourcePages) {
  assert.ok(serviceWorker.includes(page), `${page} source page cached offline`);
  await access(join(root, page.replace("./", "")));
}

const ids = Array.from({ length: 4 }, (_, index) => `OFF-${String(1035 + index).padStart(4, "0")}`);
const superseded = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(superseded.filter(item => item.id === id).length <= 1, `${id} audit uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 114 Social Studies Q51–54, including the focused Q51 tombstone and Q53 map; removed ${superseded.length} superseded audit flags.`);
