import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const answerIndexes = [1, 3, 3, 1, 2, 1, 3, 3, 3, 1];
const evidence = [
  ["葡萄牙", "新航線"],
  ["1917", "第一次世界大戰"],
  ["新聞自由", "記者思想"],
  ["投票資格", "監護宣告"],
  ["死刑", "基本人權"],
  ["阿爾卑斯", "上升"],
  ["日本海", "北極海"],
  ["南亞", "5%"],
  ["34.3°C", "39.3°C（含）以上"],
  ["中華民國", "1928–1937"]
];
const figures = new Map([
  [26, "111-social-q26-alpine-profile.png"],
  [27, "111-social-q27-port-map.png"],
  [28, "111-social-q28-population-map.png"]
]);
const ids = answerIndexes.map((_, index) => `OFF-${String(363 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const questionNumber = index + 21;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 111 || row.source.questionNumber !== questionNumber || row.answer !== answerIndexes[index] || row.options?.length !== 4 || row.solutionSteps?.length < 3 || !row.teacherTip) {
    throw new Error(`${id}: official identity, answer index, four choices, or worked steps are incomplete`);
  }
  const solution = `${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !solution.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(`${row.question} ${solution}`)) {
    throw new Error(`${id}: source-specific evidence is missing or generic/OCR text remains`);
  }
  const figure = figures.get(questionNumber);
  if (figure) {
    const path = `./assets/official-exams/${figure}`;
    if (!row.requiresImage || row.questionImage !== path || !row.questionImages?.includes(path) || !serviceWorker.includes(figure)) throw new Error(`${id}: required map/profile or offline cache is missing`);
    await access(join(root, path.replace(/^\.\//, "")));
  } else if (row.requiresImage || row.questionImage || row.questionImages?.length) {
    throw new Error(`${id}: complete text item should not display a redundant exam page`);
  }
}

for (let page = 6; page <= 9; page += 1) await access(join(root, "assets", "official-exams", `111-social-p${page}.webp`));

const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings found for OFF-0363–0372");
if (!linked.length) {
  console.log("OFF-0363–0372 findings are already reconciled; source-linked checks passed.");
} else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after checking OFF-0363–0372 against original pages and answer keys.`);
}
