import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const auditPath = join(root, "reports", "社會-teacher-audit.json");
const answers = [2, 3, 1, 3, 3, 2, 1, 3, 0, 0];
const evidence = [
  ["斯拉夫兄弟", "布爾什維克", "議和"],
  ["周朝", "封建制度", "分封土地"],
  ["查理曼", "加洛林文藝復興", "八世紀"],
  ["764.3", "210.1", "丙"],
  ["飢餓行銷", "稀缺感", "非價格因素", "購買意願"],
  ["實際居住", "六個月", "總統"],
  ["社會增加", "歸化入籍", "自然增加"],
  ["樟腦", "文化協會", "南洋戰場"],
  ["1830", "上海尚未", "9,998", "上海 0"],
  ["1單位甲幣可兌換10單位乙幣", "20 乙幣", "甲幣升值"]
];
const ids = answers.map((_, index) => `OFF-${String(587 + index).padStart(4, "0")}`);

for (const [index, id] of ids.entries()) {
  const number = index + 31;
  const row = questions.find(question => question.id === id);
  if (!row || row.subject !== "社會" || row.source?.year !== 112 || row.source.questionNumber !== number || row.answer !== answers[index] || row.options?.length !== 4 || row.answerKeyReview?.status !== "verified" || row.solutionSteps?.length < 3 || !row.explanation) throw new Error(`${id}: official identity, key, choices or worked explanation is incomplete`);
  const combined = `${row.question} ${row.explanation} ${row.solutionSteps.join(" ")}`;
  if (evidence[index].some(clue => !combined.includes(clue)) || /最符合題幹|查看官方試題頁面|\(cid:\d+\)/.test(combined)) throw new Error(`${id}: source evidence is missing or OCR/generic text remains`);
  if (row.requiresImage || row.questionImage || row.questionImages?.length) throw new Error(`${id}: text/transcribed data item should not show a redundant page image`);
}

const q34 = questions.find(question => question.id === "OFF-0590");
const q39 = questions.find(question => question.id === "OFF-0595");
if (q34.question.split("\n").filter(line => line.trim().startsWith("|")).length < 5) throw new Error("OFF-0590: original medical-resource table is not structured for rendering");
if (q39.options.some((option, index) => new RegExp(`^${String.fromCharCode(65 + index)}[：:]`).test(option))) throw new Error("OFF-0595: duplicated choice letters remain in option text");
for (const page of [9, 10, 11]) await access(join(root, "assets", "official-exams", `112-social-p${page}.webp`));
const audit = JSON.parse(await readFile(auditPath, "utf8"));
const linked = audit.filter(item => ids.includes(item.id));
if (new Set(linked.map(item => item.id)).size !== linked.length) throw new Error("Duplicate audit findings for OFF-0587–0596");
if (!linked.length) console.log("OFF-0587–0596 findings already reconciled; source and cleanup assertions passed.");
else {
  await writeFile(auditPath, `${JSON.stringify(audit.filter(item => !ids.includes(item.id)), null, 2)}\n`, "utf8");
  console.log(`Removed ${linked.length} contradicted findings after source checks and display fixes.`);
}
