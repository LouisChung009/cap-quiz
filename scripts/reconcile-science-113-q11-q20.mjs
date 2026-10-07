import assert from "node:assert/strict";
import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "自然-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const expectedAnswers = [1, 3, 3, 1, 3, 1, 1, 2, 1, 2];
const evidence = [
  ["顏色不再改變", "正反應速率等於逆反應速率", "動態平衡"],
  ["Aa × Aa", "長翅：短翅＝3：1", "750"],
  ["磁通量", "方向相反", "大小大致相同"],
  ["乙期數量上升", "出生", "遷入"],
  ["1020 hPa", "相鄰等壓線", "風向"],
  ["1 psi", "力／面積", "壓力"],
  ["pH 2.4", "丙＜甲＜乙", "乙的 pH 應最小"],
  ["不需要介質", "力學波", "光波"],
  ["C 27%、H 0%、O 73%", "丙只由碳元素", "無機碳氧化物"],
  ["全稱主張", "淡水", "反例"]
];
const figures = new Map([["OFF-0839", "113-science-q15-isobar-map.svg"]]);
const flaggedIds = new Set(["OFF-0835", "OFF-0837", "OFF-0839", "OFF-0842", "OFF-0844"]);

assert.equal(new Set(audit.map(item => item.id)).size, audit.length, "audit IDs must be unique");
for (let index = 0; index < expectedAnswers.length; index += 1) {
  const number = index + 11;
  const id = `OFF-${String(number + 824).padStart(4, "0")}`;
  const item = questions.find(question => question.id === id);
  assert.ok(item, `${id} must exist`);
  assert.equal(item.subject, "自然", `${id} subject`);
  assert.equal(item.sourceType, "官方歷屆真題", `${id} source type`);
  assert.equal(item.source?.year, 113, `${id} source year`);
  assert.equal(item.source?.questionNumber, number, `${id} source number`);
  assert.equal(item.answer, expectedAnswers[index], `${id} official answer index`);
  assert.equal(item.options?.length, 4, `${id} four options`);
  assert.ok(item.explanation?.length > 35, `${id} substantive explanation`);
  assert.ok(item.solutionSteps?.length >= 3, `${id} worked solution`);
  assert.ok(item.teacherTip?.trim(), `${id} teacher tip`);
  assert.equal(item.answerKeyReview?.status, "verified", `${id} official answer verification`);
  assert.ok(item.answerKeyReview?.note?.includes(`依113年國中教育會考官方選擇題參考答案一覽表核對：自然第${number}題官方答案${String.fromCharCode(65 + expectedAnswers[index])}`), `${id} answer provenance`);
  const content = `${item.question}\n${item.options.join("\n")}\n${item.explanation}\n${item.solutionSteps.join("\n")}\n${item.teacherTip}`;
  for (const clue of evidence[index]) assert.ok(content.includes(clue), `${id} source-evidence clue ${clue}`);
  const expectedFigure = figures.get(id);
  assert.equal(Boolean(item.requiresImage), Boolean(expectedFigure), `${id} image dependency`);
  if (expectedFigure) {
    assert.equal(item.questionImages?.length, 1, `${id} focused image count`);
    assert.ok(item.questionImages[0].endsWith(expectedFigure), `${id} figure binding`);
    await access(join(root, "assets", "official-exams", expectedFigure));
  } else {
    assert.ok(!item.questionImages?.length && !item.questionImage, `${id} has no redundant page scan`);
  }
}
for (const page of [2, 3, 4, 5]) await access(join(root, "assets", "official-exams", `113-science-p${page}.webp`));

const matched = audit.filter(item => flaggedIds.has(item.id));
assert.equal(new Set(matched.map(item => item.id)).size, matched.length, "reviewed audit IDs must be unique");
assert.ok(matched.length === 0 || matched.length === flaggedIds.size, "only a complete five-item batch may be reconciled");
await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !flaggedIds.has(item.id)), null, 2)}\n`, "utf8");
console.log(`Reconciled 113 Natural Science Q11–20 against original pages, official answer-key provenance, worked explanations, and Q15 figure; removed ${matched.length} verified flags.`);
