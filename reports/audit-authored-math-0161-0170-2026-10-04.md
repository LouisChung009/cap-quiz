# Mathematics Authored-Bank Audit: MAT-0161–0170

Date: 2026-10-04

## Findings and repairs

- Found answer-index text mismatches in the worked steps for MAT-0162 and MAT-0165; corrected both to their actual option letters and indexes.
- Replaced ten unrelated copied equation-solving teacher tips with item-specific reminders about signed substitution, slope, discount sequencing, ratios, work rates, without-replacement probability, geometry, area change, and equation order.
- Corrected unit classifications for functions, percentages, ratios, geometry, and linear equations, and recalibrated direct-procedure items to foundational difficulty; work-rate and without-replacement probability problems are intermediate rather than advanced.
- Recomputed the answers and checked the explanatory calculations against the indexed options.
- Added per-item regression assertions for answer, difficulty, unit, calculation evidence, four options, and teacher tip.

## Verification

- Full `npm test` passed across 6,108 records; all five 1,000-question banks passed format and difficulty coverage, template/answer consistency, and official-key extraction checks.
- Randomized testing passed 10,000 rounds / 100,000 picks with zero within-round repeats; `git diff --check` passed.
- AI-assisted review only; qualified teacher sign-off, remaining authored questions, and production deployment remain outstanding.
