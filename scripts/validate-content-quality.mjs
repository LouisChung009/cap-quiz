import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const maxTemplateFrequency = 10;
const maxExplanationFrequency = 15;
const failures = [];
function answerIsNamed(row, solution) {
  const correctOption = String(row.options[row.answer]).toLowerCase();
  if (solution.toLowerCase().includes(correctOption)) return true;
  const letter = String.fromCharCode(65 + row.answer);
  const labels = row.subject === "英文"
    ? new RegExp(`(?:answer|correct answer)\\s*(?:is|:|=)?\\s*${letter}\\b`, "i")
    : new RegExp(`(?:答案|正解|正確答案|故選|所以選|選項)\\s*(?:是|為)?\\s*[「（(]?${letter}(?:[、，：:.。\\s「]|$)`);
  return labels.test(solution);
}

for (const file of files) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  const templates = new Map();
  const explanations = new Map();
  for (const row of rows) {
    const stem = String(row.question || "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
    const template = stem.replace(/^practice\s+[\d-]+:\s*/i, "").replace(/\d+/g, "#").replace(/「閱讀札記第#則」/g, "「閱讀札記」");
    templates.set(template, [...(templates.get(template) || []), row.id]);
    const explanation = String(row.explanation || "").replace(/\s+/g, " ").trim();
    explanations.set(explanation, [...(explanations.get(explanation) || []), row.id]);
    if (Number.isInteger(row.answer) && row.options?.[row.answer]) {
      const solution = `${explanation} ${(row.solutionSteps || []).join(" ")}`;
      if (!answerIsNamed(row, solution)) failures.push(`${row.id}: 解析未能明確指出標答`);
    }
  }
  const repeatedTemplates = [...templates.values()].filter(ids => ids.length > maxTemplateFrequency);
  const repeatedExplanations = [...explanations.values()].filter(ids => ids.length > maxExplanationFrequency);
  for (const ids of repeatedTemplates) failures.push(`${file}: 同一結構模板出現 ${ids.length} 次（上限 ${maxTemplateFrequency}），例如 ${ids.slice(0, 8).join(", ")}`);
  for (const ids of repeatedExplanations) failures.push(`${file}: 同一解析出現 ${ids.length} 次（上限 ${maxExplanationFrequency}），例如 ${ids.slice(0, 8).join(", ")}`);
  if (!repeatedTemplates.length && !repeatedExplanations.length) console.log(`${file}: 題型模板與解析重複度通過`);
}

const mission = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const genericMissionExplanation = /最完整符合題幹所給的條件與證據|以題幹所提供的文字條件逐項核對|最符合題意|符合題幹所提供的時間、地點、制度、數據或因果條件|作答時應以題幹.{0,20}逐項核對|正確答案索引為.{0,80}官方題圖|本題為官方非選擇題.{0,100}不宜當作標準答案/;
for (const row of mission.filter(item => item.sourceType === "官方歷屆真題")) {
  if (genericMissionExplanation.test(String(row.explanation || ""))) failures.push(`${row.id}: 官方真題解析仍為空泛套語`);
  if (row.answerKeyReview && /待處理|未核對|未確認|尚未|疑似/.test(String(row.answerKeyReview.status || ""))) failures.push(`${row.id}: 標答或題文仍有教師覆核待處理事項`);
  if (Number.isInteger(row.answer) && row.options?.[row.answer] && !answerIsNamed(row, `${row.explanation} ${(row.solutionSteps || []).join(" ")}`)) {
    failures.push(`${row.id}: 官方真題解析未能明確指出標答`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`品質門檻未通過：${failures.length} 項`);
  process.exit(1);
}
console.log("五科題型模板、解析重複度與正解引用檢查通過。");
