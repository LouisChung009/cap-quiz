# English Authored-Bank Follow-up: ENG-0311–0320

Date: 2026-10-03

## Findings and repairs

- Rechecked answer indexes and matched the explanations to the live option text.
- Replaced the copied-stem explanation scaffolding with question-specific Chinese reasoning steps and explanations for all ten items.
- Recalibrated the single-word-form, notice lookup, and message-detail items from intermediate to foundational difficulty where appropriate.
- ENG-0320 contained the ungrammatical distractor “while of”; replaced it with grammatical alternatives (`while`, `after`, `before`) and rewrote the explanation and tips to compare their temporal meanings accurately.
- Added regression guards for answer keys, calibrated difficulty, clue coverage, four options, three Chinese solution steps, vocabulary hints, and the removed malformed distractor.

## Verification

- Full `npm test` passed across all 5,000 authored questions and 1,108 official/similar records (6,108 total, unique IDs).
- 10,000 simulated rounds / 100,000 picks completed with zero within-round repeats.
- Duplicate-template checks and all extracted official answer-key comparisons passed; mismatches: zero.
- Static PWA build succeeded; generated `public/` references match English data `4.6.100`, app `7.5.146`, stylesheet `7.5.120`, and service worker `7.5.158`.
- AI-assisted review only; qualified teacher approval, remaining item ranges, and production deployment remain outstanding.
