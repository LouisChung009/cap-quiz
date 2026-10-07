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
  const normalize = value => String(value).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
  if (normalize(solution).includes(normalize(correctOption))) return true;
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
    const robotExperience = rows.find(row => row.id === "ENG-0724");
    if (robotExperience?.options[robotExperience.answer] !== "have built" || !robotExperience.explanation.includes("members 是複數")) {
      failures.push("ENG-0724: 現在完成式主詞一致與正解不符");
    }
    const labComparison = rows.find(row => row.id === "ENG-0731");
    if (!labComparison?.question.includes("newer microscopes") || !labComparison.question.includes("digital booking screen")) {
      failures.push("ENG-0731: modern 的比較缺少明確的新式設備證據");
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
const science113Q31to40 = Array.from({ length: 10 }, (_, index) => {
  const questionNumber = index + 31;
  return mission.find(item => item.source?.year === 113 && item.source?.questionNumber === questionNumber && item.subject === "自然");
});
const science113Q31to40Answers = [3, 3, 3, 1, 2, 1, 1, 3, 2, 1];
if (science113Q31to40.some((row, index) => !row || row.answer !== science113Q31to40Answers[index] || row.options?.length !== 4 || (row.solutionSteps || []).length < 3 || !row.teacherTip || !row.explanation)) {
  failures.push("113 自然第31–40題：題目、官方答案、四選項或專屬解析欄位缺漏");
}
for (const questionNumber of [31, 35, 36, 40]) {
  const row = science113Q31to40[questionNumber - 31];
  if (!row?.requiresImage || !row.questionImages?.length || !row.questionImages.every(image => row.questionImage === image)) {
    failures.push(`113 自然第${questionNumber}題：必要原卷圖缺漏或未完整設定`);
  }
}
for (const questionNumber of [32, 33, 34, 37, 38, 39]) {
  const row = science113Q31to40[questionNumber - 31];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) {
    failures.push(`113 自然第${questionNumber}題：文字已包含作答資料，不應依賴重複原卷截圖`);
  }
}
const science113Q31to40ImagePaths = [
  "./assets/official-exams/113-science-q31-classroom-map.png",
  "./assets/official-exams/113-science-q35-intensity-map.png",
  "./assets/official-exams/113-science-q36-lens-ray-options.png",
  "./assets/official-exams/113-science-q40-copper-plating-options.png"
];
const serviceWorker = await readFile(join(root, "sw.js"), "utf8");
for (const imagePath of science113Q31to40ImagePaths) {
  if (!serviceWorker.includes(imagePath)) failures.push(`113 自然必要圖表未納入離線快取：${imagePath}`);
}
const science113Q41to50 = Array.from({ length: 10 }, (_, index) => {
  const questionNumber = index + 41;
  return mission.find(item => item.source?.year === 113 && item.source?.questionNumber === questionNumber && item.subject === "自然");
});
const science113Q41to50Answers = [3, 2, 3, 0, 1, 3, 0, 2, 2, 2];
if (science113Q41to50.some((row, index) => !row || row.answer !== science113Q41to50Answers[index] || row.options?.length !== 4 || (row.solutionSteps || []).length < 3 || !row.teacherTip || !row.explanation)) {
  failures.push("113 自然第41–50題：題目、官方答案、四選項或專屬解析欄位缺漏");
}
const science113Q49 = science113Q41to50[8];
if (!science113Q49?.requiresImage || !science113Q49.questionImages?.includes("./assets/official-exams/113-science-q49-co2-cycle-graph.png") || !serviceWorker.includes("./assets/official-exams/113-science-q49-co2-cycle-graph.png")) {
  failures.push("113 自然第49題：必要 CO₂ 週期圖或離線快取缺漏");
}
for (const questionNumber of [41, 42, 43, 44, 45, 46, 47, 48, 50]) {
  const row = science113Q41to50[questionNumber - 41];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) {
    failures.push(`113 自然第${questionNumber}題：已完整文字化的資料不應附加重複原卷截圖`);
  }
}
const english113Q1to10 = Array.from({ length: 10 }, (_, index) => {
  const questionNumber = index + 1;
  return mission.find(item => item.source?.year === 113 && item.source?.questionNumber === questionNumber && item.subject === "英文");
});
const english113Q1to10Answers = [0, 2, 1, 1, 3, 3, 1, 3, 2, 3];
if (english113Q1to10.some((row, index) => !row || row.answer !== english113Q1to10Answers[index] || row.options?.length !== 4 || (row.solutionSteps || []).length < 3 || !row.teacherTip || (row.relatedWords || []).length < 2)) {
  failures.push("113 英文第1–10題：題目、官方答案、四選項或英文教學欄位缺漏");
}
const english113Q1 = english113Q1to10[0];
const questionImageRenderer = await readFile(join(root, "app.js"), "utf8");
const q1Crop = english113Q1?.imageCrop;
if (!english113Q1?.requiresImage || english113Q1.questionImage !== "./assets/official-exams/113-english-p2.webp" || !english113Q1.questionImages?.includes(english113Q1.questionImage) || !q1Crop || q1Crop.sourceWidth !== 869 || q1Crop.sourceHeight !== 1199 || q1Crop.x !== 510 || q1Crop.y !== 112 || q1Crop.width !== 282 || q1Crop.height !== 260 || !questionImageRenderer.includes("function renderQuestionImage") || !questionImageRenderer.includes("question-image-crop")) {
  failures.push("113 英文第1題：應裁切顯示必要情境插圖，而非整頁試卷掃描");
}
for (let questionNumber = 2; questionNumber <= 10; questionNumber++) {
  const row = english113Q1to10[questionNumber - 1];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 英文第${questionNumber}題：文字題不應附加多餘試卷圖片`);
}
const english113Q7Explanation = String(english113Q1to10[6]?.explanation || "");
if (!english113Q7Explanation.includes("完整句子是 and so do I") || english113Q7Explanation.includes("and so do I?")) {
  failures.push("113 英文第7題：附和句解釋不得含混或誤加問號");
}
for (const imagePath of ["./assets/official-exams/113-english-p2.webp"]) {
  if (!serviceWorker.includes(imagePath)) failures.push(`113 英文第1題插圖離線相依未快取：${imagePath}`);
}
const english113Q11to20 = Array.from({ length: 10 }, (_, index) => {
  const questionNumber = index + 11;
  return mission.find(item => item.source?.year === 113 && item.source?.questionNumber === questionNumber && item.subject === "英文");
});
const english113Q11to20Answers = [2, 0, 0, 0, 2, 3, 2, 3, 0, 2];
if (english113Q11to20.some((row, index) => !row || row.answer !== english113Q11to20Answers[index] || row.options?.length !== 4 || (row.solutionSteps || []).length < 3 || !row.teacherTip || (row.relatedWords || []).length < 2)) {
  failures.push("113 英文第11–20題：題目、官方答案、四選項或英文教學欄位缺漏");
}
for (let questionNumber = 11; questionNumber <= 20; questionNumber++) {
  const row = english113Q11to20[questionNumber - 11];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 英文第${questionNumber}題：自足文字題不應附加重複試卷圖片`);
}
if (!String(english113Q11to20[9]?.explanation || "").includes("等於 my dentist")) {
  failures.push("113 英文第20題：名詞性所有格 mine 的指涉解析缺漏");
}
const english113Q21to30 = Array.from({ length: 10 }, (_, index) => {
  const questionNumber = index + 21;
  return mission.find(item => item.source?.year === 113 && item.source?.questionNumber === questionNumber && item.subject === "英文");
});
const english113Q21to30Answers = [1, 3, 2, 2, 1, 0, 3, 1, 1, 0];
if (english113Q21to30.some((row, index) => !row || row.answer !== english113Q21to30Answers[index] || row.options?.length !== 4 || (row.solutionSteps || []).length < 3 || !row.teacherTip || (row.relatedWords || []).length < 2)) {
  failures.push("113 英文第21–30題：題目、官方答案、四選項或英文教學欄位缺漏");
}
for (const [questionNumber, terms] of [
  [22, ["Jason was hungry", "working late in the office", "I forgot my keys"]],
  [23, ["Jason was hungry", "I forgot my keys", "the police didn’t believe him"]],
  [24, ["white bread 10:30am", "bagels 11:30am", "challah 3:30pm", "farm bread 4:30pm"]],
  [25, ["half price after 5pm", "after 7pm on Saturdays and Sundays", "7:30am–9pm", "7:30am–8pm"]],
  [26, ["free Festival Bus", "Goat Street Station", "Garden Square", "Fox Street"]],
  [27, ["free Festival Bus", "Garden Square", "Koala Street Station", "Bus No. 157"]],
  [28, ["one small fish", "big knife", "lending me one of your many ducks"]],
  [29, ["one small fish", "big knife", "lending me one of your many ducks"]],
  [30, ["Chen sees himself as a doctor", "health center", "gift from a teacher"]]
]) {
  const row = english113Q21to30[questionNumber - 21];
  if (!row || terms.some(term => !`${row.question} ${(row.options || []).join(" ")}`.includes(term))) failures.push(`113 英文第${questionNumber}題：題幹與選項缺少必要線索`);
}
for (const questionNumber of [21, 22, 23, 24, 25, 26, 28, 29, 30]) {
  const row = english113Q21to30[questionNumber - 21];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 英文第${questionNumber}題：文字材料完整，不應附加整頁試卷截圖`);
}
const english113Q27 = english113Q21to30[6];
const q27Crop = english113Q27?.imageCrop;
if (!english113Q27?.requiresImage || english113Q27.questionImage !== "./assets/official-exams/113-english-p6.webp" || !english113Q27.questionImages?.includes(english113Q27.questionImage) || !q27Crop || q27Crop.sourceWidth !== 869 || q27Crop.sourceHeight !== 1199 || q27Crop.x !== 108 || q27Crop.y !== 390 || q27Crop.width !== 669 || q27Crop.height !== 390 || !questionImageRenderer.includes("--crop-ratio:")) {
  failures.push("113 英文第27題：地圖題必須裁切顯示街區圖，不可露出整頁試卷截圖");
}
for (const imagePath of ["./assets/official-exams/113-english-p6.webp"]) {
  if (!serviceWorker.includes(imagePath)) failures.push(`113 英文第27題地圖離線相依未快取：${imagePath}`);
}
if (!science113Q49 || /(?:每年|一年一|五次|五個年度)/.test(science113Q49.question)) failures.push("113 自然第49題：題幹不可直接提示週期長度或週期數");
const english113Q31to43 = mission.filter(row => row.subject === "英文" && row.source?.year === 113 && row.source?.questionNumber >= 31 && row.source?.questionNumber <= 43).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
const english113Q31to43Keys = [3, 0, 0, 1, 0, 1, 1, 2, 2, 0, 1, 1, 3];
if (english113Q31to43.length !== 13) failures.push("113 英文第31–43題：審核批次題數不是 13");
for (const [index, row] of english113Q31to43.entries()) {
  const questionNumber = index + 31;
  if (row.answer !== english113Q31to43Keys[index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip || (row.relatedWords || []).length < 2) failures.push(`113 英文第${questionNumber}題：答案、四選項或解題教學欄位不完整`);
}
for (const [questionNumber, terms] of [
  [31, ["Cotoha", "teacher", "dream of studying science", "brought back"]],
  [32, ["Cotoha", "doctor", "magic"]],
  [33, ["Habibi & Hawara", "Austria", "Syrian", "start a new life"]],
  [34, ["buy the restaurant"]],
  [35, ["beg to differ"]],
  [36, ["advocate", "should be done"]],
  [37, ["extinct frog", "babies", "problem"]],
  [38, ["Dr. Solomon Wang", "throwing good money after bad"]],
  [39, ["seen anything come out of it", "few dead frog eggs"]],
  [40, ["1918", "not a new idea"]],
  [41, ["started social distancing", "earlier"]],
  [42, ["stopped social distancing too soon", "deaths climbed again"]],
  [43, ["For example", "schools were closed"]]
]) {
  const row = english113Q31to43[questionNumber - 31];
  if (!row || terms.some(term => !`${row.question} ${(row.options || []).join(" ")}`.toLowerCase().includes(term.toLowerCase()))) failures.push(`113 英文第${questionNumber}題：原卷文章或題目線索缺漏`);
}
for (const questionNumber of [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 42, 43]) {
  const row = english113Q31to43[questionNumber - 31];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 英文第${questionNumber}題：文字材料完整，不應附加整頁試卷截圖`);
}
const english113Q41 = english113Q31to43[10];
if (!english113Q41?.requiresImage || english113Q41.questionImage !== "./assets/official-exams/113-english-q41-chart.png" || !english113Q41.questionImages?.includes(english113Q41.questionImage) || !serviceWorker.includes("./assets/official-exams/113-english-q41-chart.png")) failures.push("113 英文第41題：必要死亡率圖表或離線快取缺漏");
const social113Q1to10 = mission.filter(row => row.subject === "社會" && row.source?.year === 113 && row.source?.questionNumber >= 1 && row.source?.questionNumber <= 10).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social113Q1to10.length !== 10) failures.push("113 社會第1–10題：審核批次題數不是 10");
for (const [index, row] of social113Q1to10.entries()) {
  if (row.answer !== [1, 0, 1, 0, 1, 2, 3, 2, 0, 2][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`113 社會第${index + 1}題：答案、四選項或解題教學欄位不完整`);
}
const social113Q7 = social113Q1to10[6];
const social113Q7Crop = social113Q7?.imageCrop;
if (!social113Q7?.requiresImage || social113Q7.questionImage !== "./assets/official-exams/113-social-p3.webp" || !social113Q7.questionImages?.includes(social113Q7.questionImage) || !social113Q7Crop || social113Q7Crop.sourceWidth !== 869 || social113Q7Crop.sourceHeight !== 1199 || social113Q7Crop.x !== 96 || social113Q7Crop.y !== 456 || social113Q7Crop.width !== 542 || social113Q7Crop.height !== 112) failures.push("113 社會第7題：原卷文字字形選項圖缺漏或裁切設定錯誤");
if (!serviceWorker.includes("./assets/official-exams/113-social-p2.webp") || !serviceWorker.includes("./assets/official-exams/113-social-p3.webp")) failures.push("113 社會第3、4、7題：原卷底圖離線快取缺漏");
for (const questionNumber of [1, 2, 5, 6, 8, 9, 10]) {
  const row = social113Q1to10[questionNumber - 1];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 社會第${questionNumber}題：題幹已含完整文字材料，不應附加整頁試卷截圖`);
}
const social113Q11to20 = mission.filter(row => row.subject === "社會" && row.source?.year === 113 && row.source?.questionNumber >= 11 && row.source?.questionNumber <= 20).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social113Q11to20.length !== 10) failures.push("113 社會第11–20題：審核批次題數不是 10");
for (const [index, row] of social113Q11to20.entries()) {
  if (row.answer !== [2, 1, 2, 3, 2, 2, 0, 2, 3, 0][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`113 社會第${index + 11}題：答案、四選項或解題教學欄位不完整`);
}
for (const [questionNumber, pageNumber] of [[15, 5], [16, 5], [17, 5], [18, 5], [20, 6]]) {
  const row = social113Q11to20[questionNumber - 11];
  if (!row?.requiresImage || !row.questionImage?.includes(`113-social-q${String(questionNumber).padStart(2, "0")}-`) || !serviceWorker.includes(`./assets/official-exams/113-social-p${pageNumber}.webp`)) failures.push(`113 社會第${questionNumber}題：必要圖表或其原卷底圖未快取`);
}
for (const questionNumber of [11, 12, 13, 14, 19]) {
  const row = social113Q11to20[questionNumber - 11];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 社會第${questionNumber}題：題幹文字已足夠，不應附加整頁試卷截圖`);
}
const social113Q21to30 = mission.filter(row => row.subject === "社會" && row.source?.year === 113 && row.source?.questionNumber >= 21 && row.source?.questionNumber <= 30).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social113Q21to30.length !== 10) failures.push("113 社會第21–30題：審核批次題數不是 10");
for (const [index, row] of social113Q21to30.entries()) {
  if (row.answer !== [1, 2, 1, 0, 1, 2, 0, 1, 0, 2][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`113 社會第${index + 21}題：答案、四選項或解題教學欄位不完整`);
}
for (const questionNumber of [22, 26, 28, 29]) {
  const row = social113Q21to30[questionNumber - 21];
  if (!row?.requiresImage || !row.questionImage?.endsWith(".svg")) failures.push(`113 社會第${questionNumber}題：必要原圖缺漏`);
}
for (const questionNumber of [21, 23, 24, 25, 27, 30]) {
  const row = social113Q21to30[questionNumber - 21];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 社會第${questionNumber}題：文字材料已足夠，不應附加整頁試卷截圖`);
}
for (const row of mission.filter(item => item.subject === "社會" && item.source?.year === 113 && item.questionImage?.endsWith(".svg"))) {
  const svgPath = join(root, row.questionImage.replace(/^\.\//, ""));
  try {
    const svg = await readFile(svgPath, "utf8");
    for (const [, dependency] of svg.matchAll(/<image[^>]+href=["']([^"']+)["']/g)) {
      if (!serviceWorker.includes(`./assets/official-exams/${dependency}`)) failures.push(`${row.id}: SVG 圖片底圖未加入離線快取 ${dependency}`);
    }
  } catch {
    failures.push(`${row.id}: 無法讀取必要圖片資產 ${row.questionImage}`);
  }
}
const social113Q31to40 = mission.filter(row => row.subject === "社會" && row.source?.year === 113 && row.source?.questionNumber >= 31 && row.source?.questionNumber <= 40).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social113Q31to40.length !== 10) failures.push("113 社會第31–40題：審核批次題數不是 10");
for (const [index, row] of social113Q31to40.entries()) {
  if (row.answer !== [3, 0, 3, 3, 1, 1, 2, 3, 2, 1][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`113 社會第${index + 31}題：答案、四選項或解題教學欄位不完整`);
}
const social113Q34 = social113Q31to40[3];
if (!social113Q34 || !["前年", "113年", "未滿20歲", "年滿20歲", "法定代理人"].every(term => social113Q34.question.includes(term)) || social113Q34.requiresImage || social113Q34.questionImage || social113Q34.questionImages?.length) failures.push("113 社會第34題：投票時間線、認養年齡規定或文字題呈現缺漏");
for (const questionNumber of [32, 33, 34, 36, 38, 39]) {
  const row = social113Q31to40[questionNumber - 31];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 社會第${questionNumber}題：完整文字題不應附加試卷截圖`);
}
const social113Q41to50 = mission.filter(row => row.subject === "社會" && row.source?.year === 113 && row.source?.questionNumber >= 41 && row.source?.questionNumber <= 50).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social113Q41to50.length !== 10) failures.push("113 社會第41–50題：審核批次題數不是 10");
for (const [index, row] of social113Q41to50.entries()) {
  if (row.answer !== [0, 3, 0, 2, 0, 1, 3, 2, 0, 3][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`113 社會第${index + 41}題：答案、四選項或解題教學欄位不完整`);
}
for (const questionNumber of [44, 45]) {
  const row = social113Q41to50[questionNumber - 41];
  if (!["巫童", "邪靈", "遺棄", "凌虐", "志願團體"].every(term => row?.question.includes(term))) failures.push(`113 社會第${questionNumber}題：共用閱讀材料遺漏巫童遭遇與保護行動`);
}
for (const questionNumber of [46, 47, 48]) {
  const row = social113Q41to50[questionNumber - 41];
  if (!["微型電動二輪車", "2022年11月30日", "二年", "領用並懸掛車牌"].every(term => row?.question.includes(term))) failures.push(`113 社會第${questionNumber}題：共用修法材料的施行時間或過渡規定缺漏`);
}
for (const questionNumber of [41, 42, 43, 44, 45, 46, 47, 48]) {
  const row = social113Q41to50[questionNumber - 41];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 社會第${questionNumber}題：已提供完整文字材料，不應顯示整頁掃描`);
}
for (const questionNumber of [49, 50]) {
  const row = social113Q41to50[questionNumber - 41];
  if (!row?.requiresImage || row.questionImage !== "./assets/official-exams/113-social-q49-seat-change-maps.svg" || !row.questionImages?.includes(row.questionImage)) failures.push(`113 社會第${questionNumber}題：共用眾議院席次地圖缺漏`);
}
const social113Q51to54 = mission.filter(row => row.subject === "社會" && row.source?.year === 113 && row.source?.questionNumber >= 51 && row.source?.questionNumber <= 54).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social113Q51to54.length !== 4) failures.push("113 社會第51–54題：審核批次題數不是 4");
for (const [index, row] of social113Q51to54.entries()) {
  if (row.answer !== [1, 3, 1, 2][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`113 社會第${index + 51}題：答案、四選項或解題教學欄位不完整`);
}
const social113Q51 = social113Q51to54[0];
if (!social113Q51?.requiresImage || social113Q51.questionImage !== "./assets/official-exams/113-social-q51-taiwan-population-map.svg" || !social113Q51.questionImages?.includes(social113Q51.questionImage)) failures.push("113 社會第51題：台灣人口分布圖缺漏");
for (const questionNumber of [52, 53, 54]) {
  const row = social113Q51to54[questionNumber - 51];
  if (!["反共抗俄", "健康寫實", "1980年代", "兒子的大玩偶", "削蘋果事件"].every(term => row?.question.includes(term))) failures.push(`113 社會第${questionNumber}題：共用戰後電影史閱讀材料不完整`);
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`113 社會第${questionNumber}題：完整文字材料不應附加整頁試卷掃描`);
}
const social111Q11to20 = mission.filter(row => row.subject === "社會" && row.source?.year === 111 && row.source?.questionNumber >= 11 && row.source?.questionNumber <= 20).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social111Q11to20.length !== 10) failures.push("111 社會第11–20題：審核批次題數不是 10");
for (const [index, row] of social111Q11to20.entries()) {
  if (row.answer !== [1, 0, 1, 2, 3, 2, 1, 2, 2, 0][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`111 社會第${index + 11}題：答案、四選項或解題教學欄位不完整`);
}
for (const [questionNumber, asset] of [[12, "111-social-q12-fertility-chart.png"], [15, "111-social-q15-us-climate-map.png"], [16, "111-social-q16-borneo-forest.png"], [18, "111-social-q18-capes.png"]]) {
  const row = social111Q11to20[questionNumber - 11];
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${asset}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(`./assets/official-exams/${asset}`)) failures.push(`111 社會第${questionNumber}題：必要原卷圖表或離線快取缺漏`);
}
for (const questionNumber of [11, 13, 14, 17, 19, 20]) {
  const row = social111Q11to20[questionNumber - 11];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`111 社會第${questionNumber}題：文字材料完整，不應附加整頁試卷掃描`);
}
for (const term of ["王大軒", "李大賢", "陳小涵", "林小潔"]) if (!social111Q11to20[2]?.question.includes(term)) failures.push(`111 社會第13題：同學資料表缺少 ${term}`);
if (!["艋舺", "龍山寺", "打狗", "220 圓"].every(term => social111Q11to20[9]?.question.includes(term))) failures.push("111 社會第20題：歷史報紙節錄缺少年代地名或用語線索");
const social111Q21to30 = mission.filter(row => row.subject === "社會" && row.source?.year === 111 && row.source?.questionNumber >= 21 && row.source?.questionNumber <= 30).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social111Q21to30.length !== 10) failures.push("111 社會第21–30題：審核批次題數不是 10");
for (const [index, row] of social111Q21to30.entries()) {
  if (row.answer !== [1, 3, 3, 1, 2, 1, 3, 3, 3, 1][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`111 社會第${index + 21}題：答案、四選項或解題教學欄位不完整`);
}
for (const [questionNumber, asset] of [[26, "111-social-q26-alpine-profile.png"], [27, "111-social-q27-port-map.png"], [28, "111-social-q28-population-map.png"]]) {
  const row = social111Q21to30[questionNumber - 21];
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${asset}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(`./assets/official-exams/${asset}`)) failures.push(`111 社會第${questionNumber}題：必要原卷圖表或離線快取缺漏`);
}
for (const questionNumber of [21, 22, 23, 24, 25, 29, 30]) {
  const row = social111Q21to30[questionNumber - 21];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`111 社會第${questionNumber}題：文字題不應附加整頁試卷掃描`);
}
for (const term of ["通過關於國家領袖思想的考試", "2015年約12", "2020年約20", "倒數第5", "倒數第4"]) if (!social111Q21to30[2]?.question.includes(term)) failures.push(`111 社會第23題：記者證與新聞自由資料缺少 ${term}`);
for (const term of ["世界氣象組織", "連續 5日", "5℃", "34.3", "39.3"]) if (!`${social111Q21to30[8]?.question || ""} ${(social111Q21to30[8]?.options || []).join(" ")}`.includes(term)) failures.push(`111 社會第29題：熱浪定義或氣溫表線索缺少 ${term}`);
const social111Q31to40 = mission.filter(row => row.subject === "社會" && row.source?.year === 111 && row.source?.questionNumber >= 31 && row.source?.questionNumber <= 40).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social111Q31to40.length !== 10) failures.push("111 社會第31–40題：審核批次題數不是 10");
for (const [index, row] of social111Q31to40.entries()) {
  if (row.answer !== [3, 0, 0, 3, 3, 3, 2, 2, 2, 3][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`111 社會第${index + 31}題：答案、四選項或解題教學欄位不完整`);
}
for (const [questionNumber, asset] of [[31, "111-social-q31-trade-stages.png"], [33, "111-social-q33-meeting-flow.png"], [36, "111-social-q36-shopping-map.png"], [38, "111-social-q38-language-coin.png"], [39, "111-social-q39-gender-charts.png"], [40, "111-social-q40-africa-trade-article.png"]]) {
  const row = social111Q31to40[questionNumber - 31];
  if (!row?.requiresImage || row.questionImage !== `./assets/official-exams/${asset}` || !row.questionImages?.includes(row.questionImage) || !serviceWorker.includes(`./assets/official-exams/${asset}`)) failures.push(`111 社會第${questionNumber}題：必要原卷圖表或離線快取缺漏`);
}
for (const questionNumber of [32, 34, 35, 37]) {
  const row = social111Q31to40[questionNumber - 31];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`111 社會第${questionNumber}題：文字材料完整，不應附加整頁試卷掃描`);
}
for (const term of ["權宜問題", "秩序問題"]) if (!`${social111Q31to40[2]?.explanation || ""} ${(social111Q31to40[2]?.solutionSteps || []).join(" ")}`.includes(term)) failures.push(`111 社會第33題：議事流程辨析缺少 ${term}`);
for (const term of ["貿易", "關稅", "洲外"]) if (!`${social111Q31to40[9]?.question || ""} ${social111Q31to40[9]?.explanation || ""} ${(social111Q31to40[9]?.solutionSteps || []).join(" ")}`.includes(term)) failures.push(`111 社會第40題：區域貿易材料分析缺少 ${term}`);
const social111Q41to50 = mission.filter(row => row.subject === "社會" && row.source?.year === 111 && row.source?.questionNumber >= 41 && row.source?.questionNumber <= 50).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social111Q41to50.length !== 10) failures.push("111 社會第41–50題：審核批次題數不是 10");
for (const [index, row] of social111Q41to50.entries()) {
  if (row.answer !== [1, 3, 0, 1, 1, 0, 0, 1, 2, 3][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`111 社會第${index + 41}題：答案、四選項或解題教學欄位不完整`);
}
for (const [questionNumber, assets] of [[41, ["111-social-q41-world-map.png"]], [42, ["111-social-q42-trade-diagram.png"]], [43, ["111-social-q43-propaganda-cartoon.png"]], [46, ["111-social-q46-diqian-taiwan-map.png"]], [47, ["111-social-q47-japanese-landuse-map.png"]], [48, ["111-social-q47-japanese-landuse-map.png", "111-social-q48-water-map.png"]]]) {
  const row = social111Q41to50[questionNumber - 41];
  for (const asset of assets) if (!row?.requiresImage || !row.questionImages?.includes(`./assets/official-exams/${asset}`) || !serviceWorker.includes(`./assets/official-exams/${asset}`)) failures.push(`111 社會第${questionNumber}題：必要原卷圖表或離線快取缺漏 ${asset}`);
}
for (const questionNumber of [44, 45, 49, 50]) {
  const row = social111Q41to50[questionNumber - 41];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`111 社會第${questionNumber}題：材料已轉為完整文字，不應附加整頁試卷掃描`);
}
for (const term of ["1855年", "裕鐸", "1859年", "泉州人", "物價上漲"]) for (const questionNumber of [44, 45]) if (!social111Q41to50[questionNumber - 41]?.question.includes(term)) failures.push(`111 社會第${questionNumber}題：共用史料缺少 ${term}`);
for (const term of ["1921年", "墘", "河流", "水塘"]) for (const questionNumber of [46, 47, 48]) if (!social111Q41to50[questionNumber - 41]?.question.includes(term)) failures.push(`111 社會第${questionNumber}題：共用地名史料缺少 ${term}`);
for (const term of ["日治時期", "2018年", "500杯", "2018年9月", "高中以下"]) for (const questionNumber of [49, 50]) if (!social111Q41to50[questionNumber - 41]?.question.includes(term)) failures.push(`111 社會第${questionNumber}題：共用咖啡文化材料缺少 ${term}`);
for (const term of ["甲出口到乙", "丙出口到甲", "有利出口", "有利進口"]) if (!`${social111Q41to50[1]?.explanation || ""} ${(social111Q41to50[1]?.solutionSteps || []).join(" ")}`.includes(term)) failures.push(`111 社會第42題：雙邊貿易方向或匯率推理有誤／缺漏 ${term}`);
if (!`${social111Q41to50[9]?.explanation || ""} ${(social111Q41to50[9]?.solutionSteps || []).join(" ")}`.includes("制度變革")) failures.push("111 社會第50題：未解釋修法如何改變校園販售品項");
const social111Q51to54 = mission.filter(row => row.subject === "社會" && row.source?.year === 111 && row.source?.questionNumber >= 51 && row.source?.questionNumber <= 54).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
if (social111Q51to54.length !== 4) failures.push("111 社會第51–54題：審核批次題數不是 4");
for (const [index, row] of social111Q51to54.entries()) {
  if (row.answer !== [2, 0, 1, 0][index] || row.options?.length !== 4 || !row.explanation || (row.solutionSteps || []).length < 2 || !row.teacherTip) failures.push(`111 社會第${index + 51}題：答案、四選項或解題教學欄位不完整`);
}
const social111AirPassage = social111Q51to54.slice(1).map(row => row.question || "").join(" ");
for (const term of ["夏目漱石", "煤炭", "西歐盛行風", "低技術勞動階級", "恩格斯"]) if (!social111AirPassage.includes(term)) failures.push(`111 社會第52–54題：共享空污史料缺少 ${term}`);
for (const questionNumber of [51, 52, 54]) {
  const row = social111Q51to54[questionNumber - 51];
  if (row?.requiresImage || row?.questionImages?.length || row?.questionImage) failures.push(`111 社會第${questionNumber}題：完整文字材料不應附加整頁試卷掃描`);
}
const social111Q53 = social111Q51to54[2];
if (!social111Q53?.requiresImage || social111Q53.questionImage !== "./assets/official-exams/111-social-q53-city-diagram.png" || !serviceWorker.includes("./assets/official-exams/111-social-q53-city-diagram.png")) failures.push("111 社會第53題：必要方位圖或離線快取缺漏");
for (const term of ["西歐", "西風", "西往東", "東側", "答案 B"]) if (!`${social111Q53?.explanation || ""} ${(social111Q53?.solutionSteps || []).join(" ")}`.includes(term)) failures.push(`111 社會第53題：風向至下風處的推理缺少 ${term}`);
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
const officialExplanationFingerprints = new Map();
for (const row of mission.filter(item => item.sourceType === "官方歷屆真題")) {
  const fingerprint = String(row.explanation || "").replace(/\s+/g, " ").trim();
  officialExplanationFingerprints.set(fingerprint, [...(officialExplanationFingerprints.get(fingerprint) || []), row.id]);
}
for (const ids of officialExplanationFingerprints.values()) {
  if (ids.length > 1) failures.push(`官方真題解析完全重複（${ids.length}題）：${ids.join(", ")}`);
}
for (const [questionNumber, requiredTerm] of [[1, "basket"], [2, "sing"], [3, "shout"], [4, "watch someone doing"], [5, "color"], [6, "jog"], [7, "change one's job"], [8, "crowded"], [9, "otherwise"], [10, "reason"]]) {
  const row = mission.find(item => item.source?.year === 112 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || !row.relatedWords?.some(word => word.toLowerCase().includes(requiredTerm))) failures.push(`112 英文第${questionNumber}題: 缺少題目相關的同義／近義詞提示 ${requiredTerm}`);
  if (row?.relatedWords?.some(word => /context clue|eliminate|paraphrase/i.test(word))) failures.push(`${row.id}: 同義／近義詞欄仍是通用解題詞`);
}
for (let questionNumber = 11; questionNumber <= 20; questionNumber++) {
  const row = mission.find(item => item.source?.year === 112 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || (row.relatedWords || []).length < 2 || row.relatedWords.some(word => /context clue|eliminate|paraphrase/i.test(word))) {
    failures.push(`112 英文第${questionNumber}題: 同義／近義詞欄仍缺少本題詞彙提示`);
  }
}
for (let questionNumber = 21; questionNumber <= 30; questionNumber++) {
  const row = mission.find(item => item.source?.year === 112 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || (row.relatedWords || []).length < 2 || row.relatedWords.some(word => /context clue|eliminate|paraphrase/i.test(word))) {
    failures.push(`112 英文第${questionNumber}題: 同義／近義詞欄仍缺少本題詞彙提示`);
  }
}
for (let questionNumber = 31; questionNumber <= 43; questionNumber++) {
  const row = mission.find(item => item.source?.year === 112 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || (row.relatedWords || []).length < 2 || row.relatedWords.some(word => /context clue|eliminate|paraphrase/i.test(word))) {
    failures.push(`112 英文第${questionNumber}題: 同義／近義詞欄仍缺少本題詞彙提示`);
  }
}
for (let questionNumber = 1; questionNumber <= 10; questionNumber++) {
  const row = mission.find(item => item.source?.year === 110 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || (row.relatedWords || []).length < 2 || row.relatedWords.some(word => /context clue|eliminate|paraphrase/i.test(word))) {
    failures.push(`110 英文第${questionNumber}題: 同義／近義詞欄仍缺少本題詞彙提示`);
  }
}
for (let questionNumber = 11; questionNumber <= 20; questionNumber++) {
  const row = mission.find(item => item.source?.year === 110 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || (row.relatedWords || []).length < 2 || row.relatedWords.some(word => /context clue|eliminate|paraphrase/i.test(word))) {
    failures.push(`110 英文第${questionNumber}題: 同義／近義詞欄仍缺少本題詞彙提示`);
  }
}
for (let questionNumber = 21; questionNumber <= 30; questionNumber++) {
  const row = mission.find(item => item.source?.year === 110 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || (row.relatedWords || []).length < 2 || row.relatedWords.some(word => /context clue|eliminate|paraphrase/i.test(word))) {
    failures.push(`110 英文第${questionNumber}題: 同義／近義詞欄仍缺少本題詞彙提示`);
  }
}
for (let questionNumber = 31; questionNumber <= 41; questionNumber++) {
  const row = mission.find(item => item.source?.year === 110 && item.source?.questionNumber === questionNumber && item.subject === "英文");
  if (!row || (row.relatedWords || []).length < 2 || row.relatedWords.some(word => /context clue|eliminate|paraphrase/i.test(word))) {
    failures.push(`110 英文第${questionNumber}題: 同義／近義詞欄仍缺少本題詞彙提示`);
  }
  if (!row?.teacherTip || row.teacherTip.includes("先把選項代回完整句子")) failures.push(`${row?.id || `110 英文第${questionNumber}題`}: 教師提醒仍是通用套語`);
}
const pianoInference = mission.find(item => item.id === "OFF-0070");
if (pianoInference?.questionImage || pianoInference?.requiresImage) failures.push("110 英文第22題: 純文字推論題不應附非必要整頁試卷圖");
for (const id of ["OFF-0074", "OFF-0075", "OFF-0076", "OFF-0077", "OFF-0078"]) {
  const row = mission.find(item => item.id === id);
  if (!row?.teacherTip || row.teacherTip.includes("先把選項代回完整句子")) failures.push(`${id}: 教師提醒仍是通用套語`);
}

const scienceStepRepair = JSON.parse(await readFile(join(root, "data", "science.json"), "utf8"))
  .filter(row => Number(row.id?.slice(4)) <= 100);
if (scienceStepRepair.length !== 100) failures.push(`自然科 SCI-0001–0100: 預期 100 題，實際 ${scienceStepRepair.length} 題`);
for (const row of scienceStepRepair) {
  if ((row.solutionSteps || []).length < 3 || row.solutionSteps[0]?.startsWith("讀取題目條件：") || new Set(row.solutionSteps).size !== row.solutionSteps.length || row.solutionSteps.some(step => !step.trim())) {
    failures.push(`${row.id}: 自然科解析步驟不足、重述題幹、重複或空白`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(`品質門檻未通過：${failures.length} 項`);
  process.exit(1);
}
console.log("五科題型模板、解析重複度與正解引用檢查通過。");
