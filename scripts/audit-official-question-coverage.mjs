import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const subjects = ["國文", "英文", "數學", "自然", "社會"];
const years = [110, 111, 112, 113, 114];
const official = questions.filter(question => question.sourceType === "官方歷屆真題");
const issues = [];
const rows = [["科目", "年度", "題數", "答案鍵已官方答案表核對", "非選答案表不適用", "個案題本標記", "缺少答案來源狀態", "需要圖", "需要圖且有圖", "答案來源與圖片引用狀態"]];

for (const subject of subjects) {
  for (const year of years) {
    const items = official.filter(question => question.subject === subject && question.source?.year === year);
    const verified = items.filter(question => question.answerKeyReview?.status === "verified");
    const notApplicable = items.filter(question => question.answerKeyReview?.status === "not_applicable");
    const caseReviewed = items.filter(question => typeof question.answerKeyReview?.status === "string" && !["verified", "not_applicable"].includes(question.answerKeyReview.status));
    const missing = items.filter(question => !question.answerKeyReview?.status);
    const needsImage = items.filter(question => question.requiresImage === true);
    const withImage = needsImage.filter(question => question.questionImage || question.questionImages?.length);
    const invalid = [];
    for (const question of items) {
      const status = question.answerKeyReview?.status;
      if (!["verified", "not_applicable"].includes(status) && typeof status !== "string") invalid.push(`${question.id}: missing answerKeyReview.status`);
      if (status === "verified" && (!question.answerKeyReview.note || !/官方.*(?:答案|參考答案)|(?:答案|參考答案).*官方/.test(question.answerKeyReview.note))) invalid.push(`${question.id}: verified marker lacks official-key evidence note`);
      if (status === "not_applicable" && question.type !== "非選擇題") invalid.push(`${question.id}: not_applicable answer key on non-constructed response`);
      if (question.requiresImage === true && !(question.questionImage || question.questionImages?.length)) invalid.push(`${question.id}: required figure missing`);
    }
    issues.push(...invalid);
    const status = items.length === 0 ? "MISSING_YEAR_SUBJECT" : missing.length || verified.length + notApplicable.length + caseReviewed.length !== items.length || needsImage.length !== withImage.length ? "INCOMPLETE" : caseReviewed.length ? "ANSWER_KEY_STATUS_COMPLETE_CASE_MARKERS_DISCLOSED" : "ANSWER_KEY_STATUS_COMPLETE";
    rows.push([subject, year, items.length, verified.length, notApplicable.length, caseReviewed.length, missing.length, needsImage.length, withImage.length, status]);
  }
}

for (const subject of subjects) {
  const items = official.filter(question => question.subject === subject);
  rows.push([subject, "合計", items.length,
    items.filter(question => question.answerKeyReview?.status === "verified").length,
    items.filter(question => question.answerKeyReview?.status === "not_applicable").length,
    items.filter(question => typeof question.answerKeyReview?.status === "string" && !["verified", "not_applicable"].includes(question.answerKeyReview.status)).length,
    items.filter(question => !question.answerKeyReview?.status).length,
    items.filter(question => question.requiresImage === true).length,
    items.filter(question => question.requiresImage === true && (question.questionImage || question.questionImages?.length)).length,
    "" ]);
}

const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n") + "\r\n";
await writeFile(join(root, "reports", "official-question-coverage.csv"), `\uFEFF${csv}`, "utf8");
if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Official question coverage: ${official.length} items across ${subjects.length} subjects and ${years.length} years; source statuses and required figure references are complete.`);
  console.log(`Answer-key statuses: ${official.filter(question => question.answerKeyReview?.status === "verified").length} official-key verified, ${official.filter(question => question.answerKeyReview?.status === "not_applicable").length} constructed-response not-applicable, ${official.filter(question => typeof question.answerKeyReview?.status === "string" && !["verified", "not_applicable"].includes(question.answerKeyReview.status)).length} case-specific source markers.`);
  console.log("This matrix checks answer-key/source markers and required figure references only; it does not certify question wording, solutions, grade-level fit, or teacher review.");
}
