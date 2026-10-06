# Official 111 Social Studies Q11–20 Audit

- Reviewed OFF-0353–0362 against original 111 Social Studies exam pages 3–5 and the official 111 answer table.
- Official answer sequence Q11–20: B, A, B, C, D, C, B, C, C, A; every answer index matches the official key.
- Q11–14: checked the price-discount advertisement, birth-cohort fertility chart, four-person nationality table, and EU/Taiwan animal-welfare policy comparison. The table-based question transcribes all four students and their decisive fields.
- Q15–18: checked the U.S. climate-region comparison map, Borneo forest coverage maps, precision-agriculture tea scenario, and four cape locations/coordinates. The source image assets are present and service-worker cached.
- Q19–20: checked the distinction between historical fact and interpretation, and the historical newspaper clues (Monga, Longshan Temple, Takao, currency wording) used to date the reports.
- Added regression checks for answer sequence, four choices, full solution/teacher fields, required four figures/offline assets, and complete/non-image presentation for text items.
- `npm test`, `git diff --check`, and static PWA build pass. Full randomized checks confirmed no within-round duplicates in 100,000 draws; all five 1,000-item subject banks and official answer comparisons pass.
- Sources: [111 answer table (main exam)](https://www.grow22.com/download/111/111P_Answer-7.pdf); [official exam index](https://cap.rcpet.edu.tw/exam/111/111exam.html).
- Limitation: source-based AI review only; no named qualified-teacher sign-off.
