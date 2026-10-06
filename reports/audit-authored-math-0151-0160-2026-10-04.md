# Mathematics Authored-Bank Audit: MAT-0151–0160

Date: 2026-10-04

## Findings and repairs

- Found two worked-step answer-index claims that contradicted the actual answer indexes: MAT-0153 and MAT-0156. Corrected both to the option letter and zero-based index actually used by the app.
- Replaced all ten copied, unrelated equation-solving teacher tips with question-specific guidance; corrected the map-scale unit label and recalibrated direct rate, probability, angle, circle, volume, and equation items to foundational difficulty.
- Recomputed the numerical answers and checked the explanatory steps against every selected option.
- Added regression checks covering all ten answer indexes, difficulty, calculation evidence, four-option structure, and item-specific teacher tips.

## Verification

- Full `npm test` passed across 6,108 records; all five 1,000-question banks passed format and difficulty coverage, template/answer consistency, and official-key extraction checks.
- Randomized testing passed 10,000 rounds / 100,000 picks with zero within-round repeats; `git diff --check` passed.
- AI-assisted review only; qualified teacher sign-off, the rest of the authored bank, and production deployment remain outstanding.
