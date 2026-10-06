# English Authored-Bank Follow-up: ENG-0321–0330

Date: 2026-10-03

## Findings and repairs

- Followed up the existing key/template audit with a full review of contexts, reasoning, distractors, and difficulty.
- Replaced copied-stem English solution boilerplate for ENG-0321–0325 with Chinese item-specific worked steps.
- Improved ENG-0324's distractors to represent realistic indirect-question errors: inversion, an incomplete clause, and subject–verb disagreement.
- Replaced the repetitive comparative-form drills in ENG-0326–0328 with distinct two-value interpretation tasks: bridge-length difference, river-width difference, and temperature inference. Preserved their keyed answer positions and updated knowledge-point metadata and worked calculations.
- Recalibrated single-step quantity, time, modal, label, and arrival-time items as foundational where appropriate; ENG-0330 was previously mislabeled advanced despite a direct 30-minute subtraction.
- Rewrote ENG-0329–0330 steps and tips in Chinese, and added item-specific key, clue, difficulty, option-count, solution, and vocabulary regression checks.

## Verification

- Full `npm test` passed on five 1,000-question banks and 1,108 official/similar records (6,108 total, unique IDs).
- 10,000 simulated rounds / 100,000 picks completed with zero within-round repeats.
- Duplicate-template and official answer-key checks passed with zero mismatches.
- Static PWA build succeeded; generated refs match English data `4.6.101`, app `7.5.147`, stylesheet `7.5.120`, and service worker `7.5.159`.
- This is AI-assisted review, not qualified teacher sign-off; the broader audit and production deployment remain open.
