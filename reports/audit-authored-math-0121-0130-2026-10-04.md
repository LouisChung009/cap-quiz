# Mathematics Authored-Bank Audit: MAT-0121–0130

Date: 2026-10-04

## Findings and repairs

- Recomputed the ten indexed answers and checked their solution work; calculations and option indexes were correct.
- Removed near-duplicate inverse-discount/coupon exercises: MAT-0126 is now an event-probability problem, and MAT-0130 asks for discount rate from original and sale prices.
- Corrected topic labels for complementary angles, probability, square/rectangle perimeter, and percent discount.
- Recalibrated direct rate, angle, group-size, fee, perimeter, and discount-rate calculations to foundational difficulty; retained multi-step reverse-percent and rectangle problems as intermediate.
- Added regression checks for keys, calculation clues, difficulty, worked steps, teacher tips, and changed unit labels.

## Verification

- Full `npm test` passed across 6,108 records, including five 1,000-question banks, balanced answer positions, duplicate-template checks, and answer consistency.
- Randomized testing passed 10,000 rounds / 100,000 picks with zero within-round repeats; extracted official-key checks reported zero mismatches.
- `npm run build` and `git diff --check` passed.
- AI-assisted audit only; qualified teacher sign-off, the remaining item ranges, and production deployment remain outstanding.
