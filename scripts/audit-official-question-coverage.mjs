import { access, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const questions = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
const subjects = [["國文", "chinese"], ["英文", "english"], ["數學", "math"], ["自然", "science"], ["社會", "social"]];
const years = [110, 111, 112, 113, 114];
const official = questions.filter(question => question.sourceType === "官方歷屆真題");
const issues = [];
const expectedCounts = { 國文: { 110: 48, 111: 42, 112: 42, 113: 42, 114: 42 }, 英文: { 110: 41, 111: 43, 112: 43, 113: 43, 114: 43 }, 數學: { 110: 28, 111: 27, 112: 27, 113: 27, 114: 27 }, 自然: { 110: 54, 111: 50, 112: 50, 113: 50, 114: 50 }, 社會: { 110: 63, 111: 54, 112: 54, 113: 54, 114: 54 } };
const rows = [["recordType", "id", "subject", "year", "questionNumber", "questionType", "answerSourceStatus", "answerSourceEvidence", "requiresImage", "imageCount", "imageFilesAvailable", "requiresContext", "contextEmbeddedInStem", "contextImageLinked", "teacherVerdict", "reviewerName", "reviewerQualification", "reviewedAt", "reviewerSigned", "reviewStatus"]];
const uniqueIds = new Set();
const expectedReviewIds = new Set(questions.map(question => question.id));
const contextPattern = /根據(?:本文|上文|文章|選文|材料|短文|報導|資料)|依據(?:本文|上文|文章|選文|材料|短文|報導|資料)|本文(?:中|主旨|作者|提到|認為|敘述|寫作)|文中(?:提到|指出|敘述|作者)|這篇(?:文章|短文)|由本文|閱讀(?:本文|上文|下文|文章|選文|材料)|according to (?:the|this) (?:text|article|reading|passage)|in the (?:text|article|reading|passage)|the writer|the author/i;
const embeddedPattern = /(?:【(?:閱讀材料(?:摘要|改寫(?:自)?|自)?[^】]*|資料(?:[甲乙])?)】|閱讀材料(?:（|\(|:)|對話(?:（|\(|:)|Katie 的日記|Reading material(?::|】)|大將軍仇鸞，始為曾銑所劾)/i;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quoted && character === '"' && source[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(cell);
      cell = "";
    } else if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (quoted) throw new Error("Unclosed quote in teacher review CSV");
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const [headers, ...records] = rows;
  return records.map(record => Object.fromEntries(headers.map((header, index) => [header, record[index] || ""])));
}

const reviewerRecords = new Map();
for (const [subject, file] of subjects) {
  const packet = parseCsv(await readFile(join(root, "reports", "teacher-review-packets", `${file}-teacher-review.csv`), "utf8"));
  const authored = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  for (const question of authored) expectedReviewIds.add(question.id);
  const expected = authored.length + questions.filter(question => question.subject === subject).length;
  if (packet.length !== expected) issues.push(`${subject}: review packet expected ${expected} rows, found ${packet.length}`);
  for (const record of packet) {
    if (reviewerRecords.has(record.id)) issues.push(`${record.id}: duplicate reviewer packet row`);
    if (!expectedReviewIds.has(record.id)) issues.push(`${record.id}: unexpected reviewer packet row`);
    reviewerRecords.set(record.id, record);
  }
}
for (const id of expectedReviewIds) if (!reviewerRecords.has(id)) issues.push(`${id}: missing reviewer packet row`);
for (const id of reviewerRecords.keys()) if (!expectedReviewIds.has(id)) issues.push(`${id}: reviewer packet ID does not exist in current question banks`);

async function existingImages(question) {
  const refs = [...new Set([question.questionImage, ...(question.questionImages || [])].filter(Boolean))];
  const missing = [];
  for (const image of refs) {
    try {
      const assetPath = image.split(/[?#]/, 1)[0];
      await access(join(root, assetPath));
    } catch {
      missing.push(image);
    }
  }
  return { refs, missing };
}

for (const [subject] of subjects) {
  for (const year of years) {
    const items = official.filter(question => question.subject === subject && question.source?.year === year).sort((left, right) => left.source.questionNumber - right.source.questionNumber);
    if (items.length !== expectedCounts[subject][year]) issues.push(`${subject} ${year}: expected ${expectedCounts[subject][year]} questions, found ${items.length}`);
    for (const question of items) {
      if (uniqueIds.has(question.id)) issues.push(`${question.id}: duplicate official question ID`);
      uniqueIds.add(question.id);
      const sourceStatus = question.answerKeyReview?.status || "missing";
      const reviewer = reviewerRecords.get(question.id) || {};
      const signed = Boolean(reviewer.teacherVerdict && reviewer.reviewerName && reviewer.reviewerQualification && reviewer.reviewedAt);
      if (!reviewer.id) issues.push(`${question.id}: missing teacher-review packet row`);
      const { refs, missing } = await existingImages(question);
      const contextEmbedded = embeddedPattern.test(question.question || "");
      const contextImage = refs.length > 0;
      if (!question.source?.url || !question.source?.paperUrl) issues.push(`${question.id}: official page or paper link missing`);
      if (sourceStatus === "missing") issues.push(`${question.id}: answer source status missing`);
      if (sourceStatus === "verified" && (!question.answerKeyReview.note || !/官方.*(?:答案|參考答案)|(?:答案|參考答案).*官方/.test(question.answerKeyReview.note))) issues.push(`${question.id}: verified marker lacks official-key evidence note`);
      if (sourceStatus === "not_applicable" && question.type !== "非選擇題") issues.push(`${question.id}: not_applicable answer key on non-constructed response`);
      if (question.requiresImage && !refs.length) issues.push(`${question.id}: required figure reference missing`);
      if (question.requiresContext && !contextEmbedded && !contextImage) issues.push(`${question.id}: required context neither embedded nor linked`);
      if (contextPattern.test(question.question || "") && !contextEmbedded && !contextImage) issues.push(`${question.id}: stem references context that is neither embedded nor linked`);
      if (missing.length) issues.push(`${question.id}: missing local image file(s): ${missing.join("; ")}`);
      const status = sourceStatus === "verified" ? "OFFICIAL_KEY_CHECKED" : sourceStatus === "not_applicable" ? "KEY_TABLE_NOT_APPLICABLE" : "CASE_SOURCE_MARKER";
      rows.push(["ITEM", question.id, subject, year, question.source.questionNumber, question.type, sourceStatus, question.answerKeyReview?.note || "", question.requiresImage, refs.length, refs.length - missing.length, question.requiresContext, contextEmbedded, contextImage, reviewer.teacherVerdict, reviewer.reviewerName, reviewer.reviewerQualification, reviewer.reviewedAt, signed, signed ? reviewer.teacherVerdict : "UNSIGNED_OR_INCOMPLETE"]);
    }
  }
}

const csv = rows.map(row => row.map(value => `"${String(value ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n") + "\r\n";
await writeFile(join(root, "reports", "official-question-coverage.csv"), `\uFEFF${csv}`, "utf8");
if (issues.length) {
  console.error(issues.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Official item ledger: ${official.length} individual questions across ${subjects.length} subjects and ${years.length} years; source links, answer provenance, required context, local assets, and reviewer packet rows checked.`);
  console.log(`Answer-key statuses: ${official.filter(question => question.answerKeyReview?.status === "verified").length} official-key verified, ${official.filter(question => question.answerKeyReview?.status === "not_applicable").length} constructed-response not-applicable, ${official.filter(question => typeof question.answerKeyReview?.status === "string" && !["verified", "not_applicable"].includes(question.answerKeyReview.status)).length} case-specific source markers.`);
  const signedCount = official.filter(question => {
    const reviewer = reviewerRecords.get(question.id) || {};
    return Boolean(reviewer.teacherVerdict && reviewer.reviewerName && reviewer.reviewerQualification && reviewer.reviewedAt);
  }).length;
  console.log(`Official questions requiring images: ${official.filter(question => question.requiresImage === true).length}; item-level reviewer signatures: ${signedCount}.`);
  console.log("This ledger checks provenance, context flags, and local image-file availability only; it does not certify visual fidelity, question wording, solutions, grade-level fit, or teacher review.");
}
