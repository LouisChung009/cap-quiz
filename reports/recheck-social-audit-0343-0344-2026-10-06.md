# Social Studies audit reconciliation: OFF-0343–0344

- Rechecked 111 Social Studies original scan page 1 against the current records and official answer references.
- OFF-0343 / 111 Q1: the current stem transcribes the original 2017 pilgrimage total and source-country/count table, including the largest contributor Saudi Arabia (600,108) and “other countries” (635,106). It is now independently answerable as Hajj (key C) without a screenshot; the existing explanation cites the Muslim-majority source-country pattern. The audit's claim that a required figure is missing is stale.
- OFF-0344 / 111 Q2: the original Taiwan location map is present as `assets/official-exams/111-social-q02-taiwan-locations.png`, wired as required in `questionImages`, and included in the service-worker asset list. The stem, options, key B, and location reasoning are present. The audit's claim that the figure is not enabled is stale.
- Removed only these two contradicted stale findings from `reports/社會-teacher-audit.json`; other findings remain untouched.
- Added regression assertions to `scripts/validate-data-v2.mjs` for the transcribed table, official key, map attachment, offline precache, and source-based explanation.
- Verification: `node scripts/validate-data-v2.mjs` passed (all 6,108 IDs unique and five subject banks at 1,000 items each).
- This source/data reconciliation is not a credentialed teacher sign-off or a complete Social Studies audit.
