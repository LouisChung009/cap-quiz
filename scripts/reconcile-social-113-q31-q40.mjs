import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const expectedAnswers = [3, 0, 3, 3, 1, 1, 2, 3, 2, 1];
const figures = new Map([
  [31, ["113-social-q31-revolution-cartoon.svg", "113-social-p9.webp"]],
  [35, ["113-social-q35-crime-and-news-chart.svg", "113-social-p10.webp"]],
  [37, ["113-social-q37-economic-corridors.svg", "113-social-p11.webp"]],
  [40, ["113-social-q40-case-chart.svg", "113-social-p11.webp"]]
]);
const evidence = [
  ["十八世紀末", "無套褲漢", "自由、民主", "打擊教皇"],
  ["曹丕", "220年", "中正官", "分為九等"],
  ["太平洋光纖電纜網路", "24.86°N", "33.91°N", "東南亞市場"],
  ["前年", "未滿20歲", "年滿20歲", "2022 年", "2024 年", "公民投票"],
  ["殺人案件數", "搜尋結果數", "主管機關", "媒體與社群"],
  ["150萬", "無酬勞動", "平價托育"],
  ["一帶一路", "波斯灣", "南海", "巴基斯坦", "中國西部", "丙"],
  ["法國租界", "英國租界", "水夫", "每擔水都收十文", "十九世紀末的上海"],
  ["美洲", "壓艙水", "法國", "突尼西亞", "全球化"],
  ["非告訴乃論", "調解委員會", "甲線上移", "乙線維持不變"]
];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 31;
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
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
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

const ids = expectedAnswers.map((_, index) => `OFF-${String(801 + index).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit flag uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified 113 Social Studies Q31–40; removed ${stale.length} superseded audit flags.`);
