import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = { chinese: "國文", english: "英文", math: "數學", science: "自然", social: "社會" };
const report = {};
for (const [file, subject] of Object.entries(files)) {
  const rows = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  const exact = new Set();
  const stems = new Set();
  const structuralTemplates = new Map();
  const answerTexts = new Set();
  const explanationTexts = new Set();
  const explanationFrequency = new Map();
  const errors = [];
  let malformedOptions = 0;
  let genericExplanations = 0;
  let sharedMaterialMentions = 0;
  for (const [index, row] of rows.entries()) {
    const location = `${row.id || index}`;
    if (row.subject !== subject) errors.push({ id: location, issue: "科目欄位錯誤" });
    if (!Array.isArray(row.options) || row.options.length !== 4 || row.options.some(value => !String(value).trim()) || new Set(row.options).size !== 4) {
      malformedOptions += 1;
      errors.push({ id: location, issue: "四個選項缺漏或重複" });
    }
    if (!Number.isInteger(row.answer) || row.answer < 0 || row.answer > 3) errors.push({ id: location, issue: "答案索引錯誤" });
    const stem = String(row.question || "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
    const template = stem.replace(/^practice\s+[\d-]+:\s*/i, "").replace(/\d+/g, "#").replace(/「閱讀札記第#則」/g, "「閱讀札記」");
    const whole = `${stem}|${(row.options || []).join("|")}`.toLocaleLowerCase();
    if (stems.has(stem)) errors.push({ id: location, issue: "題幹完全重複" });
    if (exact.has(whole)) errors.push({ id: location, issue: "題幹與選項完全重複" });
    stems.add(stem);
    structuralTemplates.set(template, (structuralTemplates.get(template) || 0) + 1);
    exact.add(whole);
    if (stem && row.explanation) {
      answerTexts.add(String(row.explanation));
      explanationFrequency.set(String(row.explanation), (explanationFrequency.get(String(row.explanation)) || 0) + 1);
    }
    if (row.solutionSteps?.length) explanationTexts.add(row.solutionSteps.join(" "));
    if (/答案.*最符合|核對.*確定答案|根據本文|根據上文|依據本文|如圖|下圖|上表/i.test(`${row.explanation} ${row.question}`)) {
      if (/答案.*最符合|核對.*確定答案|根據本文|根據上文|依據本文|如圖|下圖|上表/i.test(String(row.explanation || ""))) genericExplanations += 1;
      if (/根據本文|根據上文|依據本文|如圖|下圖|上表/i.test(stem)) sharedMaterialMentions += 1;
    }
    if (!row.question || !row.explanation || !Array.isArray(row.solutionSteps) || row.solutionSteps.length < 3) errors.push({ id: location, issue: "題幹或逐步解析缺漏" });
  }
  report[subject] = {
    total: rows.length,
    uniqueQuestionStems: stems.size,
    structuralQuestionTemplates: structuralTemplates.size,
    largestTemplateGroup: Math.max(...structuralTemplates.values()),
    uniqueStemAndOptionSets: exact.size,
    distinctExplanations: answerTexts.size,
    mostRepeatedExplanation: Math.max(...explanationFrequency.values()),
    distinctStepSets: explanationTexts.size,
    malformedOptions,
    genericExplanations,
    sharedMaterialMentions,
    errors,
  };
}
await writeFile(join(root, "reports", "base-content-audit.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(Object.fromEntries(Object.entries(report).map(([subject, result]) => [subject, Object.fromEntries(Object.entries(result).filter(([key]) => key !== "errors"))])), null, 2));
