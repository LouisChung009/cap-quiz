import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const answers = [2, 3, 0, 0, 0, 2, 2, 3, 2, 2];
const evidence = [
  ["稻米加工", "減輕稻米過剩壓力"],
  ["就學、就醫", "公共運輸網不足"],
  ["格陵蘭", "海冰變薄"],
  ["16.60%", "17.95%", "二孩政策"],
  ["清末", "女子學校", "纏足"],
  ["自由中國", "雷震", "美麗島", "黃信介", "戒嚴"],
  ["法國", "平均壽命", "戰爭"],
  ["1655", "1663", "送往北京", "清帝國與鄭氏政權"],
  ["逾期居留", "生命", "基本人權具有普遍性"],
  ["領土包括領海範圍內的陸地", "專屬經濟海域"]
];
const figures = new Map([
  [2, "112-social-q02-happiness-bus-map.svg"],
  [7, "112-social-q07-life-expectancy.svg"],
  [10, "112-social-q10-territory.svg"]
]);
const ids = answers.map((_, index) => `OFF-${String(557 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const number = index + 1;
  const row = questions.find(item => item.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 112 || row.source.questionNumber !== number || row.answer !== answers[index] || row.options?.length !== 4 || !row.explanation || !row.solutionSteps?.length || !row.teacherTip) throw new Error(`${id}: verified identity, answer or teaching content is missing`);
  const teaching = `${row.explanation} ${row.solutionSteps.join(" ")} ${row.teacherTip}`;
  if (evidence[index].some(clue => !`${row.question} ${teaching}`.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(`${row.question} ${teaching}`)) throw new Error(`${id}: source clue, explanation or clean transcription is missing`);
  if ([4, 6].includes(number)) {
    if (row.question.split("\n").filter(line => line.trim().startsWith("|")).length < 3) throw new Error(`${id}: source table data is missing from the text stimulus`);
  }
  const image = figures.get(number);
  if (image) {
    const path = `./assets/official-exams/${image}`;
    if (!row.requiresImage || !row.questionImages?.includes(path) || !serviceWorker.includes(image)) throw new Error(`${id}: required figure or offline cache is missing`);
    await access(join(root, "assets", "official-exams", image));
  } else if (row.requiresImage || row.questionImages?.length) throw new Error(`${id}: text-only item should not show a redundant scan`);
}
for (const page of [2, 3, 4]) await access(join(root, "assets", "official-exams", `112-social-p${page}.webp`));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings for OFF-0557–0566");
if (!linked.length) console.log("OFF-0557–0566 findings already reconciled; source checks passed.");
else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted audit findings after source and figure checks.`);
}
