# Official 113 English Q31–43 Audit

- Reviewed OFF-0733–0745 against original official 113 English exam pages 7–14 and the official answer table.
- Official answer sequence Q31–43: D, A, A, B, A, B, B, C, C, A, B, B, D; every answer index matches the official key.
- Q31–32: checked the complete Cotoha book-repair passage and the owner's memory of his teacher; both questions are answerable from the displayed text without a scan.
- Q33–35: checked the complete Habibi & Hawara passage, map/context, refugee employment purpose, employee buyout plan, and idiom `beg to differ`; the map is not needed for these questions.
- Q36–39: checked the complete Voices of People passage, the extinct frog's proposed medical relevance, the author's uncertainty, the dead-egg result, and Dr. Wang's closing quotation. Q39 asks what Zimmer most likely thinks; its answer is about the lack of demonstrated possibility, not a categorical scientific claim that de-extinction is impossible.
- Q40–43: checked the full pandemic passage and all answer choices. Restored standalone original chart for Q41 only; its chart asset remains in the service-worker offline cache. Text-based items do not show redundant full-page scans.
- Added regression checks for answer indices, full reading-material anchors, four options, teaching/explanation fields, text-only display, and Q41 chart/offline asset.
- `npm test` passes, including all five 1,000-question banks, 6,108 unique mission IDs, 100,000 randomized draws with no within-round duplicates, and official key checks. `git diff --check` passes.
- Static PWA build passes; `public/` output generated successfully.
- Sources: [official 113 English exam index](https://cap.rcpet.edu.tw/exam/113/113exam.html); [official answer table](https://cap.rcpet.edu.tw/exam/113/113_answer.html).
- Limitation: source-based AI review only; no named qualified-teacher sign-off.
