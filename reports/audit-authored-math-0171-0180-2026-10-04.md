# Mathematics Authored-Bank Audit: MAT-0171–0180

Date: 2026-10-04

## Findings and repairs

- Corrected solution-step answer-index claims for MAT-0173 and MAT-0175 to match their actual indexed choices.
- Replaced copied generic teacher tips with question-specific reminders for all ten items, including the original-value denominator for percent increase and the distinction between mean and median.
- Recalibrated direct fraction, percent-change, equation, mean/median, and reverse-discount calculations to foundational difficulty; retained multi-step journey, ratio, rectangle, and missing-score problems at intermediate difficulty.
- Recomputed the numeric answers and checked each solution against its selected option.
- Added item-level regression assertions for answer, difficulty, calculation evidence, four-option structure, and specific tips.

## Verification

- Full `npm test` passed across 6,108 records; format/difficulty checks, duplicate-template checks, answer consistency, task mixing, and extracted official keys passed.
- Randomized testing passed 10,000 rounds / 100,000 picks with zero within-round repeats; `git diff --check` passed.
- AI-assisted review only; qualified teacher sign-off, remaining authored questions, and production deployment remain outstanding.
