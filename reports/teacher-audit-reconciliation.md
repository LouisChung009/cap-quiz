# Current teacher-audit reconciliation

Updated: 2026-10-07 (113 Social Studies review at `8209f37`; report refreshed at `911af18`)

## Interpretation
- This is an audit-work tracker, not teacher certification or a confirmed-defect count.
- “Unverified” entries are prior audit flags still needing item-by-item disposition; passing automated tests does not clear an item-level claim.
- All 5,000 authored questions still await qualified subject-teacher review; signed teacher-review fields are absent.
- Automated acceptance passed locally: `npm test`, `npm run build`, exact authored-stem/explanation duplicate checks, and 100,000 random draws with no within-round duplicates.
- Every explicit figure reference resolves to a local asset; this does not prove each asset matches the original exam page.
- The 113 Social Studies data/audit reconciliation is in `8209f37`; a follow-up report-only update is in `911af18`. At verification, Vercel reported the `911af18` production deployment Ready and GitHub Pages workflow #228 succeeded. This report is published on GitHub Pages; Vercel does not expose the reports directory.
- 112 Social Studies Q41–54 were compared with source pages and official answer keys; fourteen superseded flags were removed only after regressions passed. See `reports/recheck-social-112-q41-q50-2026-10-07.md` and `reports/recheck-social-112-q51-q54-2026-10-07.md`.
- 113 Social Studies Q1–10 were compared with source pages and official answer keys; ten superseded flags were removed only after source-linked checks passed. See `reports/recheck-social-113-q01-q10-2026-10-07.md`. This was source-based AI review, not teacher certification.

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
- Unverified official-question flags: 98
- Unverified authored-question flags: 1000
- Stale IDs: 0
- Subject mismatches: 0
