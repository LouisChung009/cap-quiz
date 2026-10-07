import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const answers = [3, 3, 3, 1, 2, 1, 1, 3, 2, 1];
const clues = [
  ["第1排", "第3排", "冬至", "正午太陽高度"],
  ["840 萬公升", "2.1×10⁻⁷ g/L", "1.764 g", "0.02352 g/L"],
  ["腎臟", "尿素", "乙→丙→甲"],
  ["40 cm³", "30 cm³", "20 cm³", "10 cm³", "0.5 g/cm³", "1.0 g/cm³", "2.0 g/cm³", "3.0 g/cm³"],
  ["震央震度", "丙站", "6.1"],
  ["物距為 10 cm", "出射光平行", "焦距"],
  ["24.3 g", "65.4 g", "2.0 g", "質量守恆"],
  ["F 與位移 S", "W＝FS", "動能定理"],
  ["Rhododendron", "oldhamii", "Ericaceae", "屬名"],
  ["負極", "正極", "硫酸銅水溶液", "Cu²⁺"]
];
const figures = new Map([
  ["OFF-0855", "113-science-q31-classroom-map.png"],
  ["OFF-0859", "113-science-q35-intensity-map.png"],
  ["OFF-0860", "113-science-q36-lens-ray-options.png"],
  ["OFF-0864", "113-science-q40-copper-plating-options.png"]
]);
const flaggedIds = new Set(["OFF-0855", "OFF-0857", "OFF-0860", "OFF-0861", "OFF-0862", "OFF-0863", "OFF-0864"]);

assert.equal(new Set(audit.map(entry => entry.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < 10; index += 1) {
  const number = index + 31;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} exists`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source question number`);
  assert.equal(item.answer, answers[index], `${id} official answer index`);
  assert.equal(item.options?.length, 4, `${id} four choices`);
  assert.ok(item.explanation?.length > 50, `${id} substantive explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked solution steps`);
  assert.ok(item.teacherTip?.trim(), `${id} teacher tip`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} key status`);
  assert.ok(item.answerKeyReview?.note?.includes(`依113年國中教育會考官方選擇題參考答案一覽表核對：自然第${number}題官方答案${String.fromCharCode(65 + answers[index])}`), `${id} key provenance`);
  const evidence = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  for (const clue of clues[index]) assert.ok(evidence.includes(clue), `${id} source evidence ${clue}`);
  const image = figures.get(id);
  assert.equal(Boolean(item.requiresImage), Boolean(image), `${id} required-image flag`);
  if (image) {
    assert.ok(item.questionImages?.some(path => path.endsWith(image)), `${id} expected figure binding`);
    await access(join(root, "assets", "official-exams", image));
  } else assert.ok(!item.questionImages?.length && !item.questionImage, `${id} unnecessary scan absent`);
}
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
for (const image of figures.values()) assert.ok(serviceWorker.includes(`./assets/official-exams/${image}`), `${image} offline cache entry`);
for (const page of [8, 9]) await access(join(root, "assets", "official-exams", `113-science-p${page}.webp`));

const matched = audit.filter(entry => flaggedIds.has(entry.id));
assert.equal(new Set(matched.map(entry => entry.id)).size, matched.length, "flag IDs must be unique");
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only the complete seven-flag batch can be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(entry => !flaggedIds.has(entry.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled 113 Natural Science Q31–40 against official keys, source evidence, worked solutions, required figures, and offline cache; removed ${matched.length} flags.`);
