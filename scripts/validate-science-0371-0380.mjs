import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rows = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"));
const expected = [
  [0, "乙面測得的滑動摩擦力較大", "摩擦力與接觸面", "理化"],
  [1, "把有機物分解並使養分回到環境", "生態系中的分解者", "生物"],
  [2, "由海洋吹向陸地", "海陸風與日間熱差", "地球科學"],
  [3, "不產生感應電流", "電磁感應與發電", "理化"],
  [0, "因蒸散拉力減弱而下降", "蒸散與水分運輸", "生物"],
  [1, "10 g", "溶液濃度質量百分率", "理化"],
  [2, "配子形成與受精時遺傳物質組合不同", "有性生殖與遺傳多樣性", "生物"],
  [3, "搬運能力下降，較大顆粒先沉積", "河流侵蝕與沉積", "地球科學"],
  [0, "紅色", "顏色與光的吸收反射", "理化"],
  [1, "肺靜脈", "人體循環與血管功能", "生物"],
];
const requiredEvidence = new Map([
  ["SCI-0371", ["彈簧秤", "等速滑動", "3.4 牛頓", "2.0 牛頓"]],
  ["SCI-0376", ["200 公克", "5%", "200×0.05", "10 公克"]],
  ["SCI-0379", ["純紅色手電筒", "白紙", "呈紅色"]],
  ["SCI-0380", ["肺部流出", "左心房", "肺靜脈"]],
]);
const failures = [];
for (let offset = 0; offset < expected.length; offset++) {
  const id = `SCI-${String(371 + offset).padStart(4, "0")}`;
  const item = rows.find(row => row.id === id);
  const [answer, correctOption, knowledgePoint, unit] = expected[offset];
  if (!item) {
    failures.push(`${id}: missing`);
    continue;
  }
  if (item.answer !== answer || item.options?.length !== 4 || item.options?.[answer] !== correctOption) failures.push(`${id}: answer/options mismatch`);
  if (new Set(item.options || []).size !== 4) failures.push(`${id}: duplicate options`);
  if (item.knowledgePoint !== knowledgePoint || item.unit !== unit) failures.push(`${id}: unit/knowledge-point mismatch`);
  if (!item.explanation || item.solutionSteps?.length < 3 || !item.teacherTip) failures.push(`${id}: incomplete worked explanation`);
  const evidence = `${item.question} ${item.explanation} ${item.solutionSteps.join(" ")}`;
  if (requiredEvidence.has(id) && requiredEvidence.get(id).some(clue => !evidence.includes(clue))) failures.push(`${id}: applied evidence/context missing`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Science SCI-0371–0380 answer keys, evidence, metadata, and worked explanations passed.");
