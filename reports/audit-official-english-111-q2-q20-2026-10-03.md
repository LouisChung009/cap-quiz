# 111 English Q2–20 Source Audit

- Source checked: original paper pages 1–3, preserved locally as `assets/official-exams/111-english-p2.webp` and `assets/official-exams/111-english-p3.webp`.
- Scope: OFF-0276–OFF-0294, including all 19 stems, four-option sets, explanations, and answer references.
- Finding: the repair script unconditionally replaced all teacher tips with one shared generic sentence. This made question-specific feedback regress each time the script ran, even though the runtime validators did not catch it.
- Repair: replaced the shared overwrite with 19 item-specific language/grammar reminders and matching vocabulary or near-synonym notes; adjusted the repair guard to accept a keyed explanation for Q20's sentence-length options.
- Regression protection: assert year/question metadata, four options, per-item concept clue, at least three related terms, solution steps, and 19 unique tips. The full test suite passes.
- Validation: all five 1,000-question banks, 1,098 official questions, 10 similar questions, 6,108 unique records, 100,000 randomized picks without within-round repetition, content/template checks, and five-year key checks pass. Production PWA build and `git diff --check` pass.
- Limitation: this is source-based review, not sign-off by a qualified human English teacher.
