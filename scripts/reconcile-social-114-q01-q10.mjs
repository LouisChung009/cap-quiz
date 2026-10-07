import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const answers = [0, 0, 1, 1, 1, 2, 3, 2, 2, 1];
const evidence = [
  ["地震帶", "颱風", "環太平洋", "日本"],
  ["外展農業移工", "農務工作", "農業勞動力老化"],
  ["春節", "清明節", "華語", "潑水節", "原鄉文化"],
  ["挖仔", "彎曲河道", "曲流地形"],
  ["離島", "醫療院所", "可近性", "區域間資源分配"],
  ["帝國大學", "臺灣總督府", "鐵道部工場", "飛行場", "日治時期"],
  ["入學", "交友", "營業", "掌握財產", "出入自由", "婚姻自由", "晚清", "近代"],
  ["十一世紀", "廣州", "關稅", "珊瑚", "象牙", "宋代市舶司"],
  ["巴黎和會", "五四運動", "俄國革命", "中國共產黨"],
  ["贖罪券", "路德", "因信得救", "因信稱義"]
];
const figures = new Map([
  [4, "./assets/official-exams/114-social-q04-wazai-map.png"],
  [6, "./assets/official-exams/114-social-q06-taipei-map.png"],
  [10, "./assets/official-exams/114-social-q10-indulgence-woodcut.png"]
]);
const sourcePages = ["./assets/official-exams/114-social-p2.webp", "./assets/official-exams/114-social-p3.webp"];

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < answers.length; index += 1) {
  const number = index + 1;
  const id = `OFF-${String(984 + number).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `missing ${id}`);
  assert.equal(item.subject, "社會", `${id} subject`);
  assert.equal(item.source?.year, 114, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} original question number`);
  assert.equal(item.answer, answers[index], `${id} official answer`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official key status`);
  assert.match(item.answerKeyReview?.note || "", new RegExp(`社會第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} official key citation`);
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.ok(item.explanation?.length > 35, `${id} explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked solution`);
  assert.ok(item.teacherTip?.length > 10, `${id} teacher tip`);
  const text = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  assert.doesNotMatch(text, /\bcid\d+\b/i, `${id} no PDF font residue`);
  for (const clue of evidence[index]) assert.ok(text.includes(clue), `${id} source evidence: ${clue}`);
  const expectedFigure = figures.get(number);
  if (expectedFigure) {
    assert.equal(item.requiresImage, true, `${id} figure required`);
    assert.ok(item.questionImages?.includes(expectedFigure), `${id} focused figure`);
    assert.ok(serviceWorker.includes(expectedFigure), `${id} offline figure`);
    await access(join(root, expectedFigure.replace("./", "")));
  } else {
    assert.equal(item.requiresImage, false, `${id} self-contained text item`);
    assert.equal((item.questionImages || []).length, 0, `${id} no redundant full-page image`);
  }
}

for (const page of sourcePages) {
  assert.ok(serviceWorker.includes(page), `${page} original source cached offline`);
  await access(join(root, page.replace("./", "")));
}

const ids = answers.map((_, index) => `OFF-${String(985 + index).padStart(4, "0")}`);
const stale = audit.filter(item => ids.includes(item.id));
for (const id of ids) assert.ok(stale.filter(item => item.id === id).length <= 1, `${id} audit uniqueness`);
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
console.log(`Verified official 114 Social Studies Q1–10; removed ${stale.length} superseded audit flags.`);
