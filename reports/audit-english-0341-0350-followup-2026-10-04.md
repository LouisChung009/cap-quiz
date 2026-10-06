# English Authored-Bank Follow-up: ENG-0341–0350

Date: 2026-10-04

## Findings and repairs

- Replaced four repetitive comparative-adjective drills (ENG-0341, 0343, 0347, 0348) with distinct functional-reading, indirect-question, practical-decision, and cause/effect connector items.
- Corrected matching grade/unit/knowledge-point metadata, distractors, answer indexes, worked explanations, vocabulary, and item-specific common-mistake notes for the rewritten questions.
- Recalibrated ENG-0345 and ENG-0350 from advanced to intermediate; both require direct evidence comparison rather than multi-step advanced inference.
- Rebalanced English answer positions while preserving correctness by moving the correct options for ENG-0001, 0048, 0103, 0134, 0149, 0155, 0161, 0168, 0261, 0343, 0347, and 0350; synchronized affected regression expectations.
- Added specific checks for ENG-0341–0350 answer indexes, difficulty, four-option structure, solution clues, teacher tips, vocabulary hints, and anti-template/common-mistake requirements.

## Verification

- `npm test` passed across five 1,000-question authored banks and 1,108 official/similar records (6,108 total); all IDs unique.
- Randomized testing passed 10,000 rounds / 100,000 picks with no within-round repeats; quality/template and answer-consistency checks passed.
- Official answer-key checks reported zero mismatches; `npm run build` and `git diff --check` passed.
- This is AI-assisted review, not qualified teacher sign-off; the broader five-bank audit, teacher verification, and production deployment remain open.
