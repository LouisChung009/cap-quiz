# English Authored-Bank Follow-up: ENG-0351–0360

Date: 2026-10-04

## Findings and repairs

- Replaced eight near-identical comparative-form drills (ENG-0351–0356 and ENG-0359–0360) with distinct notice comprehension, reason/contrast connectors, conversational willingness, passive voice, deadline reasoning, environmental vocabulary, and lab-safety reading tasks.
- Kept the two already evidence-based data/time questions (ENG-0357–0358) and added them to the batch regression guard.
- Corrected the affected unit/knowledge-point labels, explanations, worked steps, distractors, teacher tips, vocabulary hints, and common-mistake notes; recalibrated straightforward items to foundational/intermediate difficulty.
- Added regression checks for all ten IDs: answer index, difficulty, clue coverage, four options, solution, teacher tip and vocabulary; the eight replacements are guarded against reintroducing the same comparative-fill-in template.

## Verification

- `npm test` passed across five 1,000-question authored banks and 1,108 official/similar records (6,108 total); all IDs unique.
- Randomized test passed 10,000 rounds / 100,000 picks with no within-round repeats; answer positions are balanced, quality/template and answer-consistency checks pass.
- Official answer-key checks reported zero mismatches; `npm run build` and `git diff --check` passed.
- AI-assisted review only; qualified teacher sign-off, remaining bank audits, and production deployment remain outstanding.
