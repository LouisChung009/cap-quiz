import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = ["chinese", "english", "math", "science", "social"];
const maxTemplateFrequency = 8;
const maxExplanationFrequency = 15;
const failures = [];
function answerIsNamed(row, solution) {
  const correctOption = String(row.options[row.answer]).toLowerCase();
  if (solution.toLowerCase().includes(correctOption)) return true;
  const letter = String.fromCharCode(65 + row.answer);
  const labels = row.subject === "英文"
    ? new RegExp(`(?:answer|correct answer)\\s*(?:is|:|=)?\\s*${letter}\\b`, "i")
    : new RegExp(`(?:答案|正解|正確答案|故選|所以選|選項)\\s*(?:是|為)?\\s*[「（(]?${letter}(?:[、，：:.。\\s「]|$)`);
  const chineseLabels = new RegExp(`(?:答案|正解|正確答案|故選|所以選|選項)\\s*(?:是|為)?\\s*[「（(]?${letter}(?:[、，：:.。\\s「]|$)`);
  return labels.test(solution) || (row.subject === "英文" && chineseLabels.test(solution));
}

for (const file of files) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  const templates = new Map();
  const explanations = new Map();
  const answerCounts = [0, 0, 0, 0];
  let answerRun = 0;
  let longestAnswerRun = 0;
  let previousAnswer = null;
  for (const row of rows) {
    if (Number.isInteger(row.answer) && row.answer >= 0 && row.answer <= 3) {
      answerCounts[row.answer] += 1;
      answerRun = row.answer === previousAnswer ? answerRun + 1 : 1;
      previousAnswer = row.answer;
      longestAnswerRun = Math.max(longestAnswerRun, answerRun);
    }
    const stem = String(row.question || "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
    let template = stem.replace(/^practice\s+[\d-]+:\s*/i, "").replace(/\d+/g, "#").replace(/「閱讀札記第#則」/g, "「閱讀札記」");
    if (file === "english") template = template.replace(/\b(?:amy|ben|cindy|david|emma|ella|frank|grace|henry|iris|jason|kate|leo|mia|noah|olivia|sam|tina|will|zoe)\b/gi, "[name]");
    templates.set(template, [...(templates.get(template) || []), row.id]);
    const explanation = String(row.explanation || "").replace(/\s+/g, " ").trim();
    explanations.set(explanation, [...(explanations.get(explanation) || []), row.id]);
    if (Number.isInteger(row.answer) && row.options?.[row.answer]) {
      const solution = `${explanation} ${(row.solutionSteps || []).join(" ")}`;
      if (!answerIsNamed(row, solution)) failures.push(`${row.id}: 解析未能明確指出標答`);
    }
  }
  if (rows.length === 1000 && (answerCounts.some(count => count !== 250) || longestAnswerRun > 5)) failures.push(`${file}: 答案位置分布或連續答案偏斜（${answerCounts.join("/")}；最長連續 ${longestAnswerRun}）`);
  const repeatedTemplates = [...templates.values()].filter(ids => ids.length > maxTemplateFrequency);
  const repeatedExplanations = [...explanations.values()].filter(ids => ids.length > maxExplanationFrequency);
  for (const ids of repeatedTemplates) failures.push(`${file}: 同一結構模板出現 ${ids.length} 次（上限 ${maxTemplateFrequency}），例如 ${ids.slice(0, 8).join(", ")}`);
  for (const ids of repeatedExplanations) failures.push(`${file}: 同一解析出現 ${ids.length} 次（上限 ${maxExplanationFrequency}），例如 ${ids.slice(0, 8).join(", ")}`);
  if (file === "english") {
    const auditedBatch = rows.filter(row => /^ENG-06(?:0[1-9]|1[0-9]|20)$/.test(row.id));
    if (auditedBatch.length !== 20) failures.push("英文 ENG-0601–0620: 審核批次題數不是 20");
    for (const row of auditedBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch = rows.filter(row => /^ENG-062[1-9]$|^ENG-0630$/.test(row.id));
    if (contextualBatch.length !== 10) failures.push("英文 ENG-0621–0630: 審核批次題數不是 10");
    for (const row of contextualBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const evidenceBatch = rows.filter(row => /^ENG-063[1-9]$|^ENG-0640$/.test(row.id));
    if (evidenceBatch.length !== 10) failures.push("英文 ENG-0631–0640: 審核批次題數不是 10");
    for (const row of evidenceBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const reasoningBatch = rows.filter(row => /^ENG-064[1-9]$|^ENG-0650$/.test(row.id));
    if (reasoningBatch.length !== 10) failures.push("英文 ENG-0641–0650: 審核批次題數不是 10");
    for (const row of reasoningBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const inferenceBatch = rows.filter(row => /^ENG-065[1-9]$|^ENG-0660$/.test(row.id));
    if (inferenceBatch.length !== 10) failures.push("英文 ENG-0651–0660: 審核批次題數不是 10");
    for (const row of inferenceBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const causeBatch = rows.filter(row => /^ENG-066[1-9]$|^ENG-0670$/.test(row.id));
    if (causeBatch.length !== 10) failures.push("英文 ENG-0661–0670: 審核批次題數不是 10");
    for (const row of causeBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const grammarBatch = rows.filter(row => /^ENG-067[1-9]$|^ENG-0680$/.test(row.id));
    if (grammarBatch.length !== 10) failures.push("英文 ENG-0671–0680: 審核批次題數不是 10");
    for (const row of grammarBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const quantifierBatch = rows.filter(row => /^ENG-068[1-9]$|^ENG-0690$/.test(row.id));
    if (quantifierBatch.length !== 10) failures.push("英文 ENG-0681–0690: 審核批次題數不是 10");
    for (const row of quantifierBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const finalEnglishBatch = rows.filter(row => /^ENG-069[1-9]$|^ENG-0700$/.test(row.id));
    if (finalEnglishBatch.length !== 10) failures.push("英文 ENG-0691–0700: 審核批次題數不是 10");
    for (const row of finalEnglishBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const inferenceGrammarBatch = rows.filter(row => /^ENG-070[1-9]$|^ENG-0710$/.test(row.id));
    if (inferenceGrammarBatch.length !== 10) failures.push("英文 ENG-0701–0710: 審核批次題數不是 10");
    for (const row of inferenceGrammarBatch) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
    }
    const evidenceBatch0711 = rows.filter(row => /^ENG-071[1-9]$|^ENG-0720$/.test(row.id));
    if (evidenceBatch0711.length !== 10) failures.push("英文 ENG-0711–0720: 審核批次題數不是 10");
    for (const row of evidenceBatch0711) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0721 = rows.filter(row => /^ENG-072[1-9]$|^ENG-073[0-9]$|^ENG-0740$/.test(row.id));
    if (contextualBatch0721.length !== 20) failures.push("英文 ENG-0721–0740: 審核批次題數不是 20");
    for (const row of contextualBatch0721) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const evidenceBatch0761 = rows.filter(row => /^ENG-076[1-9]$|^ENG-077[0-9]$|^ENG-0780$/.test(row.id));
    if (evidenceBatch0761.length !== 20) failures.push("英文 ENG-0761–0780: 審核批次題數不是 20");
    for (const row of evidenceBatch0761) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0781 = rows.filter(row => /^ENG-078[1-9]$|^ENG-079[0-9]$|^ENG-0800$/.test(row.id));
    if (contextualBatch0781.length !== 20) failures.push("英文 ENG-0781–0800: 審核批次題數不是 20");
    for (const row of contextualBatch0781) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0801 = rows.filter(row => /^ENG-080[1-9]$|^ENG-081[0-9]$|^ENG-0820$/.test(row.id));
    if (contextualBatch0801.length !== 20) failures.push("英文 ENG-0801–0820: 審核批次題數不是 20");
    for (const row of contextualBatch0801) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0821 = rows.filter(row => /^ENG-082[1-9]$|^ENG-083[0-9]$|^ENG-0840$/.test(row.id));
    if (contextualBatch0821.length !== 20) failures.push("英文 ENG-0821–0840: 審核批次題數不是 20");
    for (const row of contextualBatch0821) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0841 = rows.filter(row => /^ENG-084[1-9]$|^ENG-085[0-9]$|^ENG-0860$/.test(row.id));
    if (contextualBatch0841.length !== 20) failures.push("英文 ENG-0841–0860: 審核批次題數不是 20");
    for (const row of contextualBatch0841) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0861 = rows.filter(row => /^ENG-086[1-9]$|^ENG-087[0-9]$|^ENG-0880$/.test(row.id));
    if (contextualBatch0861.length !== 20) failures.push("英文 ENG-0861–0880: 審核批次題數不是 20");
    for (const row of contextualBatch0861) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0881 = rows.filter(row => /^ENG-088[1-9]$|^ENG-089[0-9]$|^ENG-0900$/.test(row.id));
    if (contextualBatch0881.length !== 20) failures.push("英文 ENG-0881–0900: 審核批次題數不是 20");
    for (const row of contextualBatch0881) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0901 = rows.filter(row => /^ENG-090[1-9]$|^ENG-091[0-9]$|^ENG-0920$/.test(row.id));
    if (contextualBatch0901.length !== 20) failures.push("英文 ENG-0901–0920: 審核批次題數不是 20");
    for (const row of contextualBatch0901) {
      if ((row.solutionSteps || []).some(step => /先讀完整題幹|並圈出直接提供的語境、時間或文法線索|答案為 [A-D]「|排除 [A-D]「/.test(step))) {
        failures.push(`${row.id}: 仍含通用解題步驟套語`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0921 = rows.filter(row => /^ENG-092[1-9]$|^ENG-093[0-9]$|^ENG-0940$/.test(row.id));
    if (contextualBatch0921.length !== 20) failures.push("英文 ENG-0921–0940: 審核批次題數不是 20");
    for (const row of contextualBatch0921) {
      if ((row.solutionSteps || []).some(step => /^找出 .+。$|^選 [^.]+。$/.test(step))) {
        failures.push(`${row.id}: 解題步驟仍停留在通用提示，需提供題目專屬推理`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0941 = rows.filter(row => /^ENG-094[1-9]$|^ENG-095[0-9]$|^ENG-0960$/.test(row.id));
    if (contextualBatch0941.length !== 20) failures.push("英文 ENG-0941–0960: 審核批次題數不是 20");
    for (const row of contextualBatch0941) {
      if ((row.solutionSteps || []).some(step => /^找出 .+。$|^選 [^.]+。$/.test(step))) {
        failures.push(`${row.id}: 解題步驟仍停留在通用提示，需提供題目專屬推理`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0961 = rows.filter(row => /^ENG-096[1-9]$|^ENG-097[0-9]$|^ENG-0980$/.test(row.id));
    if (contextualBatch0961.length !== 20) failures.push("英文 ENG-0961–0980: 審核批次題數不是 20");
    for (const row of contextualBatch0961) {
      if ((row.solutionSteps || []).some(step => /^找出 .+。$|^選 [^.]+。$/.test(step))) {
        failures.push(`${row.id}: 解題步驟仍停留在通用提示，需提供題目專屬推理`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
    const contextualBatch0981 = rows.filter(row => /^ENG-098[1-9]$|^ENG-099[0-9]$|^ENG-1000$/.test(row.id));
    if (contextualBatch0981.length !== 20) failures.push("英文 ENG-0981–1000: 審核批次題數不是 20");
    for (const row of contextualBatch0981) {
      if ((row.solutionSteps || []).some(step => /^找出 .+。$|^選 [^.]+。$/.test(step))) {
        failures.push(`${row.id}: 解題步驟仍停留在通用提示，需提供題目專屬推理`);
      }
      if ((row.solutionSteps || []).length < 3 || new Set(row.solutionSteps).size !== row.solutionSteps.length) {
        failures.push(`${row.id}: 解題步驟不足或重複`);
      }
    }
  }
  if (!repeatedTemplates.length && !repeatedExplanations.length) console.log(`${file}: 題型模板與解析重複度通過`);
}

const mission = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const science113Q49 = mission.find(item => item.source?.year === 113 && item.source?.questionNumber === 49 && item.subject === "自然");
if (!science113Q49 || /(?:每年|一年一|五次|五個年度)/.test(science113Q49.question)) failures.push("113 自然第49題：題幹不可直接提示週期長度或週期數");
const genericMissionExplanation = /依題目所給條件計算或判斷|最完整符合題幹所給的條件與證據|這個選項最完整符合題幹所給的條件與證據|以題幹所提供的文字條件逐項核對|最符合題意|符合題幹所提供的時間、地點、制度、數據或因果條件|作答時應以題幹.{0,20}逐項核對|正確答案索引為.{0,80}官方題圖|本題為官方非選擇題.{0,100}不宜當作標準答案|本題須對照官方頁圖.{0,60}判斷|此選項必須配合前台顯示的官方頁圖.{0,60}|再與其餘選項.{0,80}不符合題幹指定條件/;
const trailingFigureLabelInOption = /(?:圖|表)\s*[（(]\s*[一二三四五六七八九十百\d]+\s*[）)]\s*$/;
for (const row of mission.filter(item => item.sourceType === "官方歷屆真題")) {
  for (const option of row.options || []) {
    if (trailingFigureLabelInOption.test(option)) failures.push(`${row.id}: 選項疑似混入圖表標籤「${option}」`);
  }
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
