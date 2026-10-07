import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const expectedAnswers = [0, 3, 0, 2, 0, 1, 3, 2, 0, 3];
const evidence = [
  ["11 月 11 日", "第一次世界大戰", "殖民地", "澳洲"],
  ["恆河", "沙洲島", "大量堆積物"],
  ["1896–1905", "13,440", "打狗港", "糖業"],
  ["巫童", "遭遺棄", "志願團體", "社會規範"],
  ["巫童", "生命", "基本人權"],
  ["價格較低廉", "不須駕照", "機會成本"],
  ["《道路交通管理處罰條例》", "立法院", "法律案"],
  ["2022年11月30日", "2024年11月29日", "行政處罰"],
  ["435席", "南部", "東北部"],
  ["2020年", "地形崎嶇", "工業就業機會少", "殖民地式經濟"]
];
const sharedPassages = [
  { first: 44, last: 45, anchors: ["邪靈", "巫童", "驅魔儀式", "志願團體"] },
  { first: 46, last: 48, anchors: ["微型電動二輪車", "強制汽車責任保險", "年滿14歲", "2022年11月30日"] },
  { first: 49, last: 50, anchors: ["435席", "每十年"] }
];
const figure = "./assets/official-exams/113-social-q49-seat-change-maps.svg";
const sourcePage = "./assets/official-exams/113-social-p14.webp";

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 41;
  const id = `OFF-${String(770 + number).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} original question number`);
  assert.equal(item.answer, expectedAnswers[index], `${id} answer index`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official answer-key review`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + expectedAnswers[index])}`), `${id} answer citation`);
  assert.equal(item.options?.length, 4, `${id} option count`);
  assert.ok(item.explanation?.length > 30, `${id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked steps`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  assert.doesNotMatch(text, /\bcid\d+\b/i, `${id} PDF font residue`);
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  if (number === 49 || number === 50) {
    assert.equal(item.requiresImage, true, `${id} visual requirement`);
    assert.ok(item.questionImages?.includes(figure), `${id} required map`);
    assert.equal(item.questionImages?.filter(path => /113-social-p\d+\.webp$/.test(path)).length, 0, `${id} no redundant full-page scan`);
  } else {
    assert.equal(item.requiresImage, false, `${id} text-only question`);
    assert.equal((item.questionImages || []).length, 0, `${id} no unnecessary scan`);
  }
}

for (const group of sharedPassages) {
  for (let number = group.first; number <= group.last; number += 1) {
    const id = `OFF-${String(770 + number).padStart(4, "0")}`;
    const item = questions.find(question => question.id === id);
    assert.ok(item, `missing shared-passage question ${id}`);
    const text = `${item.question}\n${item.options.join("\n")}`;
    for (const anchor of group.anchors) assert.ok(text.includes(anchor), `${id} shared passage anchor: ${anchor}`);
  }
}

const svg = await readFile(join(root, "assets", "official-exams", "113-social-q49-seat-change-maps.svg"), "utf8");
assert.ok(svg.includes('href="113-social-p14.webp"'), "focused map derives from original exam page");
assert.ok(serviceWorker.includes(figure), "focused map is cached offline");
assert.ok(serviceWorker.includes(sourcePage), "original source page is cached offline");
await access(join(root, "assets", "official-exams", "113-social-q49-seat-change-maps.svg"));
await access(join(root, "assets", "official-exams", "113-social-p14.webp"));

const ids = expectedAnswers.map((_, index) => `OFF-${String(811 + index).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit flag uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 113 Social Studies Q41–50; removed ${stale.length} superseded audit flags.`);
