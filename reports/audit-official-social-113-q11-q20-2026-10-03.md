# Official 113 Social Studies Q11–20 Audit

- Reviewed OFF-0781–0790 against original 113 Social Studies exam pages 3–5 and official answer keys.
- Official answer sequence Q11–20: C, B, C, D, C, C, A, C, D, A; all indices match the official key.
- Q11–14: checked the medium-of-exchange comparison table, Constitutional Interpretation No. 748, minor's transaction/legal capacity, and fresh-vs-frozen mangosteen import scenario. The table and scenario needed by each item are fully transcribed into the question text.
- Q15–18: checked source visuals and reasoning for coastal land-use change, regional life-expectancy/population scatter plot, Japan winter monsoon snow, and the Tarim Basin railway ring. Answers and explanation align with the figures.
- Q19: checked both sides of the Cuban Missile Crisis letter exchange; the rewritten stem preserves the reciprocal claims needed to identify the Soviet Union and United States.
- Q20: checked the two geocentric/heliocentric diagrams and the medieval European consensus; the item needs the diagrams, but not a full-page scan.
- Found the source SVGs for Q15–18 and Q20 embed original page images that were missing from the service-worker cache. Added p5 and p6 source pages to the offline asset list. Regression checks now lock answer sequence, item teaching fields, required image/SVG page dependencies and no redundant scans for text-only questions.
- `npm test`, `git diff --check`, and static PWA build pass. Full randomized checks confirmed no within-round duplicates in 100,000 draws; all five 1,000-item subject banks and official key comparisons pass.
- Sources: [official 113 Social Studies exam index](https://cap.rcpet.edu.tw/exam/113/113exam.html); [official answer table](https://cap.rcpet.edu.tw/exam/113/113_answer.html).
- Limitation: source-based AI review only; no named qualified-teacher sign-off.
