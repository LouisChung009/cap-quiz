# Official Mathematics audit: 112年選擇題 Q1–10

- Compared the ten multiple-choice items with official paper pages 2–5 (`assets/official-exams/112-math-p2.webp` through `p5.webp`), including displayed numerical conditions, answer choices, and any required diagram.
- Rechecked calculations and reasoning: signed powers; difference of squares; front-view block projection; radical simplification; line substitution; ordering negative mixed numbers; coordinate inequalities from the graph; parallel-line/triangle angles; counting factors divisible by 18; and the quadratic formula.
- Found OFF-0534 (Q3) unnecessarily displayed the full page scan even though the focused diagram `112-math-q03-figure.png` exists. Switched it to the focused image and added an assertion that rejects the page scan and verifies the cropped asset is precached.
- Replaced generic teacher tips for OFF-0534 and OFF-0536–0539 with question-specific guidance; added regression checks for these tips.
- `npm test` and `git diff --check` pass. This is source-based AI review of Q1–10 multiple-choice items, not qualified teacher sign-off; constructed-response items and all other bank ranges remain subject to review.
