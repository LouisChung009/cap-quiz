import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const answerIndexes = [3, 0, 0, 3, 3, 3, 2, 2, 2, 3];
const evidence = [
  ["鄭氏勢力", "海禁"],
  ["拘役四十天", "刑事處罰"],
  ["權宜問題", "秩序問題"],
  ["立法院", "施政報告"],
  ["法院核定", "同一效力"],
  ["乙店", "甲店"],
  ["立憲", "革命可能"],
  ["南半球", "澳洲"],
  ["家暴受害者", "女性"],
  ["區域內貿易", "自由貿易協定"]
];
const figures = new Map([
  [31, "111-social-q31-trade-stages.png"],
  [33, "111-social-q33-meeting-flow.png"],
  [36, "111-social-q36-shopping-map.png"],
  [38, "111-social-q38-language-coin.png"],
  [39, "111-social-q39-gender-charts.png"],
  [40, "111-social-q40-africa-trade-article.png"]
]);
const ids = answerIndexes.map((_, index) => `OFF-${String(373 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const questionNumber = index + 31;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 111 || row.source.questionNumber !== questionNumber || row.answer !== answerIndexes[index] || row.options?.length !== 4 || row.solutionSteps?.length < 3 || !row.teacherTip) {
    throw new Error(`${id}: official identity, answer key, four choices, or worked reasoning is incomplete`);
  }
  const solution = `${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !solution.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(`${row.question} ${solution}`)) {
    throw new Error(`${id}: source-specific reasoning is missing or generic/OCR text remains`);
  }
  const figure = figures.get(questionNumber);
  if (figure) {
    const path = `./assets/official-exams/${figure}`;
    if (!row.requiresImage || row.questionImage !== path || !row.questionImages?.includes(path) || !serviceWorker.includes(figure)) throw new Error(`${id}: required figure or offline cache is missing`);
    await access(join(root, path.replace(/^\.\//, "")));
  } else if (row.requiresImage || row.questionImage || row.questionImages?.length) {
    throw new Error(`${id}: complete text item should not display a redundant exam page`);
  }
}

for (let page = 9; page <= 11; page += 1) await access(join(root, "assets", "official-exams", `111-social-p${page}.webp`));

const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings found for OFF-0373–0382");
if (!linked.length) {
  console.log("OFF-0373–0382 findings are already reconciled; source-linked checks passed.");
} else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after checking OFF-0373–0382 against original pages and answer keys.`);
}
