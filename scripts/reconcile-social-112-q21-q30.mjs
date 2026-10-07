import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const answers = [1, 3, 1, 1, 0, 1, 3, 1, 0, 3];
const evidence = [
  ["雅加達", "婆羅洲", "紅毛猩猩棲地", "機會成本"],
  ["國際刑警組織", "犯罪情報", "國內治安風險"],
  ["灰色衰退期間", "最低 20%", "負值", "較嚴重衝擊"],
  ["立法院", "質詢行政院部長", "中央政府總預算"],
  ["世界銀行", "矩形面積", "印度"],
  ["巴拿馬", "哥倫比亞", "達連", "熱帶雨林"],
  ["熔岩", "比例尺", "6 公里"],
  ["25.13°N", "121.74°E", "東北季風", "表(三)"],
  ["阿赫特", "佩雷特", "夏矛", "尼羅河"],
  ["引進", "資金和技術", "改革開放"]
];
const figures = new Map([
  [23, "112-social-q23-income-chart.svg"],
  [25, "112-social-q25-world-gdp.svg"],
  [26, "112-social-q26-pan-american-route.svg"],
  [27, "112-social-q27-la-palma-eruption.svg"]
]);
const ids = answers.map((_, index) => `OFF-${String(577 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const number = index + 21;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 112 || row.source.questionNumber !== number || row.answer !== answers[index] || row.options?.length !== 4 || row.answerKeyReview?.status !== "verified" || row.solutionSteps?.length < 3 || !row.explanation) throw new Error(`${id}: official identity, key, choices or worked explanation is incomplete`);
  const combined = `${row.question} ${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !combined.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(combined)) throw new Error(`${id}: source evidence is missing or OCR/generic text remains`);
  const image = figures.get(number);
  if (image) {
    const path = `./assets/official-exams/${image}`;
    if (!row.requiresImage || !row.questionImages?.includes(path) || !serviceWorker.includes(image)) throw new Error(`${id}: necessary figure or offline cache is missing`);
    await access(join(root, "assets", "official-exams", image));
  } else if (row.requiresImage || row.questionImages?.length) throw new Error(`${id}: complete text/table item should not use a redundant scan`);
}

const q23 = questions.find(question => question.id === "OFF-0579");
if (/？.*圖\(九\)\s*$/.test(q23.question) || !q23.question.includes("家庭可支配所得是家庭可自由使用於消費或儲蓄的所得")) throw new Error("OFF-0579: repeated chart caption remains or explanatory note is missing");
for (const page of [6, 7, 8]) await access(join(root, "assets", "official-exams", `112-social-p${page}.webp`));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings for OFF-0577–0586");
if (!linked.length) console.log("OFF-0577–0586 findings already reconciled; source checks passed.");
else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after checking the original pages and figure requirements.`);
}
