# Official 111 Social Studies Q51–54 Audit

- Reviewed OFF-0393–0396 against original 111 Social Studies exam pages 13–14 and the official answer table.
- Official answer sequence Q51–54: C, A, B, A; all indices match the answer table.
- Q51: checked the shared coffee/caffeine passage and the analogy between South Korea's school-sales law and Taiwan's child-protection rules.
- Q52–54: checked the full London coal-smog/industrial-era passage, health and class-disparity evidence, and the city compass diagram. Q53's image is present as a standalone figure and cached offline; the solution now explicitly derives west-to-east pollutant movement from the text's European westerlies.
- Confirmed text-only rendering for Q51, Q52, and Q54; no redundant full exam-page image is attached.
- Added regression checks for batch size, keys, teaching fields, full shared passage cues, Q53 figure/offline cache, and wind-direction reasoning.
- `npm test` and `git diff --check` pass. The broader checks cover five 1,000-item banks, 6,108 mission items with unique IDs, official key matches, and 100,000 randomized draws without within-round repeats.
- Sources: [111 official exam index](https://cap.rcpet.edu.tw/exam/111/111exam.html); [111 answer table](https://www.grow22.com/download/111/111P_Answer-7.pdf).
- Limitation: this is source-based AI review, not named/credentialed teacher sign-off.
