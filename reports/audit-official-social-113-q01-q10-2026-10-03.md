# Official 113 Social Studies Q1–10 Audit

- Reviewed OFF-0771–0780 against original 113 Social Studies exam pages 1–3 and official answer keys.
- Official answer sequence Q1–10: B, A, B, A, B, C, D, C, A, C; all indices match the official key.
- Q1–2: checked the full question context on out-of-grade food produce and Visegrád Group trade exposure; both stems contain sufficient data for the policy inference.
- Q3–4: verified the contour-map item and global language-use chart against the original scan. The corresponding map/chart are separate visuals; their underlying page image is now included in offline cache so the SVG wrappers render without network access.
- Q5–6: checked the 72-village alliance/settler conflict context and the Boxer Rebellion lyric excerpt against the original paper.
- Q7: found the four answer choices were reduced to text names despite being depicted as script samples in the source. Restored the source scan crop containing the four visual choices while retaining readable option labels.
- Q8–10: verified the Japanese quarantine institution clues, Dutch East India Company/Chinese settler land-development passage, and child/youth protection law content.
- Added regression checks for key sequence, four choices, solution and teacher-tip fields, Q7's source crop dimensions, required page-image offline assets, and absence of redundant full-page scans for text-only items.
- `npm test`, `git diff --check`, and static PWA build pass. Full randomized checks confirmed no within-round duplicates across 100,000 draws; all five 1,000-item subject banks and official key comparisons pass.
- Sources: [official 113 Social Studies exam index](https://cap.rcpet.edu.tw/exam/113/113exam.html); [official answer table](https://cap.rcpet.edu.tw/exam/113/113_answer.html).
- Limitation: source-based AI review only; no named qualified-teacher sign-off.
