# Mathematics Authored-Bank Audit: MAT-0191–0200

Date: 2026-10-04

## Findings and repairs

- Recomputed all ten results; the indexed answers and existing worked calculations agree.
- Replaced the ten copied generic teacher tips with item-specific guidance for linear equations, travel-time differences, rectangle ratios, corrected averages, probability, function intercepts, relative speed, and data interpretation.
- Calibrated direct computations to foundational difficulty and multi-step travel/rectangle/mean items to intermediate; normalized probability and function unit labels.
- Added per-item regression assertions for answer, difficulty, unit, calculation evidence, options, and question-specific teacher tips.

## Verification

- Full `npm test` passed across 6,108 records; format/difficulty checks, duplicate-template checks, answer consistency, task mixing, and extracted official keys passed.
- Randomized testing passed 10,000 rounds / 100,000 picks with zero within-round repeats; `git diff --check` passed.
- AI-assisted review only; qualified teacher sign-off, remaining authored questions, and production deployment remain outstanding.
