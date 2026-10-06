import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const answerIndexes = [2, 0, 1, 0];
const evidence = [
  ["含咖啡因飲品", "保護兒少身心健康"],
  ["十九世紀英國", "煤炭", "城市空氣污染"],
  ["西歐盛行西風", "西風是由西往東吹", "污染源東側的乙"],
  ["資本家", "低技術勞工", "社會主義"]
];
const sharedPassages = [
  ["南韓政府擔心", "含咖啡因飲料", "2018年9月", "頭痛、心跳加速"],
  ["夏目漱石", "煤炭", "西歐盛行風", "低技術勞動階級", "恩格斯"]
];
const figure = "./assets/official-exams/111-social-q53-city-diagram.png";
const ids = answerIndexes.map((_, index) => `OFF-${String(393 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const questionNumber = index + 51;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 111 || row.source.questionNumber !== questionNumber || row.answer !== answerIndexes[index] || row.options?.length !== 4 || row.solutionSteps?.length < 3 || !row.teacherTip) {
    throw new Error(`${id}: official identity, answer index, four choices, or worked explanation is incomplete`);
  }
  const expectedPassage = questionNumber === 51 ? sharedPassages[0] : sharedPassages[1];
  if (expectedPassage.some(clue => !row.question.includes(clue))) throw new Error(`${id}: shared stimulus text is missing or incomplete`);
  const reasoning = `${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !reasoning.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(`${row.question} ${reasoning}`)) {
    throw new Error(`${id}: source-specific reasoning is missing or generic/OCR text remains`);
  }
  if (questionNumber === 53) {
    if (!row.requiresImage || row.questionImage !== figure || !row.questionImages?.includes(figure) || !serviceWorker.includes(figure)) throw new Error(`${id}: direction diagram or offline cache is missing`);
    await access(join(root, "assets", "official-exams", "111-social-q53-city-diagram.png"));
  } else if (row.requiresImage || row.questionImage || row.questionImages?.length) {
    throw new Error(`${id}: complete text item should not display a redundant exam-page scan`);
  }
}

await access(join(root, "assets", "official-exams", "111-social-p14.webp"));
await access(join(root, "assets", "official-exams", "111-social-p15.webp"));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings found for OFF-0393–0396");
if (!linked.length) {
  console.log("OFF-0393–0396 findings are already reconciled; source-linked checks passed.");
} else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after checking OFF-0393–0396 against original pages and answer keys.`);
}
