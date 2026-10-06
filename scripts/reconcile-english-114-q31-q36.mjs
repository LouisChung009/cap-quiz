import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const auditPath = join(root, "reports", "英文-teacher-audit.json");
const questionPath = join(root, "data", "mission-questions.json");
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const questions = JSON.parse(await readFile(questionPath, "utf8"));
const answerIndexes = [1, 3, 0, 1, 2, 2];
const evidence = [
  ["Picture 7", "cut down the last trees"],
  ["Ariely wanted to know", "shared his feelings"],
  ["5 cents", "25 cents"],
  ["IKEA effect", "親自製作"],
  ["1972", "停電期間"],
  ["縮短工時", "不知何時停止"]
];
const ids = answerIndexes.map((_, index) => `OFF-${String(947 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const questionNumber = index + 31;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "英文" || row.source?.year !== 114 || row.source.questionNumber !== questionNumber || row.answer !== answerIndexes[index] || row.options?.length !== 4 || row.solutionSteps?.length < 3 || !row.teacherTip || row.relatedWords?.length < 2) {
    throw new Error(`${id}: official identity, keyed answer, four options, or complete teaching fields are missing`);
  }
  const solution = `${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !solution.includes(clue)) || /(?:\(cid:\d+\)|查看官方試題頁面|【Reading material】\s*【Reading material】)/.test(`${row.question} ${solution}`)) {
    throw new Error(`${id}: source evidence is missing or OCR/duplicate-material noise remains`);
  }
  if (questionNumber === 31) {
    const expectedImages = ["./assets/official-exams/114-english-p8.webp", "./assets/official-exams/114-english-p9.webp"];
    if (!row.requiresImage || !row.requiresContext || row.questionImage !== expectedImages[1] || row.questionImages?.join("|") !== expectedImages.join("|") || expectedImages.some(image => !serviceWorker.includes(image))) {
      throw new Error(`${id}: the comic context and Picture 7 question page must both be shown and offline cached`);
    }
    for (const image of expectedImages) await access(join(root, image.replace(/^\.\//, "")));
  } else if (row.requiresImage || row.questionImage || row.questionImages?.length) {
    throw new Error(`${id}: fully transcribed text item should not display a redundant exam-page scan`);
  }
}

for (let page = 8; page <= 13; page += 1) {
  await access(join(root, "assets", "official-exams", `114-english-p${page}.webp`));
}

const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings found for OFF-0947–0952");
if (!linked.length) {
  console.log("OFF-0947–0952 findings are already reconciled; source-linked checks passed.");
} else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after comparing OFF-0947–0952 with original pages and answer keys.`);
}
