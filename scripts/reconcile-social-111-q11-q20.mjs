import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, "data", "mission-questions.json");
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const questions = JSON.parse(await readFile(dataPath, "utf8"));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const answerIndexes = [1, 0, 1, 2, 3, 2, 1, 2, 2, 0];
const evidence = [
  ["140 元", "價格競爭"],
  ["較晚出生世代", "幼兒教育補助"],
  ["李大賢", "美國籍"],
  ["友善飼養", "售價"],
  ["臺灣", "丁"],
  ["原始森林", "野生動物"],
  ["無人機", "勞力成本"],
  ["38.781°N", "葡萄牙"],
  ["丙", "具體記錄"],
  ["打狗", "日本統治時期"]
];
const figureNames = new Map([
  [12, "111-social-q12-fertility-chart.png"],
  [15, "111-social-q15-us-climate-map.png"],
  [16, "111-social-q16-borneo-forest.png"],
  [18, "111-social-q18-capes.png"]
]);
const ids = answerIndexes.map((_, index) => `OFF-${String(353 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const questionNumber = index + 11;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 111 || row.source.questionNumber !== questionNumber || row.answer !== answerIndexes[index] || row.options?.length !== 4 || row.solutionSteps?.length < 3 || !row.teacherTip) {
    throw new Error(`${id}: source identity, official answer, four choices, or worked solution is incomplete`);
  }
  const solution = `${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !solution.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(`${row.question} ${solution}`)) {
    throw new Error(`${id}: source-specific reasoning is missing or known generic/OCR text remains`);
  }
  const figure = figureNames.get(questionNumber);
  if (figure) {
    const path = `./assets/official-exams/${figure}`;
    if (!row.requiresImage || row.questionImage !== path || !row.questionImages?.includes(path) || !serviceWorker.includes(figure)) {
      throw new Error(`${id}: required official figure or offline precache is missing`);
    }
    await access(join(root, path.replace(/^\.\//, "")));
  } else if (row.requiresImage || row.questionImage || row.questionImages?.length) {
    throw new Error(`${id}: text-transcribed question should not render an unnecessary page image`);
  }
}

for (const page of ["111-social-p4.webp", "111-social-p5.webp", "111-social-p6.webp"]) {
  await access(join(root, "assets", "official-exams", page));
}

const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings found in reviewed OFF-0353–0362 range");
if (!linked.length) {
  console.log("OFF-0353–0362 findings are already reconciled; source-linked checks passed.");
} else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after rechecking OFF-0353–0362 against original pages and answer keys.`);
}
