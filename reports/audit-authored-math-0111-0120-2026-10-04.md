# Mathematics Authored-Bank Audit: MAT-0111–0120

Date: 2026-10-04

## Findings and repairs

- Recomputed each answer and verified that the solution steps support its indexed option.
- Replaced the duplicate ticket-fee equation MAT-0112 with a supplementary-angle problem, correcting its unit and knowledge-point labels.
- Corrected MAT-0114 from algebra/equation metadata to function evaluation; retained its valid substitution solution.
- Recalibrated direct fraction, percentage, substitution, and capacity-division items to foundational difficulty while retaining multi-step problems as intermediate.
- Added item-level guards for all ten keys, calculation clues, three-step solutions, teacher tips, difficulty labels, and the metadata changes.

## Verification

- Full `npm test` passed across all 6,108 records; duplicate/template, key, and official answer checks passed with zero mismatches.
- Randomized test passed 10,000 rounds / 100,000 picks with zero within-round repeats; `npm run build` and `git diff --check` passed.
- AI-assisted audit only; qualified teacher review, remaining bank ranges, and production deployment remain outstanding.
