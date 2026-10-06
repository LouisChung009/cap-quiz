import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDirectory = join(root, "reports", "teacher-review-packets");
const subjects = [["國文", "chinese"], ["英文", "english"], ["數學", "math"], ["自然", "science"], ["社會", "social"]];
const columns = [
  "id", "subject", "sourceType", "year", "questionNumber", "gradeSemester", "unit", "knowledgePoint", "difficulty", "type",
  "question", "optionA", "optionB", "optionC", "optionD", "answerIndex", "answerText", "responseParts", "explanation", "solutionSteps",
  "teacherTip", "relatedWords", "questionImages", "questionImage", "requiresImage", "requiresContext", "sourceUrl", "paperUrl",
  "teacherVerdict", "answerCorrect", "materialsComplete", "reasoningClear", "duplicateOrTemplate", "issueNotes", "reviewerName", "reviewerQualification", "reviewedAt"
];

function csvCell(value) {
  const text = value == null ? "" : Array.isArray(value) || typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function rowFor(question) {
  const options = question.options || [];
  const source = question.source || {};
  return [question.id, question.subject, question.sourceType, source.year, source.questionNumber, question.gradeSemester, question.unit,
    question.knowledgePoint, question.difficulty, question.type, question.question, options[0], options[1], options[2], options[3],
    question.answer, Number.isInteger(question.answer) ? options[question.answer] : "", question.responseParts, question.explanation,
    question.solutionSteps, question.teacherTip, question.relatedWords, question.questionImages, question.questionImage,
    question.requiresImage, question.requiresContext, source.url, source.paperUrl, "", "", "", "", "", "", "", "", ""];
}

const mission = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
await mkdir(outputDirectory, { recursive: true });
const summary = [];

for (const [subject, file] of subjects) {
  const authored = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  const questions = [...authored, ...mission.filter(question => question.subject === subject)];
  if (questions.some(question => rowFor(question).length !== columns.length)) throw new Error(`${subject}: review packet column count mismatch`);
  const contents = [columns, ...questions.map(rowFor)].map(row => row.map(csvCell).join(",")).join("\r\n") + "\r\n";
  await writeFile(join(outputDirectory, `${file}-teacher-review.csv`), `\uFEFF${contents}`, "utf8");
  summary.push({ subject, authored: authored.length, priorExam: questions.length - authored.length, total: questions.length });
}

const instructions = [
  "# 五科題庫真人教師審閱包",
  "",
  "這些 CSV 是供外部國中會考科任教師逐題審核的工作表，包含五科原創題及該科歷屆題／類題。此審閱包尚未經真人教師簽核；既有 AI 與自動檢查不可代替教師判定。",
  "",
  "## 審核方式",
  "",
  "每列代表一題。請逐題檢查正解、材料／圖表是否足以作答、解析推理是否正確清楚，以及題型是否重複或偏離會考程度。teacherVerdict 填 PASS、REVISE 或 UNSURE；各檢查欄填 PASS／FAIL；有問題時填 issueNotes，並留下教師姓名、專業資格與日期。圖檔路徑在 questionImages／questionImage 欄，以專案根目錄為準。",
  "",
  "## 完成門檻",
  "",
  "每一列都需有教師判定；所有 REVISE 項完成修正並由教師複核；任何未判定或 UNSURE 項目不得算通過。",
  "",
  "本批題目數：",
  "",
  ...summary.map(item => `- ${item.subject}：原創 ${item.authored} 題；歷屆真題／類題 ${item.priorExam} 題；共 ${item.total} 題`)
];
await writeFile(join(outputDirectory, "README.md"), `${instructions.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ outputDirectory, subjects: summary }, null, 2));
