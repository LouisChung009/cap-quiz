# Official 113 Science Q21–30 Audit

- Source checked against the official 113 Science examination scans, pp. 6–8 (`assets/official-exams/113-science-p6.webp` through `p8.webp`).
- Questions Q21–30 (OFF-0845–OFF-0854) checked for completeness, wording, answer index, and explanatory reasoning.
- Repaired scan-dependent prompts as self-contained text, transcribed all numerical data, and added calculation/reasoning steps and teacher reminders.
- Q21 germination rates independently recalculated: 20%, 20%, and approximately 22.9%; answer A.
- Q24 eclipse observation, Q25 rock cycle, Q26 grounding, Q27 heating curve, and Q28 air circulation classifications compared with original source. Q28 retains answer B: the original intentionally misclassifies the Pacific High-pressure area as an inward-flow example; it is moved to the outward-flow category. Typhoon remains inward-flow and Mongolian continental cold-air mass remains outward-flow.
- Q29 preserved both residual-chlorine tables and explained the need for a same-temperature baseline when assessing the heating effect.
- Automated checks: `npm test` passed across 6,108 questions; 100,000 randomized draws had no within-round repeats; all 1,098 official answer-index checks passed. This is source-based review, not credentialed teacher sign-off.
- 2026-10-06 source recheck against original scan pages 6–8 found the Q28 label had been mistranscribed as “太平洋暖氣團範圍”; the official page says “太平洋高氣壓範圍”. Updated its stem, options, explanation, and steps while preserving answer B.
- Added `scripts/validate-official-science-113-q21-q30.mjs` to check official keys, all four choices and worked steps, germination data, heating-curve setup, Q28 source term, and both chlorine tables. It is invoked by the 113 Science Q1–10 validation chain.
