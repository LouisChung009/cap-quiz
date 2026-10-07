# Current teacher-audit reconciliation

Generated: 2026-10-07T03:58:59.202Z

## Interpretation
- This is an audit-work tracker, not teacher certification or a confirmed-defect count.
- “Unverified” entries are prior audit flags still needing item-by-item disposition; passing automated tests does not clear an item-level claim.
- All 5,000 authored questions still await qualified subject-teacher review; signed teacher-review fields are absent.
- Automated acceptance passed locally: `npm test`, `npm run build`, exact authored-stem/explanation duplicate checks, and 100,000 random draws with no within-round duplicates.
- Every explicit figure reference resolves to a local asset; this does not prove each asset matches the original exam page.
- Latest deployed version is tracked by GitHub Pages Actions; the interactive Vercel learner flow still requires signed-in browser verification.
- 112 Social Studies Q41–54 were compared with source pages and official answer keys; fourteen superseded flags were removed only after regressions passed. See `reports/recheck-social-112-q41-q50-2026-10-07.md` and `reports/recheck-social-112-q51-q54-2026-10-07.md`.
- 113 Social Studies Q1–54 and 114 Social Studies Q1–50 have source-based AI review reports; these are not qualified teacher certification.
- 114 Social Studies Q41–50 were checked against the official answer table and original pages; both required focused figures and the relevant original pages are available offline. See `reports/recheck-social-114-q41-q50-2026-10-07.md`.
- 114 Social Studies Q51–54 were checked against the official answer table and original pages; the missing focused tombstone was added, the Q53 map was verified, and all four superseded flags were removed after regressions passed. See `reports/recheck-social-114-q51-q54-2026-10-07.md`.
- 114 English Q37–43 were checked against the official answer table and complete source passages; seven superseded flags were removed after answer, evidence, teaching-field, and no-redundant-scan checks passed. See `reports/recheck-english-114-q37-q43-2026-10-07.md`.
- 114 English Q1 and Q20–28 were rechecked against original pages and official answer keys; ten superseded flags were removed after answer, passage, worked-solution, and focused-image checks passed. See `reports/recheck-english-114-q01-q28-selected-2026-10-07.md`.
- 111 English Q34, Q38, and Q40–43 were rechecked against original pages and official answer keys; six superseded flags were removed after answer, passage, solution, and image-dependency checks passed. See `reports/recheck-english-111-q34-q38-q40-q43-2026-10-07.md`.
- 112 English Q33, Q36, Q38, and Q42–43 were rechecked against source passages and official answer keys; five superseded flags were removed after answer, passage, solution, and image-dependency checks passed. See `reports/recheck-english-112-q33-q36-q38-q42-q43-2026-10-07.md`.
- 113 English Q1, Q30, Q33, and Q40–43 were rechecked against original pages and official answer keys; Q1 now uses a focused SVG illustration, Q41 retains its needed chart, and seven superseded flags were removed after text/image/offline checks passed. See `reports/recheck-english-113-selected-2026-10-07.md`.
- 114 Science Q1–10 were rechecked against cached official paper pages 2–4 and the existing official-key review; nine remaining explanation flags were removed only after answer, worked-reasoning, source-cue, and image-dependency checks passed (Q4 had already been cleared). See `reports/recheck-science-114-q01-q10-2026-10-07.md`.
- 112 Science Q1–10 were rechecked against original pages 2–4 and official answer-key provenance; eight flags were removed only after answer-index, worked-explanation, source-cue, and focused-image checks passed. See `reports/recheck-science-112-q01-q10-2026-10-07.md`.
- 113 Science Q11–20 were rechecked against original pages 2–5 and official answer-key provenance; five stale explanation-quality flags were removed only after answer-index, worked-solution, source-cue, and Q15 figure checks passed. See `reports/recheck-science-113-q11-q20-2026-10-07.md`.
- 113 Science Q21–30 were rechecked against original pages 5–7 and official answer-key provenance; seven stale explanation-quality flags were removed after source-data, answer-index, worked-calculation, and no-unneeded-figure checks passed. See `reports/recheck-science-113-q21-q30-2026-10-07.md`.
- 113 Science Q31–40 were rechecked against original pages and official answer-key provenance; seven flags were removed only after question evidence, worked reasoning, required-figure binding, and service-worker offline-cache checks passed. See `reports/recheck-science-113-q31-q40-2026-10-07.md`.
- 113 Science Q41–50 were rechecked against the official key and source data; seven flags were removed only after evidence, worked-step, source-provenance, and Q49 offline-graph checks passed. Automated source review is not independent teacher certification. See `reports/recheck-science-113-q41-q50-2026-10-07.md`.
- 113 Science Q1–10 were checked against original pages 1–3, official answer keys, complete Q4 table, worked solutions, and required offline figures; nine superseded explanation flags were removed. Automated source review is not independent teacher certification. See `reports/audit-official-science-113-q1-q10-2026-10-03.md`.

## 國文
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Unverified official-question flags: 0
- Unverified authored-question flags: 0
- Stale IDs: 0
- Subject mismatches: 0

## 英文
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Unverified official-question flags: 0
- Unverified authored-question flags: 0
- Stale IDs: 0
- Subject mismatches: 0

## 數學
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Unverified official-question flags: 0
- Unverified authored-question flags: 0
- Stale IDs: 0
- Subject mismatches: 0

## 自然
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Unverified official-question flags: 28
- Unverified authored-question flags: 1000
- Stale IDs: 0
- Subject mismatches: 0

## 社會
- Authored items: 1000
- Authored items with teacher-signed review fields: 0
- Unverified official-question flags: 0
- Unverified authored-question flags: 1000
- Stale IDs: 0
- Subject mismatches: 0
