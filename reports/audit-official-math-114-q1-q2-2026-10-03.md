# Official 114 Math constructed-response audit: Q1–Q2

- Compared OFF-0960 and OFF-0961 with the original 114 Math paper pages 10–11.
- OFF-0960: rewrote OCR-flattened formulas and the age-group table as accessible text. Rechecked the adjustment multipliers and simultaneous equations: 0.5; then 18% and 30%. Since all answer-critical table values are now included in the prompt, removed the redundant whole-page scans.
- OFF-0961: rechecked the least-common-multiple calculation and the odd-layer equation. `lcm(16, 18) = 144`, so the first A layer has 9 pieces; the package ratio condition yields `n = 59/5`, not an integer, so the papers cannot all be used exactly. Replaced the two whole-page scans with one focused crop of the original tiling diagram.
- Added validator assertions for text-complete Q1, the focused Q2 figure, and the offline asset cache.
- Verification: `npm test` passes for 6,108 records, 6,108 unique IDs, 10,000 randomized rounds without within-round repeats, quality/answer checks, and all five 110–114 official answer-table audits. `npm run build` succeeds.
- This is source/AI review, not credentialed teacher sign-off. The remaining five-subject content review, independent teacher approval, production deployment, and live verification remain open.
