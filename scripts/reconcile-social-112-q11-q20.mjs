import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataPath = join(root, "data", "mission-questions.json");
const questions = JSON.parse(await readFile(dataPath, "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const answers = [1, 3, 0, 1, 0, 2, 0, 0, 3, 0];
const evidence = [
  ["調解", "消費者保護", "家庭暴力"],
  ["太魯閣族", "歲時祭儀", "多元文化", "文化傳承"],
  ["棗椰樹", "熱帶乾燥地區", "北非"],
  ["魚梁沙洲", "湖北襄陽", "季節性降水"],
  ["CPTPP", "臺灣不是", "關稅劣勢"],
  ["塔普塔普阿泰", "法屬玻里尼西亞", "16.84°S"],
  ["淡水、雞籠開港", "大稻埕", "茶葉"],
  ["公意", "盧梭", "人民主權"],
  ["霞喀羅", "警備道路", "理蕃政策"],
  ["東北軍", "兵諫", "停止內戰", "共同抗日"]
];
const figures = new Map([
  [15, "112-social-q15-cptpp-members.svg"],
  [19, "112-social-q19-xiakaluo-trail.svg"]
]);
const ids = answers.map((_, index) => `OFF-${String(567 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const number = index + 11;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 112 || row.source.questionNumber !== number || row.answer !== answers[index] || row.options?.length !== 4 || row.answerKeyReview?.status !== "verified" || !row.explanation || row.solutionSteps?.length < 3) throw new Error(`${id}: official identity, verified key, choices or worked explanation is incomplete`);
  const combined = `${row.question} ${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !combined.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(combined)) throw new Error(`${id}: source evidence is missing or OCR/generic text remains`);
  const image = figures.get(number);
  if (image) {
    const path = `./assets/official-exams/${image}`;
    if (!row.requiresImage || !row.questionImages?.includes(path) || !serviceWorker.includes(image)) throw new Error(`${id}: necessary source figure or offline cache is missing`);
    await access(join(root, "assets", "official-exams", image));
  } else if (row.requiresImage || row.questionImages?.length) throw new Error(`${id}: text-only item should not display a redundant scan`);
}

const q15 = questions.find(question => question.id === "OFF-0571");
const q16 = questions.find(question => question.id === "OFF-0572");
const q19 = questions.find(question => question.id === "OFF-0575");
if (/\s[1-9]\s/.test(q15.question) || !q15.question.includes("分階段廢除關稅")) throw new Error("OFF-0571: CPTPP map labels still contaminate the question text");
if (q16.options[3] !== "(42.85°S，71.87°W)" || /\)\s*4$/.test(q16.options[3])) throw new Error("OFF-0572: printed page number remains attached to choice D");
if (/？\s*圖\(八\)\s*$/.test(q19.question)) throw new Error("OFF-0575: duplicated figure label remains in the question text");
for (const page of [4, 5, 6]) await access(join(root, "assets", "official-exams", `112-social-p${page}.webp`));

const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings for OFF-0567–0576");
if (!linked.length) console.log("OFF-0567–0576 findings already reconciled; source and cleanup assertions passed.");
else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after correcting OCR residue and checking original pages.`);
}
