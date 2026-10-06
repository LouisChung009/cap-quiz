# Mathematics Authored-Bank Audit: MAT-0321–0330

Date: 2026-10-04

## Findings and repairs

- Recomputed all ten geometry and capacity answer keys and checked worked steps against their selected options.
- Removed tentative/questioning phrasing from the MAT-0329 explanation while retaining its explicit similarity-ratio derivation.
- Recalibrated the square-diagonal and volume-to-capacity conversion items from advanced to intermediate difficulty.
- Added regression assertions for answer indexes, difficulty, unit, solution evidence, and targeted teacher reminders.

## Verification

- Full `npm test` passed across 6,108 records and all five 1,000-question authored banks.
- Randomized validation passed 10,000 rounds / 100,000 selections with no within-round repeats; extracted official keys had zero mismatches.
- `git diff --check` passed.
- AI-assisted review only; qualified teacher sign-off and production deployment remain outstanding.
