# Mathematics Authored-Question Audit: MAT-0531–0540

## Outcome

Recomputed all answer keys. Replaced repeated map-scale and shadow-similarity contexts in MAT-0532 and MAT-0534 with inverse proportion and rhombus-diagonal area. Recalibrated MAT-0537's direct triangle-angle calculation to foundational difficulty.

## Answer-key recomputation

| ID | Recomputed result | Index |
|---|---:|---:|
| MAT-0531 | 8 sides | 0 |
| MAT-0532 | y = 6 | 1 |
| MAT-0533 | 0.36 L | 2 |
| MAT-0534 | 120 cm² | 3 |
| MAT-0535 | 70 km/h | 0 |
| MAT-0536 | 35 | 1 |
| MAT-0537 | 65° | 2 |
| MAT-0538 | 170 cm² | 3 |
| MAT-0539 | 10 cm rise | 0 |
| MAT-0540 | 20 tickets | 1 |

## Quality controls

- Added ten item-level regression assertions covering answer index, difficulty, unit, knowledge point, worked-step clue, and teacher tip.
- Full `npm test` passed across 6,108 records; 100,000 randomized picks had no within-round repeats; content-template checks passed; extracted official keys for 110–114 had zero mismatches.
- `git diff --check` passed.

## Remaining gate

External teacher sign-off and production deployment are not verified by this internal audit.
