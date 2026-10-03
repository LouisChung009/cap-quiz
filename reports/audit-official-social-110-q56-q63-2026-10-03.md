# Official 110 Social Studies Q56–63 Audit

- Checked OFF-0171–0178 against the official paper scans: 110 Social Studies pp. 12–14 (`assets/official-exams/110-social-p13.webp` through `p15.webp`).
- Rechecked all shared reading passages, item wording, answer indices, explanations, and required visual assets.
- Fixed Q57's missing stimulus formatting cue: the original asks about the double-underlined heritage site, but the previous text omitted which site was underlined. The shared prompt now explicitly marks Sanchi as the original double-underlined location; the question and replayable repair script agree.
- Confirmed Q56–57's Marshall/Sanchi passage supports India and early Buddhist architecture; Q58–60's clouded-leopard passage includes the habitat-filter criteria and the necessary map options; Q61–63's FAO/food-waste passage contains the data needed to distinguish global food distribution/waste from total supply and select the most directly relevant action.
- Answer indices checked against the official key: Q56–63 = A, B, C, B, A, C, C, D.
- Verification after changes: `npm test` covers 6,108 records, 6,108 unique IDs, randomized sampling without within-round repeats, question quality, and official-key consistency. Teacher credentialed sign-off and deployment/live validation remain outstanding.
