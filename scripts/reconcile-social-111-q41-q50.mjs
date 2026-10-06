import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const answerIndexes = [1, 3, 0, 1, 1, 0, 0, 1, 2, 3];
const evidence = [
  ["英國與美國", "珍珠港"],
  ["甲幣相對乙貶值", "甲幣相對丙升值"],
  ["韓戰", "聯合國"],
  ["1855 年", "尚未正式對外開港"],
  ["郊", "維護既有利益"],
  ["閩南", "西南部"],
  ["田地", "水稻耕作"],
  ["潭墘", "水塘"],
  ["文化交流", "外來品牌"],
  ["修法", "商品種類"]
];
const figures = new Map([
  [41, ["111-social-q41-world-map.png"]],
  [42, ["111-social-q42-trade-diagram.png"]],
  [43, ["111-social-q43-propaganda-cartoon.png"]],
  [46, ["111-social-q46-diqian-taiwan-map.png"]],
  [47, ["111-social-q47-japanese-landuse-map.png"]],
  [48, ["111-social-q47-japanese-landuse-map.png", "111-social-q48-water-map.png"]]
]);
const ids = answerIndexes.map((_, index) => `OFF-${String(383 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const questionNumber = index + 41;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 111 || row.source.questionNumber !== questionNumber || row.answer !== answerIndexes[index] || row.options?.length !== 4 || row.solutionSteps?.length < 3 || !row.teacherTip) {
    throw new Error(`${id}: official identity, answer index, four choices, or worked explanation is incomplete`);
  }
  const solution = `${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !solution.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(`${row.question} ${solution}`)) {
    throw new Error(`${id}: source-specific reasoning is missing or generic/OCR text remains`);
  }
  const expectedFigures = figures.get(questionNumber);
  if (expectedFigures) {
    if (!row.requiresImage || expectedFigures.some(figure => !row.questionImages?.includes(`./assets/official-exams/${figure}`) || !serviceWorker.includes(figure))) {
      throw new Error(`${id}: required figure(s) or offline caching are missing`);
    }
    for (const figure of expectedFigures) await access(join(root, "assets", "official-exams", figure));
  } else if (row.requiresImage || row.questionImage || row.questionImages?.length) {
    throw new Error(`${id}: complete text item should not display a redundant exam-page scan`);
  }
}

for (let page = 12; page <= 14; page += 1) await access(join(root, "assets", "official-exams", `111-social-p${page}.webp`));

const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings found for OFF-0383–0392");
if (!linked.length) {
  console.log("OFF-0383–0392 findings are already reconciled; source-linked checks passed.");
} else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after checking OFF-0383–0392 against original pages and answer keys.`);
}
