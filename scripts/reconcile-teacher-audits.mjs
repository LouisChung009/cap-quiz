import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const subjects = [
  ["國文", "chinese"],
  ["英文", "english"],
  ["數學", "math"],
  ["自然", "science"],
  ["社會", "social"]
];
const questionById = new Map();

for (const [subject, file] of subjects) {
  const authored = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  for (const question of authored) questionById.set(question.id, question);
}
const official = JSON.parse(await readFile(join(root, "data", "mission-questions.json"), "utf8"));
for (const question of official) questionById.set(question.id, question);

const result = { generatedAt: new Date().toISOString(), subjects: {} };
const markdown = [
  "# Current teacher-audit reconciliation",
  "",
  `Generated: ${result.generatedAt}`,
  "",
  "## Interpretation",
  "- This is an audit-work tracker, not teacher certification or a confirmed-defect count.",
  "- “Unverified” entries are prior audit flags still needing item-by-item disposition; passing automated tests does not clear an item-level claim.",
  "- All 5,000 authored questions still await qualified subject-teacher review; signed teacher-review fields are absent.",
  "- Automated acceptance passed locally: `npm test`, `npm run build`, exact authored-stem/explanation duplicate checks, and 100,000 random draws with no within-round duplicates.",
  "- Every explicit figure reference resolves to a local asset; this does not prove each asset matches the original exam page.",
  "- Latest deployed version is tracked by GitHub Pages Actions; the interactive Vercel learner flow still requires signed-in browser verification.",
  "- 112 Social Studies Q41–54 were compared with source pages and official answer keys; fourteen superseded flags were removed only after regressions passed. See `reports/recheck-social-112-q41-q50-2026-10-07.md` and `reports/recheck-social-112-q51-q54-2026-10-07.md`.",
  "- 113 Social Studies Q1–54 and 114 Social Studies Q1–50 have source-based AI review reports; these are not qualified teacher certification.",
  "- 114 Social Studies Q41–50 were checked against the official answer table and original pages; both required focused figures and the relevant original pages are available offline. See `reports/recheck-social-114-q41-q50-2026-10-07.md`.",
  ""
];

for (const [subject, file] of subjects) {
  const authored = JSON.parse(await readFile(join(root, "data", `${file}.json`), "utf8"));
  const auditPath = join(root, "reports", `${subject}-teacher-audit.json`);
  const audit = JSON.parse(await readFile(auditPath, "utf8"));
  if (!Array.isArray(audit)) throw new Error(`${subject}: audit must be a JSON array`);

  const mapped = audit.map(finding => {
    const question = questionById.get(finding.id);
    const status = !question ? "stale-id" : question.subject !== subject ? "subject-mismatch" : "unverified-current-flag";
    return { ...finding, reconciliation: status, currentSourceType: question?.sourceType || null };
  });
  const reviewFields = ["teacherVerdict", "reviewerName", "reviewerQualification", "reviewedAt"];
  const reviewed = authored.filter(question => reviewFields.every(field => String(question[field] || "").trim()));
  const currentFindings = mapped.filter(finding => finding.reconciliation === "unverified-current-flag");
  const staleFindings = mapped.filter(finding => finding.reconciliation === "stale-id");
  const mismatches = mapped.filter(finding => finding.reconciliation === "subject-mismatch");

  result.subjects[subject] = {
    authoredQuestions: authored.length,
    authoredTeacherSignedReviews: reviewed.length,
    authoredTeacherReviewMissing: authored.length - reviewed.length,
    auditEntries: audit.length,
    unverifiedOfficialFlags: currentFindings.filter(finding => finding.currentSourceType === "官方歷屆真題").length,
    unverifiedAuthoredFlags: currentFindings.filter(finding => finding.currentSourceType !== "官方歷屆真題").length,
    staleFindings: staleFindings.length,
    subjectMismatches: mismatches.length
  };

  const summary = result.subjects[subject];
  markdown.push(
    `## ${subject}`,
    `- Authored items: ${summary.authoredQuestions}`,
    `- Authored items with teacher-signed review fields: ${summary.authoredTeacherSignedReviews}`,
    `- Unverified official-question flags: ${summary.unverifiedOfficialFlags}`,
    `- Unverified authored-question flags: ${summary.unverifiedAuthoredFlags}`,
    `- Stale IDs: ${summary.staleFindings}`,
    `- Subject mismatches: ${summary.subjectMismatches}`,
    ""
  );
}

await writeFile(join(root, "reports", "teacher-audit-reconciliation.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
await writeFile(join(root, "reports", "teacher-audit-reconciliation.md"), `${markdown.join("\n").trimEnd()}\n`, "utf8");
console.log(JSON.stringify(Object.fromEntries(Object.entries(result.subjects).map(([subject, summary]) => [subject, {
  authoredQuestions: summary.authoredQuestions,
  authoredTeacherSignedReviews: summary.authoredTeacherSignedReviews,
  unverifiedOfficialFlags: summary.unverifiedOfficialFlags,
  unverifiedAuthoredFlags: summary.unverifiedAuthoredFlags,
  staleFindings: summary.staleFindings,
  subjectMismatches: summary.subjectMismatches
}])), null, 2));
