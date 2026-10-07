# Current teacher-audit reconciliation

Updated: 2026-10-07 (113 Social Studies Q51–54 recheck; 113 Social Studies review sets now cover Q1–54)

## Interpretation
- This is an audit-work tracker, not teacher certification or a confirmed-defect count.
- “Unverified” entries are prior audit flags still needing item-by-item disposition; passing automated tests does not clear an item-level claim.
- All 5,000 authored questions still await qualified subject-teacher review; signed teacher-review fields are absent.
- Automated acceptance passed locally: `npm test`, `npm run build`, exact authored-stem/explanation duplicate checks, and 100,000 random draws with no within-round duplicates.
- Every explicit figure reference resolves to a local asset; this does not prove each asset matches the original exam page.
- Vercel reported commit `20a5a7e` Ready and GitHub Pages workflow #231 succeeded; the Q21–30 recheck and updated count are published. This report is hosted on GitHub Pages; Vercel does not expose the reports directory.
- 112 Social Studies Q41–54 were compared with source pages and official answer keys; fourteen superseded flags were removed only after regressions passed. See `reports/recheck-social-112-q41-q50-2026-10-07.md` and `reports/recheck-social-112-q51-q54-2026-10-07.md`.
- 113 Social Studies Q1–10 were compared with source pages and official answer keys; ten superseded flags were removed only after source-linked checks passed. See `reports/recheck-social-113-q01-q10-2026-10-07.md`. This was source-based AI review, not teacher certification.
- 113 Social Studies Q11–20 were compared with source pages and official answer keys; ten additional superseded flags were removed after checks of answer indices, explanations, figure assets, and offline source-page dependencies. See `reports/recheck-social-113-q11-q20-2026-10-07.md`. This was source-based AI review, not teacher certification.
- 113 Social Studies Q21–30 were compared with original pages 5–8 and the official answer key; ten additional superseded flags were removed after source, answer, explanation, figure, and offline-cache checks. See `reports/recheck-social-113-q21-q30-2026-10-07.md`. This was source-based AI review, not teacher certification.
- 113 Social Studies Q31–40 were compared with original pages 8–10 and the official answer key; ten additional superseded flags were removed after source, answer, explanation, figure, and offline-cache checks. Residual OCR spacing was corrected. See `reports/recheck-social-113-q31-q40-2026-10-07.md`. This was source-based AI review, not teacher certification.
- 113 Social Studies Q41–50 were compared with original pages 11–13 and the official answer key; ten superseded flags were removed after answer, complete shared-passage, focused-map, explanation, and offline-cache checks. See `reports/recheck-social-113-q41-q50-2026-10-07.md`. This was source-based AI review, not teacher certification.
- 113 Social Studies Q51–54 were compared with original pages 13–14 and the official answer key; four superseded flags were removed after fixing one OCR spacing error and strengthening explanations. The population map and shared cinema passage are checked for visibility and offline support. See `reports/recheck-social-113-q51-q54-2026-10-07.md`. This was source-based AI review, not teacher certification.

## 國文
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Authored items awaiting qualified teacher review: 1000
- Unverified official-question flags: 0
- Unverified authored-question flags: 0
- Stale IDs: 0
- Subject mismatches: 0

## 英文
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Authored items awaiting qualified teacher review: 1000
- Unverified official-question flags: 35
- Unverified authored-question flags: 0
- Stale IDs: 0
- Subject mismatches: 0

## 數學
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Authored items awaiting qualified teacher review: 1000
- Unverified official-question flags: 0
- Unverified authored-question flags: 0
- Stale IDs: 0
- Subject mismatches: 0

## 自然
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Authored items awaiting qualified teacher review: 1000
- Unverified official-question flags: 80
- Unverified authored-question flags: 1000
- Stale IDs: 0
- Subject mismatches: 0

## 社會
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Authored items awaiting qualified teacher review: 1000
- Unverified official-question flags: 54
- Unverified authored-question flags: 1000
- Stale IDs: 0
- Subject mismatches: 0
