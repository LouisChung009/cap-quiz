# Official 111 Social Studies Q21–30 Audit

- Reviewed OFF-0363–0372 against original 111 Social Studies exam pages 5–7 and the official answer table.
- Official answer sequence Q21–30: B, D, D, B, C, B, D, D, D, B; all answer indices match the official key.
- Q21–25: checked the Portuguese introduction of tempura, Lenin's sealed-train return, the reporter-licence/news-freedom figures, election-qualification table, and legislative questioning of a Judicial Yuan justice nominee.
- Q26–28: checked the composite route/elevation profile over the Alps, the Jilin/Russia port map and Arctic-route rationale, and the world population-density regions. Each needed figure is a standalone image and cached offline.
- Q29–30: checked the full Taipei heatwave definition and monthly-temperature table, and the Tianjin New Year newspaper report with its Republic-era flags, anti-Japanese slogans, and date clues.
- Added regression checks for answer sequence, teaching fields, required figure assets/offline cache, text-only item rendering, the Q23 press-freedom data, and the Q29 threshold data.
- `npm test`, `git diff --check`, and static PWA build pass. Full randomized checks confirmed no within-round duplicates in 100,000 draws; all five 1,000-item subject banks and official answer comparisons pass.
- Sources: [111 answer table (main exam)](https://www.grow22.com/download/111/111P_Answer-7.pdf); [official 111 exam index](https://cap.rcpet.edu.tw/exam/111/111exam.html).
- Limitation: source-based AI review only; no named qualified-teacher sign-off.
