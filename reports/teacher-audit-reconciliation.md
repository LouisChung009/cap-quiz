# Current teacher-audit reconciliation

Updated: 2026-10-07 (local verification; source commit ebf6136)

## Interpretation
- This is an audit-work tracker, not teacher certification or a confirmed-defect count.
- “Unverified” entries are prior audit flags still needing item-by-item disposition; passing automated tests does not clear an item-level claim.
- All 5,000 authored questions still await qualified subject-teacher review; signed teacher-review fields are absent.
- Automated acceptance passed locally: `npm test`, `npm run build`, exact authored-stem/explanation duplicate checks, and 100,000 random draws with no within-round duplicates.
- Every explicit figure reference resolves to a local asset; this does not prove each asset matches the original exam page.
- The application and five subject banks match GitHub `main` at `ebf6136`; Vercel serves the same five data files. This audit report is published on GitHub Pages; Vercel does not expose the reports directory.
- 112 Social Studies Q41–50 were compared with the source pages and official answer keys; ten superseded old flags were removed only after the regression passed. See `reports/recheck-social-112-q41-q50-2026-10-07.md`.

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
- Unverified official-question flags: 112
- Unverified authored-question flags: 1000
- Stale IDs: 0
- Subject mismatches: 0
