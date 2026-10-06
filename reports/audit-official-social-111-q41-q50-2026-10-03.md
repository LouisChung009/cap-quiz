# Official 111 Social Studies Q41–50 Audit

- Reviewed OFF-0383–0392 against original 111 Social Studies exam pages 10–13, required map/chart items, and the official answer table.
- Official answer sequence Q41–50: B, D, A, B, B, A, A, B, C, D; all indices match the answer table.
- Q41–43: checked the Japan-centered WWII legend, the three-country trade arrows, and the Korean War propaganda cartoon.
- Q42 defect repaired: the arrows show exports from 甲 to 乙 and from 丙 to 甲. The prior solution incorrectly claimed that 甲 exported to both partners; it now correctly connects 甲's depreciation against 乙 with exports and its appreciation against 丙 with imports.
- Q44–45: verified the shared 1855–1859 Taiwan port-trade passage is fully included in both text-only questions; the distinction between formal opening and actual foreign trade, and the 郊商's interests, is retained.
- Q46–48: verified the shared 「墘」 place-name passage and the separate distribution map, land-use map, and historical waterbody/river-overlay figures. Q48 retains both maps needed to answer it.
- Q49–50: verified the complete shared coffee-culture and South Korean school-sales passage is transcribed, with no redundant exam-page screenshots.
- Added regression checks for answer keys, solution completeness, figure assets and offline caching, text-only rendering, complete shared-passage evidence, and Q42's directional reasoning.
- `npm test` and `git diff --check` pass. The broader checks cover five 1,000-item banks, 6,108 mission items with unique IDs, official key matches, and 100,000 randomized draws without within-round repeats.
- Sources: [111 official exam index](https://cap.rcpet.edu.tw/exam/111/111exam.html); [111 answer table](https://www.grow22.com/download/111/111P_Answer-7.pdf).
- Limitation: source-based AI review is not named/credentialed teacher sign-off. Q36 in the preceding batch remains a candidate for teacher review due to its map-based opportunity-cost wording.
